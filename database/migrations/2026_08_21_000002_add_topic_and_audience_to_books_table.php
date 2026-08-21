<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The AI Book Studio sends `topic` and `audience` to
 * POST /books/{book}/ai-studio/context, and the Book model lists both as
 * fillable — but neither column has ever existed, so saving the book context
 * failed with "Unknown column 'topic'".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            if (!Schema::hasColumn('books', 'topic')) {
                $table->text('topic')->nullable();
            }
            if (!Schema::hasColumn('books', 'audience')) {
                $table->string('audience')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            foreach (['topic', 'audience'] as $column) {
                if (Schema::hasColumn('books', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
