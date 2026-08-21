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
        if (!Schema::hasTable('challenge_enrollments')) {
            Schema::create('challenge_enrollments', function (Blueprint $table) {
                $table->id();
                $table->string('full_name');
                $table->string('email');
                $table->string('mobile_number');
                $table->string('city');
                $table->string('challenge_type')->default('poetry'); // poetry, story, etc.
                $table->decimal('amount_paid', 10, 2)->default(500.00);
                $table->string('payment_status')->default('pending'); // pending, completed, failed
                $table->string('transaction_id')->nullable();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Link if user registers later
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();

                $table->index('email');
                $table->index('payment_status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_enrollments');
    }
};
