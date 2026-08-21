<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PresaleOtp extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $blogTitle;

    /**
     * Create a new message instance.
     */
    public function __construct($otp, $blogTitle = null)
    {
        $this->otp = $otp;
        $this->blogTitle = $blogTitle;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Presale Booking Verification Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.presale_otp',
            text: 'emails.presale_otp.text', // Ensure this points to the correct blade view
        );
    }
}
