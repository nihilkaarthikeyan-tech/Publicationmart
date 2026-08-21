<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Mail\SupportTicketCreated;
use App\Mail\SupportTicketReplied;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    public function index()
    {
        $tickets = SupportTicket::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'ticket_number'  => $t->ticket_number,
                'subject'        => $t->subject,
                'category'       => $t->category,
                'category_label' => $t->category_label,
                'status'         => $t->status,
                'status_color'   => $t->status_color,
                'priority'       => $t->priority,
                'priority_color' => $t->priority_color,
                'last_reply_at'  => $t->last_reply_at?->diffForHumans(),
                'created_at'     => $t->created_at->format('d M Y'),
            ]);

        return Inertia::render('Support/Index', [
            'tickets' => $tickets,
        ]);
    }

    public function create()
    {
        return Inertia::render('Support/Create', [
            'categories' => SupportTicket::$categories,
            'auth_user'  => Auth::user() ? [
                'name'  => Auth::user()->name,
                'email' => Auth::user()->email,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'email'      => 'required|email|max:150',
            'category'   => 'required|in:' . implode(',', array_keys(SupportTicket::$categories)),
            'subject'    => 'required|string|max:200',
            'message'    => 'required|string|min:20|max:5000',
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('support-attachments', 'public');
        }

        $ticket = SupportTicket::create([
            'user_id'         => Auth::id(),
            'name'            => $validated['name'],
            'email'           => $validated['email'],
            'category'        => $validated['category'],
            'subject'         => $validated['subject'],
            'message'         => $validated['message'],
            'attachment_path' => $attachmentPath,
            'status'          => 'open',
            'priority'        => 'normal',
        ]);

        // Notify user
        try {
            Mail::to($ticket->email)->send(new SupportTicketCreated($ticket));
        } catch (\Exception $e) {
            \Log::error('Support ticket email failed: ' . $e->getMessage());
        }

        // Notify admin
        try {
            Mail::to(config('mail.admin_address', 'editor@publicationmart.com'))
                ->send(new SupportTicketCreated($ticket, true));
        } catch (\Exception $e) {
            \Log::error('Support ticket admin email failed: ' . $e->getMessage());
        }

        return redirect()->route('support.show', $ticket->id)
            ->with('success', "Ticket #{$ticket->ticket_number} created! We'll get back to you soon.");
    }

    public function show(SupportTicket $ticket)
    {
        // Users can only view their own tickets
        if ($ticket->user_id && $ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $ticket->load('replies.user');

        return Inertia::render('Support/Show', [
            'ticket' => [
                'id'             => $ticket->id,
                'ticket_number'  => $ticket->ticket_number,
                'subject'        => $ticket->subject,
                'category'       => $ticket->category,
                'category_label' => $ticket->category_label,
                'message'        => $ticket->message,
                'status'         => $ticket->status,
                'status_color'   => $ticket->status_color,
                'priority'       => $ticket->priority,
                'priority_color' => $ticket->priority_color,
                'attachment_path'=> $ticket->attachment_path,
                'created_at'     => $ticket->created_at->format('d M Y, h:i A'),
                'replies'        => $ticket->replies->map(fn($r) => [
                    'id'             => $r->id,
                    'message'        => $r->message,
                    'is_admin'       => $r->is_admin,
                    'attachment_path'=> $r->attachment_path,
                    'author_name'    => $r->is_admin ? 'Support Team' : ($r->user?->name ?? $ticket->name),
                    'created_at'     => $r->created_at->format('d M Y, h:i A'),
                ]),
            ],
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id && $ticket->user_id !== Auth::id()) {
            abort(403);
        }

        if ($ticket->status === 'closed') {
            return back()->with('error', 'This ticket is closed. Please create a new ticket.');
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
            'is_admin'          => false,
            'attachment_path'   => $attachmentPath,
        ]);

        $ticket->update([
            'status'        => 'in_progress',
            'last_reply_at' => now(),
        ]);

        // Notify admin
        try {
            Mail::to(config('mail.admin_address', 'editor@publicationmart.com'))
                ->send(new SupportTicketReplied($ticket, $validated['message'], false));
        } catch (\Exception $e) {
            \Log::error('Support reply admin email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Reply sent successfully.');
    }

    public function close(SupportTicket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $ticket->update(['status' => 'closed']);

        return back()->with('success', 'Ticket closed.');
    }
}
