<?php

namespace App\Mail;

use App\Models\Book;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookRejectionNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Book $book) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Revision Requested for '{$this->book->title}'",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.book-rejection',
            with: [
                'book' => $this->book,
                'title' => $this->book->title,
                'author_name' => $this->book->author_name,
                'feedback' => $this->book->admin_feedback,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
