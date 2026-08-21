<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_chapter_id',
        'title',
        'content',
        'prompt_used',
        'tone',
        'word_count_target',
        'order_index',
        'status',
        'image_url'
    ];

    public function chapter(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(AiChapter::class, 'ai_chapter_id');
    }
}
