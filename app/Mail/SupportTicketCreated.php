<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportTicketCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SupportTicket $ticket,
        public bool $isAdminCopy = false
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isAdminCopy
            ? "[New Support Ticket] #{$this->ticket->ticket_number} – {$this->ticket->subject}"
            : "Support Ticket #{$this->ticket->ticket_number} Received";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support-ticket-created',
            with: [
                'ticket'      => $this->ticket,
                'isAdminCopy' => $this->isAdminCopy,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
