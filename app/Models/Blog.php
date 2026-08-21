<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image_url',
        'author_name',
        'author_email',
        'category',
        'is_published',
        'status',
        'published_at',
        'user_id',
        'is_presale',
        'image_path',
        'access_attempts',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_published' => 'boolean',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function presaleBookings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PresaleBooking::class);
    }
}
