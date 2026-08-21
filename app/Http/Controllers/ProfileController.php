<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $purchases = \App\Models\Transaction::with(['book', 'book.user'])
            ->where('user_id', $user->id)
            ->where('payment_status', 'completed')
            ->where(function ($q) {
                $q->where('transaction_id', 'LIKE', 'BOOK_%')
                    ->orWhere('transaction_id', 'LIKE', 'TXN_%');
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'transaction_id' => $t->transaction_id,
                    'book_title' => $t->book ? $t->book->title : 'Unknown Book',
                    'book_cover' => $t->book ? $t->book->cover_design_path : null,
                    'amount' => $t->amount,
                    'created_at' => $t->created_at->format('d M Y'),
                    'status' => ucfirst($t->payment_status),
                ];
            });

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'myPurchases' => $purchases,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
