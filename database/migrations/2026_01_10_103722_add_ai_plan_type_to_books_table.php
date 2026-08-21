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
            $table->string('ai_plan_type')->nullable()->after('user_id'); // 'pro' or 'premium'
            $table->string('ai_plan_name')->nullable()->after('ai_plan_type'); // 'saver', 'standard', 'pro', 'enterprise', 'starter', 'growth', 'professional', 'studio'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['ai_plan_type', 'ai_plan_name']);
        });
    }
};
