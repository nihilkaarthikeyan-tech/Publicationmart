<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;
    public $buyerName;
    public $shippingDetails;

    /**
     * Create a new message instance.
     */
    public function __construct(Transaction $transaction, $buyerName = 'Customer')
    {
        $this->transaction = $transaction;
        $this->buyerName = $buyerName;
        // Decode shipping details
        $this->shippingDetails = json_decode($transaction->notes, true) ?? [];
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address(config('mail.from.address'), config('app.name') . ' Orders'),
            replyTo: [
                new \Illuminate\Mail\Mailables\Address(config('mail.from.address'), 'Support')
            ],
            subject: 'Order Confirmation - #' . $this->transaction->transaction_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.confirmation',
            text: 'emails.orders.confirmation_text' // Include Plain Text version
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
