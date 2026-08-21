<?php

namespace App\Http\Controllers;

use App\Models\PublishingInquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublishingInquiryController extends Controller
{
    // Public: Show the inquiry form
    public function create(Request $request)
    {
        return Inertia::render('PublishingInquiry', [
            'selectedPlan' => $request->query('plan', ''),
        ]);
    }

    // Public: Store inquiry
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'whatsapp' => 'nullable|string|max:30',
            'book_type' => 'required|in:fiction,non-fiction,textbook,other',
            'book_title' => 'required|string|max:255',
            'interested_plan' => 'required|in:silver,gold,diamond,platinum,prestige,signature',
            'terms_accepted' => 'required|accepted',
        ]);

        unset($validated['terms_accepted']);

        PublishingInquiry::create($validated);

        return redirect()->route('publishing-inquiry.create')
            ->with('success', 'Thank you! Your inquiry has been submitted successfully. Our team will contact you shortly.');
    }

    // Admin: List all inquiries
    public function adminIndex(Request $request)
    {
        $query = PublishingInquiry::query()->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('plan') && $request->plan !== 'all') {
            $query->where('interested_plan', $request->plan);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('book_title', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/PublishingInquiries', [
            'inquiries' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'status' => $request->status ?? 'all',
                'plan' => $request->plan ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    // Admin: Update inquiry status
    public function adminUpdateStatus(Request $request, PublishingInquiry $inquiry)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,in-progress,completed,cancelled',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $inquiry->update($validated);

        return back()->with('success', 'Inquiry status updated successfully.');
    }

    // Admin: Delete inquiry
    public function adminDestroy(PublishingInquiry $inquiry)
    {
        $inquiry->delete();

        return back()->with('success', 'Inquiry deleted successfully.');
    }
}
