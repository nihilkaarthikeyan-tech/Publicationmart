<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for the IDOR / access-control holes found in the audit:
 * one user must never be able to read or modify another user's book.
 */
class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    private function bookOwnedBy(User $owner): Book
    {
        return Book::create([
            'user_id'       => $owner->id,
            'title'         => 'Private Manuscript',
            'author_name'   => 'Owner',
            'selling_price' => 300,
            'status'        => 'approved',
        ]);
    }

    /** H2: another user's book pages must not be readable by guessing the id. */
    public function test_user_cannot_view_another_users_book_pages(): void
    {
        $owner     = User::factory()->create();
        $attacker  = User::factory()->create();
        $book      = $this->bookOwnedBy($owner);

        foreach (['books.details', 'books.design', 'books.cover-creator', 'books.review'] as $routeName) {
            if (!app('router')->has($routeName)) {
                continue;
            }
            $this->actingAs($attacker)
                ->get(route($routeName, $book->id))
                ->assertForbidden();
        }
    }

    /** H1: another user's book must not be writable. */
    public function test_user_cannot_update_another_users_book(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->bookOwnedBy($owner);

        $this->actingAs($attacker)
            ->post(route('books.update', $book->id), ['book_size' => '6x9'])
            ->assertForbidden();

        $this->assertNotEquals('6x9', $book->fresh()->book_size);
    }

    /** H1: the owner is still allowed through (the guard must not break the feature). */
    public function test_owner_can_still_reach_their_own_book(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookOwnedBy($owner);

        $response = $this->actingAs($owner)->get(route('books.details', $book->id));

        $this->assertNotEquals(403, $response->getStatusCode(), 'the owner must not be blocked');
    }

    /** L5: author copies are only for your own book. */
    public function test_user_cannot_buy_author_copies_of_another_users_book(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->bookOwnedBy($owner);

        $this->actingAs($attacker)
            ->get(route('payment.author_copies', ['book_id' => $book->id, 'copies' => 1]))
            ->assertForbidden();
    }

    /** C6/M10: the public debug routes must stay deleted. */
    public function test_public_debug_routes_are_gone(): void
    {
        $this->get('/clear-all-caches-now')->assertNotFound();
        $this->get('/test-email')->assertNotFound();
    }

    /** Every route must point at a controller method that actually exists. */
    public function test_no_route_points_at_a_missing_controller_method(): void
    {
        $broken = [];

        foreach (app('router')->getRoutes() as $route) {
            $action = $route->getAction('uses');
            if (!is_string($action) || !str_contains($action, '@')) {
                continue;
            }
            [$class, $method] = explode('@', $action);
            if (!class_exists($class) || !method_exists($class, $method)) {
                $broken[] = $route->uri() . ' -> ' . $action;
            }
        }

        $this->assertSame([], $broken, "Routes point at methods that do not exist:\n" . implode("\n", $broken));
    }
}
