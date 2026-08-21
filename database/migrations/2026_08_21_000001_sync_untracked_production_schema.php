<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Schema-drift repair.
 *
 * These tables and columns exist in the production database but were never
 * captured in a migration — they were added directly to the live database.
 * That meant the application could not be rebuilt from source: a fresh
 * `migrate` produced a schema the code crashes against (e.g. BlogController
 * writes blogs.image_path, which no migration created).
 *
 * Every block is guarded, so this is a no-op on the existing production
 * database and only fills the gaps on a fresh one.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('campaign_codes')) {
            Schema::create('campaign_codes', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('usage_count')->default(0);
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();

                $table->index('code', 'idx_campaign_codes_code');
                $table->index('is_active', 'idx_campaign_codes_is_active');
                $table->index(['code', 'is_active'], 'idx_campaign_codes_code_active');
            });
        }

        if (!Schema::hasTable('presale_bookings')) {
            Schema::create('presale_bookings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('blog_id');
                $table->integer('copies_count');
                $table->string('email');
                $table->string('mobile_number');
                $table->boolean('is_verified')->default(false);
                $table->string('verification_token')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('blogs', function (Blueprint $table) {
            if (!Schema::hasColumn('blogs', 'image_path')) {
                $table->string('image_path')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('blogs', 'is_presale')) {
                $table->boolean('is_presale')->default(false);
            }
            if (!Schema::hasColumn('blogs', 'access_attempts')) {
                $table->integer('access_attempts')->default(0);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'campaign_code_id')) {
                $table->unsignedBigInteger('campaign_code_id')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Deliberately not dropping these: they hold live production data and
        // predate this migration. Reversing would destroy real records.
    }
};
