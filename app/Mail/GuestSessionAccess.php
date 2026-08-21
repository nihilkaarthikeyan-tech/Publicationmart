<?php

namespace App\Mail;

use App\Models\GuestWritingSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestSessionAccess extends Mailable
{
    use Queueable, SerializesModels;

    public $session;

    public function __construct(GuestWritingSession $session)
    {
        $this->session = $session;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Access Your Smart Writer Book: ' . ($this->session->title ?? 'Untitled'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest_session_access',
        );
    }
}
