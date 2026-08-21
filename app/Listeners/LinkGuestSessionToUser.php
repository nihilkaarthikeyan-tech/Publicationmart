<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use App\Models\GuestWritingSession;
use App\Models\Book;
use Illuminate\Support\Facades\Session;

class LinkGuestSessionToUser
{
    public function handle($event)
    {
        // Check for Session Token first
        $token = session('guest_writer_token');
        $user = $event->user;

        $guestSession = null;

        if ($token) {
            $guestSession = GuestWritingSession::where('session_token', $token)
                ->whereNull('user_id')
                ->first();
        }

        // Fallback: Check by email
        if (!$guestSession && $user->email) {
            $guestSession = GuestWritingSession::where('email', $user->email)
                ->whereNull('user_id')
                ->latest()
                ->first();
        }

        if ($guestSession) {
            // Link the session
            $guestSession->update(['user_id' => $user->id]);

            // Create a stub Book record so it appears in Dashboard
            // Logic: We create a book, and maybe the dashboard will need to know how to open it.
            // If we open it in AI Book Studio (logged in), we need to migrate data.
            // For now, we'll assume the Dashboard can handle it or we migrate minimally.

            // Only create if not already linked to a book
            if (!$guestSession->book_id) {
                // 1. Create Book
                $book = Book::create([
                    'user_id' => $user->id,
                    'title' => $guestSession->title ?? 'Untitled Guest Book',
                    'subtitle' => $guestSession->subtitle,
                    'author_name' => $guestSession->author_name ?? $user->name,
                    'genre' => $guestSession->genre,
                    'about_book' => $guestSession->about_book,
                    'language' => $guestSession->language ?? 'English',
                    'step_completed' => $guestSession->current_step,
                ]);

                $guestSession->update(['book_id' => $book->id]);

                // 2. Migrate Content (Crucial for Data Persistence)
                $chaptersData = $guestSession->chapters_data;
                // Handle JSON decoding if it's a raw string
                if (is_string($chaptersData)) {
                    $chaptersData = json_decode($chaptersData, true);
                }

                if (!empty($chaptersData) && is_array($chaptersData)) {
                    foreach ($chaptersData as $index => $chapData) {
                        $chapter = \App\Models\AiChapter::create([
                            'book_id' => $book->id,
                            'title' => $chapData['title'] ?? 'Untitled Chapter',
                            'order_index' => $index + 1,
                            'status' => 'approved', // FIX: Chapters accept 'pending'|'approved'|'rejected'
                            'content' => null, // Chapters don't have content, sections do
                        ]);

                        if (!empty($chapData['sections'])) {
                            foreach ($chapData['sections'] as $secIndex => $secData) {
                                \App\Models\AiSection::create([
                                    'ai_chapter_id' => $chapter->id,
                                    'title' => $secData['title'] ?? 'Untitled Section',
                                    'content' => $secData['content'] ?? null,
                                    'order_index' => $secIndex + 1,
                                    'status' => !empty($secData['content']) ? 'generated' : 'draft',
                                    'image_url' => $secData['image_url'] ?? null, // Import Guest Images
                                ]);
                            }
                        }
                    }
                }
            }

            session()->forget('guest_writer_token');
            session()->flash('status', 'Guest book linked successfully!');
        }
    }
}
