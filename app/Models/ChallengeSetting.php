<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeSetting extends Model
{
    protected $fillable = [
        'challenge_type',
        'video_type',
        'video_url',
        'video_file',
        'video_thumbnail',
        'video_title',
    ];

    /**
     * The challenge types that can have a promo video, matching the values
     * accepted by ChallengeController::store().
     */
    public static array $types = [
        'Poetry Challenge',
        'Story Challenge',
        'Academic Challenge',
    ];

    /**
     * Shape used by the public Challenges page, which reads
     * challengeSettings[<challenge type>].{video_type,video_url,video_file,...}
     * and uses video_file / video_thumbnail directly as element sources.
     */
    public function toPublicArray(): array
    {
        return [
            'video_type'      => $this->video_type,
            'video_url'       => $this->video_url,
            'video_file'      => $this->video_file ? asset('storage/' . $this->video_file) : null,
            'video_thumbnail' => $this->video_thumbnail ? asset('storage/' . $this->video_thumbnail) : null,
            'video_title'     => $this->video_title,
        ];
    }
}
