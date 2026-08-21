<?php

namespace App\Http\Controllers\SupportAgent;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Mail\SupportTicketReplied;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Support Agent Dashboard — all tickets with filters + stats.
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $tickets = $query->paginate(20)->through(fn($t) => [
            'id'             => $t->id,
            'ticket_number'  => $t->ticket_number,
            'subject'        => $t->subject,
            'name'           => $t->name,
            'email'          => $t->email,
            'category'       => $t->category,
            'category_label' => $t->category_label,
            'status'         => $t->status,
            'status_color'   => $t->status_color,
            'priority'       => $t->priority,
            'priority_color' => $t->priority_color,
            'last_reply_at'  => $t->last_reply_at?->diffForHumans(),
            'created_at'     => $t->created_at->format('d M Y'),
            'user'           => $t->user ? ['name' => $t->user->name] : null,
        ]);

        $stats = [
            'total'       => SupportTicket::count(),
            'open'        => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'closed'      => SupportTicket::where('status', 'closed')->count(),
            'urgent'      => SupportTicket::where('priority', 'urgent')->where('status', '!=', 'closed')->count(),
        ];

        return Inertia::render('SupportAgent/Dashboard', [
            'tickets'    => $tickets,
            'stats'      => $stats,
            'categories' => SupportTicket::$categories,
            'filters'    => $request->only(['status', 'priority', 'category', 'search']),
            'agent'      => Auth::user(),
        ]);
    }

    /**
     * Show a single ticket with full reply thread.
     */
    public function show(SupportTicket $ticket)
    {
        $ticket->load('replies.user', 'user');

        return Inertia::render('SupportAgent/Show', [
            'ticket' => [
                'id'              => $ticket->id,
                'ticket_number'   => $ticket->ticket_number,
                'subject'         => $ticket->subject,
                'name'            => $ticket->name,
                'email'           => $ticket->email,
                'category'        => $ticket->category,
                'category_label'  => $ticket->category_label,
                'message'         => $ticket->message,
                'status'          => $ticket->status,
                'status_color'    => $ticket->status_color,
                'priority'        => $ticket->priority,
                'priority_color'  => $ticket->priority_color,
                'admin_notes'     => $ticket->admin_notes,
                'attachment_path' => $ticket->attachment_path,
                'created_at'      => $ticket->created_at->format('d M Y, h:i A'),
                'user'            => $ticket->user ? [
                    'id'    => $ticket->user->id,
                    'name'  => $ticket->user->name,
                    'email' => $ticket->user->email,
                ] : null,
                'replies'         => $ticket->replies->map(fn($r) => [
                    'id'              => $r->id,
                    'message'         => $r->message,
                    'is_admin'        => $r->is_admin,
                    'attachment_path' => $r->attachment_path,
                    'author_name'     => $r->is_admin
                        ? 'Support Team'
                        : ($r->user?->name ?? $ticket->name),
                    'created_at'      => $r->created_at->format('d M Y, h:i A'),
                ]),
            ],
            'statuses'   => SupportTicket::$statuses,
            'priorities' => SupportTicket::$priorities,
            'agent'      => Auth::user(),
        ]);
    }

    /**
     * Post a reply as "Support Team" — emails the user.
     */
    public function reply(Request $request, SupportTicket $ticket)
    {
        if ($ticket->status === 'closed') {
            return back()->with('error', 'This ticket is closed. Reopen it before replying.');
        }

        $validated = $request->validate([
            'message'    => 'required|string|min:5|max:5000',
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('support-attachments', 'public');
        }

        SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id'           => Auth::id(),
            'message'           => $validated['message'],
            'is_admin'          => true,    // renders as "Support Team" to the user
            'attachment_path'   => $attachmentPath,
        ]);

        $ticket->update([
            'status'        => 'in_progress',
            'last_reply_at' => now(),
        ]);

        // Notify user by email
        try {
            Mail::to($ticket->email)->send(
                new SupportTicketReplied($ticket, $validated['message'], true)
            );
        } catch (\Exception $e) {
            \Log::error('Agent reply email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Reply sent to user.');
    }

    /**
     * Update ticket status, priority, or internal notes.
     */
    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status'      => 'nullable|in:open,in_progress,closed',
            'priority'    => 'nullable|in:low,normal,urgent',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $ticket->update(array_filter($validated, fn($v) => !is_null($v)));

        return back()->with('success', 'Ticket updated.');
    }
}
