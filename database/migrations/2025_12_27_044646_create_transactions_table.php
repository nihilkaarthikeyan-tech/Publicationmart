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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Buyer
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade'); // Book author

            // Transaction Details
            $table->string('transaction_id')->unique(); // Payment gateway transaction ID
            $table->decimal('amount', 10, 2); // Total amount paid
            $table->decimal('author_revenue', 10, 2); // Amount author receives
            $table->decimal('platform_commission', 10, 2); // Platform commission
            $table->decimal('tax_amount', 10, 2)->default(0); // GST/Tax

            // Payment Information
            $table->enum('payment_method', ['card', 'upi', 'netbanking', 'wallet', 'other'])->default('card');
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('payment_gateway')->nullable(); // razorpay, stripe, etc.
            $table->text('payment_response')->nullable(); // JSON response from gateway

            // Sales Channel
            $table->enum('sales_channel', ['direct', 'amazon', 'google', 'other'])->default('direct');

            // Geographic Data
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();

            // Additional Info
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for analytics
            $table->index(['book_id', 'created_at']);
            $table->index(['author_id', 'created_at']);
            $table->index('payment_status');
            $table->index('sales_channel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
