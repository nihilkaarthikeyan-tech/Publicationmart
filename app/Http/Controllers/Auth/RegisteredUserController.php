<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'campaign_code' => 'nullable|string|max:50',
            'referral_code' => 'nullable|string|max:50',
        ]);

        // Handle Referral Code - Form input takes priority over session
        $referrerId = null;
        $referrer = null;

        // First check form input
        if ($request->filled('referral_code')) {
            $referrer = User::where('referral_code', strtoupper($request->referral_code))->first();

            if (!$referrer) {
                return back()->withErrors(['referral_code' => 'Invalid referral code. Please check and try again.'])->withInput();
            }

            $referrerId = $referrer->id;
        }
        // Fallback to session-based referral (URL-based)
        elseif ($request->session()->has('referral_code')) {
            $referrer = User::where('referral_code', $request->session()->get('referral_code'))->first();
            if ($referrer) {
                $referrerId = $referrer->id;
            }
        }

        // Handle Campaign Code
        $campaignCodeId = null;
        $campaignCode = null;
        if ($request->filled('campaign_code')) {
            $campaignCode = \App\Models\CampaignCode::where('code', strtoupper($request->campaign_code))
                ->where('is_active', true)
                ->first();

            if (!$campaignCode) {
                return back()->withErrors(['campaign_code' => 'Invalid or expired campaign code.'])->withInput();
            }

            $campaignCodeId = $campaignCode->id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'referrer_id' => $referrerId,
            'campaign_code_id' => $campaignCodeId,
        ]);

        // Increment campaign code usage count
        if ($campaignCode) {
            $campaignCode->increment('usage_count');
        }

        // Clear referral code from session
        $request->session()->forget('referral_code');

        // Store success messages for dashboard
        if ($campaignCodeId) {
            $request->session()->flash('campaign_success', 'Congratulations! You registered with campaign code: ' . $campaignCode->code);
        }

        if ($referrerId && $referrer) {
            $request->session()->flash('referral_success', 'You were referred by ' . $referrer->name . '! They will earn rewards when you make purchases.');
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
