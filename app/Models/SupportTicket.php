<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'ticket_number',
        'category',
        'subject',
        'message',
        'status',
        'priority',
        'attachment_path',
        'admin_notes',
        'last_reply_at',
    ];

    protected $casts = [
        'last_reply_at' => 'datetime',
    ];

    public static $categories = [
        'payment_billing'      => 'Payment & Billing',
        'book_publishing'      => 'Book Publishing',
        'ai_writing_tool'      => 'AI Writing Tool',
        'professional_services'=> 'Professional Services',
        'account_profile'      => 'Account & Profile',
        'general'              => 'General Inquiry',
    ];

    public static $statuses = [
        'open'        => 'Open',
        'in_progress' => 'In Progress',
        'closed'      => 'Closed',
    ];

    public static $priorities = [
        'low'    => 'Low',
        'normal' => 'Normal',
        'urgent' => 'Urgent',
    ];

    protected static function booted()
    {
        static::creating(function ($ticket) {
            $ticket->ticket_number = 'TKT-' . strtoupper(\Illuminate\Support\Str::random(8));
        });
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SupportTicketReply::class)->orderBy('created_at', 'asc');
    }

    public function getCategoryLabelAttribute(): string
    {
        return self::$categories[$this->category] ?? ucfirst($this->category);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'open'        => 'green',
            'in_progress' => 'yellow',
            'closed'      => 'gray',
            default       => 'blue',
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'urgent' => 'red',
            'normal' => 'blue',
            'low'    => 'gray',
            default  => 'blue',
        };
    }
}
