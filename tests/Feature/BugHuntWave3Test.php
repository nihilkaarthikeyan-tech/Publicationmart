<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\GuestWritingSession;
use App\Models\ProfessionalServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BugHuntWave3Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function guestSession(string $status): GuestWritingSession
    {
        return GuestWritingSession::create([
            'session_token'  => (string) \Illuminate\Support\Str::uuid(),
            'email'          => 'g@example.test',
            'title'          => 'Guest Book',
            'plan_type'      => 'basic',
            'plan_name'      => 'Basic',
            'amount_paid'    => $status === 'paid' ? 499 : 0,
            'payment_status' => $status,
        ]);
    }

    /** An unpaid guest session must not be able to download the finished book. */
    public function test_unpaid_guest_cannot_download_the_book(): void
    {
        $s = $this->guestSession("pending");

        $level = ob_get_level();
        try {
            $r = $this->get("/smart-writer/download-book/{$s->session_token}/docx");
        } finally {
            while (ob_get_level() < $level) { ob_start(); }
        }

        $this->assertNotEquals(200, $r->getStatusCode(),
            'an unpaid session must not download the generated book');
    }

    /** An admin must be able to download a formatted file for any request. */
    public function test_admin_can_download_a_formatted_file(): void
    {
        $customer = User::factory()->create(['role' => 'user']);
        $admin    = User::factory()->create(['role' => 'super_admin']);

        $book = Book::create([
            'user_id' => $customer->id, 'title' => 'B', 'author_name' => 'A', 'status' => 'draft',
        ]);

        \Illuminate\Support\Facades\Storage::disk('public')->put('formatted/out.docx', 'content');

        $req = ProfessionalServiceRequest::create([
            'user_id' => $customer->id, 'book_id' => $book->id,
            'service_type' => 'formatting', 'status' => 'completed', 'amount' => 999,
            'formatted_file' => 'formatted/out.docx',
        ]);

        $level = ob_get_level();
        try {
            $r = $this->actingAs($admin)->get(route('professional.download-formatted', $req->id));
        } finally {
            while (ob_get_level() < $level) { ob_start(); }
        }

        $this->assertNotEquals(403, $r->getStatusCode(),
            'an admin must be able to download a customer formatted file');
    }

    /** The owning customer must still be able to download their own file. */
    public function test_customer_can_download_their_own_formatted_file(): void
    {
        $customer = User::factory()->create(['role' => 'user']);
        $book = Book::create([
            'user_id' => $customer->id, 'title' => 'B', 'author_name' => 'A', 'status' => 'draft',
        ]);

        \Illuminate\Support\Facades\Storage::disk('public')->put('formatted/mine.docx', 'content');

        $req = ProfessionalServiceRequest::create([
            'user_id' => $customer->id, 'book_id' => $book->id,
            'service_type' => 'formatting', 'status' => 'completed', 'amount' => 999,
            'formatted_file' => 'formatted/mine.docx',
        ]);

        $level = ob_get_level();
        try {
            $r = $this->actingAs($customer)->get(route('professional.download-formatted', $req->id));
        } finally {
            while (ob_get_level() < $level) { ob_start(); }
        }

        $this->assertNotEquals(403, $r->getStatusCode(), 'the owner must be able to download');
    }

    /** The /export route was a second way for an unpaid session to take the book. */
    public function test_unpaid_guest_cannot_export_the_book(): void
    {
        $s = $this->guestSession("pending");

        $level = ob_get_level();
        try {
            $r = $this->get("/smart-writer/export/{$s->session_token}?format=docx");
        } finally {
            while (ob_get_level() < $level) { ob_start(); }
        }

        $this->assertNotEquals(200, $r->getStatusCode(),
            'an unpaid session must not export the generated book');
    }

    /** A paid session must still be able to export. */
    public function test_paid_guest_can_export_the_book(): void
    {
        $s = $this->guestSession("paid");

        $level = ob_get_level();
        try {
            $r = $this->get("/smart-writer/export/{$s->session_token}?format=docx");
        } finally {
            while (ob_get_level() < $level) { ob_start(); }
        }

        $this->assertNotEquals(403, $r->getStatusCode(), 'a paid session must still export');
    }
}
