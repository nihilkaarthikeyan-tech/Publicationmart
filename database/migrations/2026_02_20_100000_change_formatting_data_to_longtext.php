<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Change formatting_data from JSON to LONGTEXT to avoid MySQL JSON column
     * size limitations. LONGTEXT supports up to 4GB which is more than enough
     * for any book content. Laravel's 'array' cast handles JSON encode/decode
     * transparently regardless of the underlying column type.
     * 
     * Also increase max_allowed_packet for this session to ensure the ALTER
     * TABLE itself can handle existing large rows.
     */
    public function up(): void
    {
        // Try to increase max_allowed_packet for this session
        try {
            DB::statement('SET GLOBAL max_allowed_packet = 67108864'); // 64MB
        }
        catch (\Throwable $e) {
        // May not have SUPER privilege on shared hosting — that's OK,
        // the column type change is the main fix
        }

        DB::statement('ALTER TABLE books MODIFY formatting_data LONGTEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE books MODIFY formatting_data JSON NULL');
    }
};
