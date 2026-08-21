<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresaleBooking extends Model
{
    protected $fillable = [
        'blog_id',
        'copies_count',
        'email',
        'mobile_number',
        'is_verified',
        'verification_token',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function blog()
    {
        return $this->belongsTo(Blog::class);
    }
}
