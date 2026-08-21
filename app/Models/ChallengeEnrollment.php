<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeEnrollment extends Model
{
    protected $fillable = [
        'user_id',
        'challenge_type',
        'full_name',
        'email',
        'mobile_number',
        'city',
        'entry_fee',
        'coupon_code',
        'payment_status',
        'admin_notes',
    ];
}
