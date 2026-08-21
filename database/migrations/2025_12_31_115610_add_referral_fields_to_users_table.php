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
        Schema::table('users', function (Blueprint $table) {
            // Check if columns exist before adding
            if (!Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'referrer_id')) {
                $table->unsignedBigInteger('referrer_id')->nullable()->after('referral_code');
            }
            if (!Schema::hasColumn('users', 'referral_balance')) {
                $table->decimal('referral_balance', 10, 2)->default(0.00)->after('referrer_id');
            }
        });

        // Add foreign key if referrer_id column exists and foreign key doesn't
        if (Schema::hasColumn('users', 'referrer_id')) {
            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');
                });
            } catch (\Exception $e) {
                // Foreign key might already exist, ignore
            }
        }

        // Generate codes for existing users
        $users = \Illuminate\Support\Facades\DB::table('users')->whereNull('referral_code')->get();
        foreach ($users as $user) {
            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->update(['referral_code' => strtoupper(\Illuminate\Support\Str::random(10))]);
        }

        // Now ensure unique constraint (only if not already unique)
        try {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('referral_code');
            });
        } catch (\Exception $e) {
            // Unique constraint might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'referrer_id')) {
                try {
                    $table->dropForeign(['referrer_id']);
                } catch (\Exception $e) {
                }
            }

            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'referral_code'))
                $columnsToDrop[] = 'referral_code';
            if (Schema::hasColumn('users', 'referrer_id'))
                $columnsToDrop[] = 'referrer_id';
            if (Schema::hasColumn('users', 'referral_balance'))
                $columnsToDrop[] = 'referral_balance';

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
