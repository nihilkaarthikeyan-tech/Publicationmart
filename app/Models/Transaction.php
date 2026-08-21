<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'book_id',
        'user_id',
        'author_id',
        'quantity',
        'transaction_id',
        'amount',
        'author_revenue',
        'platform_commission',
        'tax_amount',
        'payment_method',
        'payment_status',
        'payment_gateway',
        'payment_response',
        'sales_channel',
        'format',
        'country',
        'state',
        'city',
        'completed_at',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'author_revenue' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // Scopes for analytics
    public function scopeCompleted($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }

    public function scopeLastSixMonths($query)
    {
        return $query->where('created_at', '>=', now()->subMonths(6));
    }
}
