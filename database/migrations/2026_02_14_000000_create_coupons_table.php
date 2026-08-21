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
        if (!Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->decimal('discount_percentage', 5, 2);
                $table->boolean('is_active')->default(true);
                $table->integer('usage_count')->default(0);
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->json('valid_genres')->nullable(); // Arrays are often stored as JSON
                $table->json('valid_books')->nullable();  // Arrays are often stored as JSON
                $table->decimal('min_order_value', 10, 2)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
