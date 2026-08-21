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
        Schema::create('challenge_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('challenge_type'); // 'poetry', 'story', 'academic'
            $table->string('full_name');
            $table->string('email');
            $table->string('mobile_number');
            $table->string('city');
            $table->decimal('entry_fee', 8, 2)->default(500.00);
            $table->string('payment_status')->default('pending'); // pending, paid
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_enrollments');
    }
};
