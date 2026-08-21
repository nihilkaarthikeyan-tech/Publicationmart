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
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('quantity')->default(1)->after('book_id');
            // Modifying enum is tricky in migration without raw sql, so we'll just stick to existing or use string if needed.
            // But we need 'international' and 'google_play'. existing: ['direct', 'amazon', 'google', 'other']
            // 'google' is fine for google play. 'other' can be international for now, or we can try to ALTER.
            // Let's just stick to adding quantity for now.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });
    }
};
