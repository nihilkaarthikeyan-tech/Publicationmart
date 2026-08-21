<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('challenge_enrollments') && !Schema::hasColumn('challenge_enrollments', 'admin_notes')) {
            Schema::table('challenge_enrollments', function (Blueprint $table) {
                $table->text('admin_notes')->nullable()->after('payment_status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('challenge_enrollments', 'admin_notes')) {
            Schema::table('challenge_enrollments', function (Blueprint $table) {
                $table->dropColumn('admin_notes');
            });
        }
    }
};
