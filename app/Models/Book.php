<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'user_email',
        'ai_plan_type',
        'ai_plan_name',
        'image_credits_used',
        'image_credits_limit',
        'language',
        'publication',
        'title',
        'subtitle',
        'author_name',
        'co_authors',
        'genre',
        'book_size',
        'printing_color',
        'paper_type',
        'binding_type',
        'interior_layout_method',
        'interior_file',
        'audio_file',
        'cover_design_path',
        'cover_data',
        'author_biography',
        'about_book',
        'printing_cost',
        'author_cost',
        'selling_price',
        'hardcover_price',
        'ebook_price',
        'audio_price',
        'international_selling_price',
        'author_address',
        'author_copies',
        'step_completed',
        'status',
        'isbn',
        'amazon_link',
        'google_books_link',
        'amazon_status',
        'google_status',
        'amazon_uploaded_at',
        'google_uploaded_at',
        'admin_feedback',
        'published_at',
        'publication_date',
        'num_pages',
        'formatting_data',
        'topic',
        'audience',
        'agreed_terms',
        'confirmed_content',
    ];

    protected $casts = [
        'co_authors' => 'array',
        'cover_data' => 'array',
        'formatting_data' => 'array', // Cast JSON to array automatically
        'amazon_uploaded_at' => 'datetime',
        'google_uploaded_at' => 'datetime',
        'published_at' => 'datetime',
        'publication_date' => 'date',
        'agreed_terms' => 'boolean',
        'confirmed_content' => 'boolean',
    ];

    /**
     * Get image limit based on page range
     * 80-100 pages → 15 images
     * 100-150 pages → 20 images
     * 150-200 pages → 30 images
     * 200+ pages → 45 images
     */
    public static function getImageLimitByPageRange(string $pageRange): int
    {
        return match ($pageRange) {
            '80-100' => 15,
            '100-150' => 20,
            '150-200' => 30,
            '200-300', '300+' => 45,
            default => 15
        };
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function aiChapters()
    {
        return $this->hasMany(AiChapter::class)->orderBy('order_index');
    }
}

