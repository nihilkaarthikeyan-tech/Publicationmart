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
            $table->text('author_biography')->nullable();
            $table->text('about_book')->nullable();
            $table->decimal('printing_cost', 10, 2)->nullable();
            $table->decimal('author_cost', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->decimal('international_selling_price', 10, 2)->nullable();
            $table->text('author_address')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn([
                'author_biography',
                'about_book',
                'printing_cost',
                'author_cost',
                'selling_price',
                'international_selling_price',
                'author_address'
            ]);
        });
    }
};
