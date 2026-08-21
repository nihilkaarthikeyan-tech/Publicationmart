<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\Book;
use App\Models\GuestWritingSession;
use App\Models\ProfessionalServiceRequest;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Second probing wave: can one user reach another user's records, and can a
 * normal user perform an admin-only action, across the controllers that had
 * no coverage at all.
 */
class BugHuntIdorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    // ------------------------------------------------------------ support tickets

    public function test_user_cannot_view_another_users_support_ticket(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();

        $ticket = SupportTicket::create([
            'user_id' => $owner->id, 'name' => 'Owner', 'email' => 'owner@example.test',
            'category' => 'general', 'subject' => 'Private', 'message' => 'Confidential details here.',
            'status' => 'open', 'priority' => 'normal',
        ]);

        $r = $this->actingAs($attacker)->get(route('support.show', $ticket->id));
        $this->assertContains($r->getStatusCode(), [403, 404],
            'another user must not read this ticket (got ' . $r->getStatusCode() . ')');
    }

    public function test_user_cannot_reply_to_another_users_ticket(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();

        $ticket = SupportTicket::create([
            'user_id' => $owner->id, 'name' => 'Owner', 'email' => 'owner@example.test',
            'category' => 'general', 'subject' => 'S', 'message' => 'M',
            'status' => 'open', 'priority' => 'normal',
        ]);

        $r = $this->actingAs($attacker)->post(route('support.reply', $ticket->id), [
            'message' => 'injected reply',
        ]);
        $this->assertContains($r->getStatusCode(), [403, 404],
            'another user must not reply to this ticket');
    }

    public function test_user_cannot_close_another_users_ticket(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();

        $ticket = SupportTicket::create([
            'user_id' => $owner->id, 'name' => 'O', 'email' => 'o@example.test',
            'category' => 'general', 'subject' => 'S', 'message' => 'M',
            'status' => 'open', 'priority' => 'normal',
        ]);

        $this->actingAs($attacker)->post(route('support.close', $ticket->id));

        $this->assertSame('open', $ticket->fresh()->status,
            'another user must not be able to close this ticket');
    }

    // ------------------------------------------------------- professional service

    public function test_user_cannot_view_another_users_service_request(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();

        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'B', 'author_name' => 'A', 'status' => 'draft',
        ]);

        $req = ProfessionalServiceRequest::create([
            'user_id' => $owner->id, 'book_id' => $book->id,
            'service_type' => 'formatting', 'status' => 'pending', 'amount' => 999,
        ]);

        $r = $this->actingAs($attacker)->get(route('professional.success', $req->id));
        $this->assertContains($r->getStatusCode(), [403, 404],
            'another user must not view this service request');
    }

    // ------------------------------------------------------------ guest sessions

    /** Guest writing sessions are keyed by a secret token; ids must not work. */
    public function test_guest_studio_requires_the_token_not_an_id(): void
    {
        $session = GuestWritingSession::create([
            'session_token'  => (string) \Illuminate\Support\Str::uuid(),
            'email'          => 'guest@example.test',
            'title'          => 'Guest Book',
            'plan_type'      => 'basic',
            'plan_name'      => 'Basic',
            'amount_paid'    => 499,
            'payment_status' => 'paid',
        ]);

        // Guessing the numeric id must not open the studio.
        $r = $this->get('/smart-writer/studio/' . $session->id);
        $this->assertNotEquals(200, $r->getStatusCode(),
            'a numeric id must not substitute for the session token');
    }

    /** An unpaid session must not be able to drive paid AI generation. */
    public function test_unpaid_guest_session_cannot_generate(): void
    {
        $session = GuestWritingSession::create([
            'session_token'  => (string) \Illuminate\Support\Str::uuid(),
            'email'          => 'guest@example.test',
            'title'          => 'Unpaid Book',
            'plan_type'      => 'basic',
            'plan_name'      => 'Basic',
            'amount_paid'    => 0,
            'payment_status' => 'pending',
        ]);

        $r = $this->postJson(route('guest-writer.generate-outline'), [
            'session_token'      => $session->session_token,
            'topic'              => 'anything',
            'chapter_count'      => 3,
            'sub_chapter_count'  => 2,
        ]);

        $this->assertContains($r->getStatusCode(), [403, 302, 422],
            'an unpaid session must not reach paid generation (got ' . $r->getStatusCode() . ')');
        Http::assertNothingSent();
    }

    // -------------------------------------------------------------------- blogs

    /** A normal user's blog submission must land pending, never auto-published. */
    public function test_normal_user_blog_submission_is_not_auto_published(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)->post(route('blogs.store'), [
            'title' => 'My Post', 'excerpt' => 'E', 'content' => '<p>Body</p>',
            'category' => 'General', 'author_name' => 'U',
            'captcha_num1' => 1, 'captcha_num2' => 1, 'captcha_answer' => 2,
            'is_published' => 1, 'status' => 'approved',   // attempted override
        ]);

        $blog = Blog::latest('id')->first();
        if ($blog) {
            $this->assertFalse((bool) $blog->is_published, 'a normal user must not self-publish');
            $this->assertNotSame('approved', $blog->status, 'a normal user must not self-approve');
        }
        $this->assertTrue(true);
    }

    /** A normal user must not be able to approve a pending blog. */
    public function test_normal_user_cannot_approve_a_blog(): void
    {
        $blog = Blog::create([
            'title' => 'Pending', 'slug' => 'pending', 'excerpt' => 'E', 'content' => 'C',
            'category' => 'General', 'author_name' => 'A',
            'is_published' => false, 'status' => 'pending',
        ]);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)->post(route('admin.blogs.approve', $blog->id));

        $this->assertNotSame('approved', $blog->fresh()->status,
            'a normal user must not approve blogs');
    }

    // ------------------------------------------------------------- admin surface

    /** Every admin-prefixed GET route must reject a normal user. */
    public function test_no_admin_get_route_is_reachable_by_a_normal_user(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $leaks = [];

        foreach (app('router')->getRoutes() as $route) {
            if (!in_array('GET', $route->methods(), true)) {
                continue;
            }
            $uri = $route->uri();
            if (!str_starts_with($uri, 'admin/')) {
                continue;
            }
            // Skip routes needing parameters we cannot invent meaningfully.
            if (str_contains($uri, '{')) {
                continue;
            }

            $status = $this->actingAs($user)->get('/' . $uri)->getStatusCode();
            if ($status === 200) {
                $leaks[] = $uri . ' returned 200';
            }
        }

        $this->assertSame([], $leaks, "Admin pages reachable by a normal user:\n" . implode("\n", $leaks));
    }
}
