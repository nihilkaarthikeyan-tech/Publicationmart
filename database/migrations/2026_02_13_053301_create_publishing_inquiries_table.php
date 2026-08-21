<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('publishing_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('whatsapp')->nullable();
            $table->enum('book_type', ['fiction', 'non-fiction', 'textbook', 'other']);
            $table->string('book_title');
            $table->enum('interested_plan', ['silver', 'gold', 'diamond', 'platinum', 'prestige', 'signature']);
            $table->enum('status', ['new', 'contacted', 'in-progress', 'completed', 'cancelled'])->default('new');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publishing_inquiries');
    }
};
