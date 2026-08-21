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
            // Distribution status tracking
            $table->enum('amazon_status', ['pending', 'uploaded', 'published'])->default('pending')->after('google_books_link');
            $table->enum('google_status', ['pending', 'uploaded', 'published'])->default('pending')->after('amazon_status');
            $table->timestamp('amazon_uploaded_at')->nullable()->after('google_status');
            $table->timestamp('google_uploaded_at')->nullable()->after('amazon_uploaded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['amazon_status', 'google_status', 'amazon_uploaded_at', 'google_uploaded_at']);
        });
    }
};
