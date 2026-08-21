<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The support ticket feature (models, controllers, admin pages and the agent
 * portal) was already built, but its tables were never created — every visit to
 * /support failed with "Base table or view not found". This migration adds the
 * missing schema, derived from SupportTicket / SupportTicketReply and the
 * controllers that write to them.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('support_tickets')) {
            Schema::create('support_tickets', function (Blueprint $table) {
                $table->id();
                // Nullable: tickets are created by authenticated users today, but
                // the controllers fall back to the name/email captured on the form.
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('ticket_number')->unique();
                $table->string('name', 100);
                $table->string('email', 150);
                $table->string('category', 50)->index();
                $table->string('subject', 200);
                $table->text('message');
                $table->string('status', 20)->default('open')->index();
                $table->string('priority', 20)->default('normal')->index();
                $table->string('attachment_path')->nullable();
                $table->text('admin_notes')->nullable();
                $table->timestamp('last_reply_at')->nullable();
                $table->timestamps();

                $table->index('created_at');
            });
        }

        if (!Schema::hasTable('support_ticket_replies')) {
            Schema::create('support_ticket_replies', function (Blueprint $table) {
                $table->id();
                $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
                // Nullable so a reply survives the replying account being removed.
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->text('message');
                $table->boolean('is_admin')->default(false);
                $table->string('attachment_path')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('support_ticket_replies');
        Schema::dropIfExists('support_tickets');
    }
};
