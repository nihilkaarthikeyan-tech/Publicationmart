<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        // 'role' intentionally NOT mass-assignable (set explicitly in authorized code)
        'referral_code',
        'referrer_id',
        'referral_balance',
        'wallet_balance',
        'campaign_code_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['is_admin'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'referral_balance' => 'decimal:2',
            'wallet_balance' => 'decimal:2',
        ];
    }

    /**
     * Accessor for is_admin to maintain backward compatibility
     */
    public function getIsAdminAttribute()
    {
        // 1. Check Role (New System)
        if (!empty($this->role) && in_array($this->role, ['super_admin', 'editor'])) {
            return true;
        }

        // 2. Fallback: Check raw 'is_admin' column (Old System)
        // This ensures it works even if the migration hasn't run yet.
        return (bool) ($this->attributes['is_admin'] ?? false);
    }

    /**
     * Helper to check for specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Determine if the user has verified their email address.
     *
     * @return bool
     */
    public function hasVerifiedEmail()
    {
        // Admins are exempted from email verification
        if ($this->is_admin) {
            return true;
        }

        return !is_null($this->email_verified_at);
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                $user->referral_code = strtoupper(\Illuminate\Support\Str::random(10));
            }
        });
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referrer_id');
    }

    public function campaignCode()
    {
        return $this->belongsTo(\App\Models\CampaignCode::class, 'campaign_code_id');
    }

    /**
     * Credit referral bonus to the user
     * 
     * @param float $purchaseAmount
     * @return float The bonus amount credited
     */
    public function creditReferralBonus($purchaseAmount)
    {
        $bonus = $purchaseAmount * 0.10; // 10% commission
        $this->referral_balance += $bonus;
        $this->save();
        return $bonus;
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }
}
