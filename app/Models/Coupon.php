<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percentage',
        'is_active',
        'usage_count',
        'created_by',
        'valid_genres',
        'valid_books',
        'min_order_value'
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'usage_count' => 'integer',
        'valid_genres' => 'array',
        'valid_books' => 'array',
        'min_order_value' => 'decimal:2',
    ];

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
