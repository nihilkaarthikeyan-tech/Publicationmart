<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\ProfessionalServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Professional services are paid work done by staff. An unpaid request must
 * not be able to submit a manuscript into the team's queue.
 */
class ProfessionalPaywallTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function request(User $owner, ?string $paymentId): ProfessionalServiceRequest
    {
        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'B', 'author_name' => 'A', 'status' => 'draft',
        ]);

        return ProfessionalServiceRequest::create([
            'user_id' => $owner->id, 'book_id' => $book->id,
            'service_type' => 'formatting', 'amount' => 1999,
            'payment_id' => $paymentId,
            'status' => $paymentId ? 'pending_upload' : 'pending',
        ]);
    }

    /** An unpaid request must not accept a manuscript upload. */
    public function test_unpaid_request_cannot_upload_manuscript(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $req   = $this->request($owner, null);   // never paid

        $r = $this->actingAs($owner)->post("/professional/upload/{$req->id}", [
            'manuscript' => UploadedFile::fake()->create('m.docx', 50),
        ]);

        $this->assertContains($r->getStatusCode(), [403, 302],
            'an unpaid request must not submit work (got ' . $r->getStatusCode() . ')');

        $this->assertNull($req->fresh()->manuscript_file,
            'no manuscript should be attached to an unpaid request');
    }

    /** An unpaid request must not open the upload page. */
    public function test_unpaid_request_cannot_open_upload_page(): void
    {
        $owner = User::factory()->create();
        $req   = $this->request($owner, null);

        $r = $this->actingAs($owner)->get(route('professional.upload', $req->id));
        $this->assertNotEquals(200, $r->getStatusCode(),
            'the upload page must require a paid request');
    }

    /** A paid request must still work normally. */
    public function test_paid_request_can_upload_manuscript(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $req   = $this->request($owner, 'PRO_12345');   // paid

        $r = $this->actingAs($owner)->post("/professional/upload/{$req->id}", [
            'manuscript' => UploadedFile::fake()->create('m.docx', 50),
        ]);

        $this->assertNotEquals(403, $r->getStatusCode(), 'a paid request must still upload');
        $this->assertNotNull($req->fresh()->manuscript_file, 'the manuscript should be stored');
    }
}
