<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Stores guest smart writing sessions that can be linked to user accounts later
     */
    public function up(): void
    {
        Schema::create('guest_writing_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_token')->unique(); // Unique token for guest access
            $table->string('email')->nullable(); // Optional - collected during payment
            $table->string('full_name')->nullable();

            // Plan info
            $table->string('plan_type'); // 'pro' or 'premium'
            $table->string('plan_name'); // e.g., '80-100 pages'
            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_status')->default('pending'); // pending, paid

            // Book details (same as existing books table)
            $table->string('language')->nullable();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('author_name')->nullable();
            $table->string('genre')->nullable();
            $table->text('about_book')->nullable();

            // AI content (stored as JSON)
            $table->json('chapters_data')->nullable(); // Stores all chapters, sections, content
            $table->integer('image_credits_used')->default(0);
            $table->integer('image_credits_limit')->default(15);

            // Status tracking
            $table->integer('current_step')->default(1); // 1=setup, 2=outline, 3=writing, 4=export
            $table->boolean('is_completed')->default(false);
            $table->timestamp('exported_at')->nullable();

            // Link to user (after login/register)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('book_id')->nullable()->constrained()->nullOnDelete(); // If converted to real book

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Session expiry
            $table->timestamps();

            $table->index('session_token');
            $table->index('email');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_writing_sessions');
    }
};
