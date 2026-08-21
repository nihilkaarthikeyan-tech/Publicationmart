<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalServiceRequest extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'service_type',
        'amount',
        'payment_id',
        'status',
        'manuscript_file',
        'formatted_file',
        'user_notes',
        'admin_notes',
        'assigned_to',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user who made the request
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the associated book (optional)
     */
    public function book(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the admin assigned to this request
     */
    public function assignedAdmin(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get service type display name
     */
    public function getServiceDisplayName(): string
    {
        return match ($this->service_type) {
            'formatting' => 'Professional Formatting',
            'cover' => 'Cover Design',
            'full_package' => 'Full Package (Formatting + Cover)',
            default => ucfirst($this->service_type),
        };
    }

    /**
     * Get status display name with color
     */
    public function getStatusBadge(): array
    {
        return match ($this->status) {
            'pending_upload' => ['label' => 'Awaiting Upload', 'color' => 'yellow'],
            'pending' => ['label' => 'Pending Review', 'color' => 'blue'],
            'in_progress' => ['label' => 'In Progress', 'color' => 'indigo'],
            'completed' => ['label' => 'Completed', 'color' => 'green'],
            'cancelled' => ['label' => 'Cancelled', 'color' => 'red'],
            default => ['label' => ucfirst($this->status), 'color' => 'gray'],
        };
    }
}
