<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('challenge_settings')) {
            Schema::create('challenge_settings', function (Blueprint $table) {
                $table->id();
                $table->string('challenge_type')->unique(); // 'Story Challenge', 'Poetry Challenge', 'Academic Challenge'
                $table->string('video_type')->default('url'); // 'url' or 'upload'
                $table->string('video_url')->nullable(); // YouTube / Vimeo / external URL
                $table->string('video_file')->nullable(); // uploaded video file path (storage)
                $table->string('video_thumbnail')->nullable(); // optional thumbnail
                $table->string('video_title')->nullable(); // optional display title
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_settings');
    }
};
