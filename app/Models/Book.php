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

    /**
     * Plan types that are NOT AI writing plans. Both are cheap add-ons
     * (cover 499, formatting 1499) and must not unlock AI generation, which
     * sells for 3299-21000.
     */
    public const NON_WRITING_PLANS = ['formatting', 'cover'];

    /**
     * Whether an AI *writing* plan has been paid for on this book.
     *
     * ai_plan_type is set only after a completed AI-plan payment
     * (PaymentController AI_ branch). savePlan() accepts
     * pro|premium|formatting|cover|publishing, and premium/publishing are
     * stored as their tier name, so anything other than the two add-on types
     * counts as a writing plan. This is the logged-in equivalent of
     * GuestWritingSession::isValid().
     */
    public function hasPaidAiPlan(): bool
    {
        if (empty($this->ai_plan_type)) {
            return false;
        }

        return !in_array(strtolower($this->ai_plan_type), self::NON_WRITING_PLANS, true);
    }

    /** Whether the paid formatting add-on is active on this book. */
    public function hasPaidFormatting(): bool
    {
        return strtolower($this->ai_plan_type ?? '') === 'formatting';
    }

    /** Whether the paid cover add-on is active on this book. */
    public function hasPaidCover(): bool
    {
        return strtolower($this->ai_plan_type ?? '') === 'cover';
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function aiChapters(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiChapter::class)->orderBy('order_index');
    }
}

