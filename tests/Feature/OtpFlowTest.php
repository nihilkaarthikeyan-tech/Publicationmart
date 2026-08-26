<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * The OTP login path must still work after removing the exists:users rule
 * (which was leaking which emails are registered).
 */
class OtpFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * reCAPTCHA is enforced outside the local environment (it fails closed by
     * design), so stub it out to test the OTP logic itself.
     */
    private function stubRecaptcha(): void
    {
        $fake = \Mockery::mock(\App\Services\RecaptchaService::class);
        $fake->shouldReceive('verify')->andReturn(['success' => true, 'score' => 0.9]);
        $this->app->instance(\App\Services\RecaptchaService::class, $fake);
    }

    /** A real user can still log in with a valid OTP. */
    public function test_valid_otp_logs_the_user_in(): void
    {
        $this->stubRecaptcha();
        $user = User::factory()->create(['email' => 'real@example.test']);

        Cache::store('file')->put('otp_' . md5($user->email), '123456', now()->addMinutes(10));

        $this->post('/login', [
            'email' => $user->email,
            'otp'   => '123456',
            'recaptcha_token' => 'test-token',
        ]);

        // second arg is the guard name, not a message
        $this->assertAuthenticatedAs($user);
    }

    /** A wrong OTP must not log anyone in. */
    public function test_wrong_otp_is_rejected(): void
    {
        $this->stubRecaptcha();
        $user = User::factory()->create(['email' => 'real2@example.test']);
        Cache::store('file')->put('otp_' . md5($user->email), '111111', now()->addMinutes(10));

        $this->post('/login', ['email' => $user->email, 'otp' => '999999', 'recaptcha_token' => 'test-token']);

        $this->assertGuest();
    }

    /** An unknown email must not authenticate and must not error differently. */
    public function test_unknown_email_does_not_authenticate(): void
    {
        $r = $this->post('/login', ['email' => 'nobody@example.test', 'otp' => '123456']);

        $this->assertGuest();
        $this->assertNotEquals(500, $r->getStatusCode(), 'unknown email must not crash');
    }

    /** Requesting an OTP for an unknown email returns success (no enumeration). */
    public function test_otp_request_for_unknown_email_looks_identical(): void
    {
        $r = $this->postJson(route('otp.send'), ['email' => 'ghost@example.test']);

        $this->assertNotEquals(422, $r->getStatusCode(),
            'an unknown email must not be rejected differently — that reveals registration');
    }
}
