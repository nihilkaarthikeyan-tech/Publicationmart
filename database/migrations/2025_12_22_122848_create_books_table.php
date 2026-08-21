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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Form 1: Basic Info
            $table->string('language')->default('English');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('author_name');
            $table->json('co_authors')->nullable();
            $table->string('genre')->nullable();

            // Form 2: Book Design
            $table->string('book_size')->nullable();
            $table->string('printing_color')->nullable(); // 'B/W' or 'Color'
            $table->string('paper_type')->nullable(); // 'White', 'Bond', 'Art'
            $table->string('binding_type')->nullable(); // 'Soft Binding' or 'Hard Binding'
            $table->string('interior_layout_method')->nullable(); // 'automatic_tool' or 'upload_template'
            $table->string('cover_design_path')->nullable(); // Path to uploaded cover or status

            $table->integer('step_completed')->default(1); // To track progress (1, 2, 3...)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
