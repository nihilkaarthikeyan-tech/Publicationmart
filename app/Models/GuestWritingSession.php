<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GuestWritingSession extends Model
{
    protected $fillable = [
        'session_token',
        'email',
        'full_name',
        'plan_type',
        'plan_name',
        'amount_paid',
        'payment_status',
        'language',
        'title',
        'subtitle',
        'author_name',
        'genre',
        'about_book',
        'chapters_data',
        'image_credits_used',
        'image_credits_limit',
        'current_step',
        'is_completed',
        'exported_at',
        'user_id',
        'book_id',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'chapters_data' => 'array',
        'amount_paid' => 'decimal:2',
        'is_completed' => 'boolean',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'exported_at' => 'datetime',
    ];

    /**
     * Generate a unique session token
     */
    public static function generateToken(): string
    {
        return Str::uuid()->toString();
    }

    /**
     * Get user associated with this session
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get book if this session was converted to a real book
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Check if session is valid (paid and not expired)
     */
    public function isValid(): bool
    {
        if ($this->payment_status !== 'paid') {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Scope for paid sessions
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope for unlinked sessions (not yet connected to a user)
     */
    public function scopeUnlinked($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Get image limit based on plan
     */
    public static function getImageLimitByPlan(string $planName): int
    {
        return match ($planName) {
            '80-100' => 15,
            '100-150' => 20,
            '150-200' => 30,
            '200-300', '300+' => 45,
            default => 15
        };
    }

    /**
     * Get price based on plan type and page range
     */
    public static function getPlanPrice(string $planType, string $pageRange): int
    {
        // New Plan Structure (Auto-determined by plan type mostly)
        $prices = [
            'saver' => 2999,
            'standard' => 3499,
            'pro' => 3999,
            'enterprise' => 4499,
        ];

        // Fallback for legacy calls or specific overrides if needed
        return $prices[$planType] ?? 2999;
    }
}
