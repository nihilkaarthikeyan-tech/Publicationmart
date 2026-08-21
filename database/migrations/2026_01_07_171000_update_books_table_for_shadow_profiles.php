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
            // Make user_id nullable to support books without an account (Shadow Profile)
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // Add user_email to link books later when the user registers
            $table->string('user_email')->nullable()->after('user_id')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('user_email');
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
