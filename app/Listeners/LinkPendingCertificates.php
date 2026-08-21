<?php

namespace App\Listeners;

use App\Models\Certificate;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;

class LinkPendingCertificates
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        // Check if event has a user object (Works for both Login and Registered events)
        if (isset($event->user) && $event->user) {
            $user = $event->user;

            // Update all unclaimed certificates with this email
            Certificate::where('email', $user->email)
                ->where('is_claimed', false)
                ->update([
                    'user_id' => $user->id,
                    'is_claimed' => true
                ]);

            // Link any pending "Shadow Profile" books
            // These are books created by Admin where user_id was NULL but user_email matched
            \App\Models\Book::where('user_email', $user->email)
                ->whereNull('user_id')
                ->update([
                    'user_id' => $user->id
                ]);
        }
    }
}
