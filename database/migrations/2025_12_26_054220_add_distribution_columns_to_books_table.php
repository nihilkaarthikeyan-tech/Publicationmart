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
        Schema::table('books', function (Blueprint $table) {
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft')->after('step_completed');
            $table->string('isbn')->nullable()->after('status');
            $table->string('amazon_link')->nullable()->after('isbn');
            $table->string('google_books_link')->nullable()->after('amazon_link');
            $table->text('admin_feedback')->nullable()->after('google_books_link');
            $table->timestamp('published_at')->nullable()->after('admin_feedback');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            //
        });
    }
};
