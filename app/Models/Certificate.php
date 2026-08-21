<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'recipient_name',
        'certificate_name',
        'file_path',
        'issue_date',
        'is_claimed'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
