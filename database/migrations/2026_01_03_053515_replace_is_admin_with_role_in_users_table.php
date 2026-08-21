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
            $table->string('role')->default('user')->after('email_verified_at');
        });

        // Migrate Data
        // 1. Main Admin -> super_admin
        \Illuminate\Support\Facades\DB::table('users')
            ->where('email', 'admin@publicationmart.com')
            ->update(['role' => 'super_admin']);

        // 2. Sub Admins (admin1-10) -> editor
        \Illuminate\Support\Facades\DB::table('users')
            ->where('email', 'like', 'admin%@publicationmart.com')
            ->where('email', '!=', 'admin@publicationmart.com')
            ->update(['role' => 'editor']);

        // 3. Any other lingering admins -> editor (Safety Net)
        \Illuminate\Support\Facades\DB::table('users')
            ->where('is_admin', true)
            ->where('role', 'user')
            ->update(['role' => 'editor']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('email_verified_at');
        });

        // Restore Data
        \Illuminate\Support\Facades\DB::table('users')
            ->whereIn('role', ['super_admin', 'editor'])
            ->update(['is_admin' => true]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
