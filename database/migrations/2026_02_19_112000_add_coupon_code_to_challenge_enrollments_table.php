<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        if (Schema::hasTable('challenge_enrollments') && !Schema::hasColumn('challenge_enrollments', 'coupon_code')) {
            Schema::table('challenge_enrollments', function (Blueprint $table) {
                $table->string('coupon_code', 20)->nullable()->after('entry_fee');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('challenge_enrollments', 'coupon_code')) {
            Schema::table('challenge_enrollments', function (Blueprint $table) {
                $table->dropColumn('coupon_code');
            });
        }
    }
};
