<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiChapter extends Model
{
    use HasFactory;

    protected $fillable = ['book_id', 'title', 'description', 'order_index', 'status'];

    public function book(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function sections(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiSection::class)->orderBy('order_index');
    }
}
