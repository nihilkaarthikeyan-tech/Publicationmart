<?php

namespace App\Mail;

use App\Models\ProfessionalServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfessionalRequestStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProfessionalServiceRequest $serviceRequest,
        public ?string $adminNotes = null
    ) {
    }

    public function envelope(): Envelope
    {
        $statusLabel = ucfirst(str_replace('_', ' ', $this->serviceRequest->status));
        return new Envelope(
            subject: "Update on Your Request: {$this->serviceRequest->getServiceDisplayName()} is {$statusLabel}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.professional-request-status',
            with: [
                'request' => $this->serviceRequest,
                'status' => $this->serviceRequest->status,
                'serviceName' => $this->serviceRequest->getServiceDisplayName(),
                'adminNotes' => $this->adminNotes,
                'formattedFile' => $this->serviceRequest->formatted_file,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
