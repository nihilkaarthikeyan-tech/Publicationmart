<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Public endpoints that cost money, send email, or can be brute-forced must
 * carry a rate limit. This is an invariant test: if the throttle is ever
 * removed from one of these, it fails.
 */
class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    private function middlewareFor(string $name): array
    {
        $route = collect(Route::getRoutes())->first(fn($r) => $r->getName() === $name);
        $this->assertNotNull($route, "route {$name} not found");
        return $route->gatherMiddleware();
    }

    private function assertThrottled(string $name): void
    {
        $has = collect($this->middlewareFor($name))
            ->contains(fn($m) => is_string($m) && str_starts_with($m, 'throttle'));

        $this->assertTrue($has, "route {$name} must be rate-limited");
    }

    /** Coupon verification is public — without a limit, codes can be brute-forced. */
    public function test_coupon_verify_is_rate_limited(): void
    {
        $this->assertThrottled('coupons.verify');
    }

    /** Public forms that send email must be limited to stop spam flooding. */
    public function test_public_email_forms_are_rate_limited(): void
    {
        foreach (['contact.store', 'publishing-inquiry.store', 'blogs.presale.otp'] as $name) {
            $this->assertThrottled($name);
        }
    }

    /** Public blog submission must be limited. */
    public function test_blog_submission_is_rate_limited(): void
    {
        $this->assertThrottled('blogs.store');
    }

    /** Login and OTP paths must be limited (credential/OTP brute force). */
    public function test_auth_paths_are_rate_limited(): void
    {
        $login = collect(Route::getRoutes())
            ->first(fn($r) => $r->uri() === 'login' && in_array('POST', $r->methods(), true));

        $this->assertNotNull($login);
        $has = collect($login->gatherMiddleware())
            ->contains(fn($m) => is_string($m) && str_starts_with($m, 'throttle'));
        $this->assertTrue($has, 'POST /login must be rate-limited');
    }

    /** The generic AI helper must stay limited — it costs money per call. */
    public function test_ai_generate_helper_is_rate_limited(): void
    {
        $this->assertThrottled('ai.generate');
    }
}
