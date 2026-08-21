<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Block 2: AI Chapters
        Schema::create('ai_chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable(); // Brief summary for AI context
            $table->integer('order_index')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        // Block 3 & 4: AI Sections (Sub-chapters)
        Schema::create('ai_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_chapter_id')->constrained('ai_chapters')->onDelete('cascade');
            $table->string('title'); // Sub-chapter title
            $table->longText('content')->nullable(); // The generated text
            $table->text('prompt_used')->nullable(); // To allow "Regenerate"
            $table->string('tone')->nullable();
            $table->integer('word_count_target')->default(500);
            $table->integer('order_index')->default(0);
            $table->enum('status', ['draft', 'generated', 'approved'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_sections');
        Schema::dropIfExists('ai_chapters');
    }
};
