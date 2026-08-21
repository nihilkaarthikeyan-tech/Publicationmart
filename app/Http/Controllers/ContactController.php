<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // 1. Store in Database
        $inquiry = \App\Models\ContactInquiry::create($validated);

        // 2. Send Email
        try {
            \Illuminate\Support\Facades\Mail::to('editor.publicationmart@gmail.com')
                ->send(new \App\Mail\ContactFormSubmitted($inquiry));
        } catch (\Exception $e) {
            // Log error but don't fail the user request
            \Illuminate\Support\Facades\Log::error('Contact Email Failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Message sent successfully! We will get back to you soon.');
    }
}
