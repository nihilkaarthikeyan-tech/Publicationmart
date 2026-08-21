<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportTicketReplied extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SupportTicket $ticket,
        public string $replyMessage,
        public bool $isAdminReply = true
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isAdminReply
            ? "Reply to Your Support Ticket #{$this->ticket->ticket_number}"
            : "[Support Ticket #{$this->ticket->ticket_number}] User Replied";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.support-ticket-replied',
            with: [
                'ticket'       => $this->ticket,
                'replyMessage' => $this->replyMessage,
                'isAdminReply' => $this->isAdminReply,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
