<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class SocialAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            // Use stateless() to avoid session state mismatch errors
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            Log::error('Google Auth Failed: ' . $e->getMessage());
            return redirect()->route('login')->with('status', 'Google authentication failed. Please try again.');
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // User exists, just update the Google ID if missing
            if (empty($user->google_id)) {
                $user->google_id = $googleUser->getId();
                $user->avatar = $googleUser->getAvatar();
                $user->save();
            }

            Auth::login($user);
            return redirect()->intended(route('dashboard'));
        } else {
            // Create New User
            try {
                $newUser = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'user', // Default to normal user
                ]);

                // Manually mark email as verified since it came from Google
                if (!$newUser->hasVerifiedEmail()) {
                    $newUser->markEmailAsVerified();
                }

                Auth::login($newUser);
                return redirect()->route('dashboard');

            } catch (\Exception $e) {
                Log::error('User Creation Failed: ' . $e->getMessage());
                return redirect()->route('login')->with('status', 'Error creating account. Please try again.');
            }
        }
    }
}
