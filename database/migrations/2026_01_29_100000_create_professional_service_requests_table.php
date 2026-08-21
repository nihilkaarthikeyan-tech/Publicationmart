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
        Schema::create('professional_service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->nullable()->constrained()->onDelete('set null');
            $table->string('service_type'); // 'formatting', 'cover', 'full_package'
            $table->decimal('amount', 10, 2); // Amount paid
            $table->string('payment_id')->nullable(); // Payment gateway transaction ID
            $table->enum('status', ['pending_upload', 'pending', 'in_progress', 'completed', 'cancelled'])->default('pending_upload');
            $table->string('manuscript_file')->nullable(); // User's uploaded manuscript
            $table->string('formatted_file')->nullable(); // Admin's completed file
            $table->text('user_notes')->nullable(); // User's requirements/instructions
            $table->text('admin_notes')->nullable(); // Admin's internal notes
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professional_service_requests');
    }
};
