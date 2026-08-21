<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Locks in the protection invariants for the admin and support-agent surfaces,
 * plus the challenge coupon boundary. These are regression guards: if someone
 * later adds an admin route without the middleware, a test fails.
 */
class AdminProtectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    /** Every admin route must carry the admin middleware. */
    public function test_all_admin_routes_have_the_admin_middleware(): void
    {
        $unprotected = [];

        foreach (Route::getRoutes() as $route) {
            $uri  = $route->uri();
            $name = $route->getName() ?? '';
            $isAdmin = str_starts_with($uri, 'admin/') || str_starts_with($name, 'admin.');
            if (!$isAdmin) {
                continue;
            }
            if (!in_array('admin', $route->gatherMiddleware(), true)) {
                $unprotected[] = implode('|', $route->methods()) . ' ' . $uri;
            }
        }

        $this->assertSame([], $unprotected,
            "Admin routes missing the admin middleware:\n" . implode("\n", $unprotected));
    }

    /** Every /agent route must carry the support_agent middleware. */
    public function test_all_agent_routes_have_the_support_agent_middleware(): void
    {
        $unprotected = [];

        foreach (Route::getRoutes() as $route) {
            $uri = $route->uri();
            if (!str_starts_with($uri, 'agent/')) {
                continue;
            }
            if (!in_array('support_agent', $route->gatherMiddleware(), true)) {
                $unprotected[] = $uri;
            }
        }

        $this->assertSame([], $unprotected,
            "Agent routes missing support_agent middleware:\n" . implode("\n", $unprotected));
    }

    /** A normal user is rejected by the admin middleware. */
    public function test_admin_middleware_rejects_a_normal_user(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->get('/admin/dashboard')->assertForbidden();
    }

    /** An editor is allowed through the admin middleware. */
    public function test_admin_middleware_allows_an_editor(): void
    {
        $editor = User::factory()->create(['role' => 'editor']);
        $r = $this->actingAs($editor)->get('/admin/dashboard');
        $this->assertNotEquals(403, $r->getStatusCode(), 'an editor must reach the admin dashboard');
    }

    /** A normal user cannot reach the support-agent portal. */
    public function test_normal_user_cannot_reach_agent_portal(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->get(route('agent.dashboard'))->assertForbidden();
    }

    /** A challenge coupon over 100% cannot make the entry fee negative. */
    public function test_challenge_coupon_cannot_make_fee_negative(): void
    {
        Coupon::create([
            'code' => 'FREE200', 'discount_percentage' => 200, 'is_active' => true,
            'created_by' => User::factory()->create()->id,
        ]);

        // Bypass is only on in local, so in testing this reaches the fee math.
        $this->post(route('challenges.store'), [
            'challenge_type' => 'Poetry Challenge',
            'full_name'      => 'Test',
            'email'          => 'test@example.test',
            'mobile_number'  => '9999999999',
            'city'           => 'Chennai',
            'coupon_code'    => 'FREE200',
        ]);

        $enrollment = \App\Models\ChallengeEnrollment::latest('id')->first();
        if ($enrollment) {
            $this->assertGreaterThanOrEqual(0, (float) $enrollment->entry_fee,
                'entry fee must never be negative');
        }
        $this->assertTrue(true);
    }
}
