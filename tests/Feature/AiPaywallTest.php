<?php

namespace Tests\Feature;

use App\Models\AiChapter;
use App\Models\AiSection;
use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The logged-in AI Studio must require a paid plan before generating content,
 * exactly like the guest Smart Writer does. A book with no ai_plan_type has
 * not been paid for.
 */
class AiPaywallTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function unpaidBook(User $owner): Book
    {
        // No ai_plan_type -> no plan was ever paid for.
        return Book::create([
            'user_id' => $owner->id, 'title' => 'Free Book', 'author_name' => 'A',
            'status' => 'draft',
        ]);
    }

    public function test_unpaid_book_cannot_generate_outline(): void
    {
        $owner = User::factory()->create();
        $book  = $this->unpaidBook($owner);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.outline', $book->id), [
            'topic' => 'x', 'chapter_count' => 3,
        ]);

        $this->assertContains($r->getStatusCode(), [402, 403],
            'generation must require a paid plan (got ' . $r->getStatusCode() . ')');
        Http::assertNothingSent();
    }

    public function test_unpaid_book_cannot_write_section(): void
    {
        $owner = User::factory()->create();
        $book  = $this->unpaidBook($owner);
        $chapter = AiChapter::create(['book_id' => $book->id, 'title' => 'C', 'order_index' => 1, 'status' => 'approved']);
        $section = AiSection::create(['ai_chapter_id' => $chapter->id, 'title' => 'S', 'order_index' => 1, 'content' => '']);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.write', $section->id));

        $this->assertContains($r->getStatusCode(), [402, 403], 'writing must require a paid plan');
        Http::assertNothingSent();
    }

    public function test_unpaid_book_cannot_generate_image(): void
    {
        $owner = User::factory()->create();
        $book  = $this->unpaidBook($owner);
        $chapter = AiChapter::create(['book_id' => $book->id, 'title' => 'C', 'order_index' => 1, 'status' => 'approved']);
        $section = AiSection::create(['ai_chapter_id' => $chapter->id, 'title' => 'S', 'order_index' => 1, 'content' => '']);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.image', $section->id));

        $this->assertContains($r->getStatusCode(), [402, 403], 'image generation must require a paid plan');
        Http::assertNothingSent();
    }

    public function test_paid_book_can_still_generate(): void
    {
        $owner = User::factory()->create();
        $book  = Book::create([
            'user_id' => $owner->id, 'title' => 'Paid Book', 'author_name' => 'A', 'status' => 'draft',
            'ai_plan_type' => 'premium', 'ai_plan_name' => '80-100',
            'image_credits_limit' => 15, 'image_credits_used' => 0,
        ]);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.outline', $book->id), [
            'topic' => 'x', 'chapter_count' => 3, 'mode' => 'manual', 'manual_content' => "A\nB",
        ]);

        $this->assertNotContains($r->getStatusCode(), [402, 403], 'a paid book must still generate');
    }

    /** A cheap cover/formatting add-on must NOT unlock AI writing. */
    public function test_cover_plan_does_not_unlock_ai_writing(): void
    {
        $owner = User::factory()->create();
        // Paid the 499 cover add-on only.
        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'Cover Only', 'author_name' => 'A', 'status' => 'draft',
            'ai_plan_type' => 'cover', 'ai_plan_name' => 'cover',
        ]);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.outline', $book->id), [
            'topic' => 'x', 'chapter_count' => 3,
        ]);

        $this->assertContains($r->getStatusCode(), [402, 403],
            'a cover add-on must not unlock AI writing (got ' . $r->getStatusCode() . ')');
        Http::assertNothingSent();
    }

    public function test_unpaid_book_cannot_download(): void
    {
        $owner = User::factory()->create();
        $book  = $this->unpaidBook($owner);

        $level = ob_get_level();
        try {
            $r = $this->actingAs($owner)->get(route('ai-studio.download', $book->id));
        } finally { while (ob_get_level() < $level) { ob_start(); } }

        $this->assertContains($r->getStatusCode(), [402, 403],
            'an unpaid book must not be downloadable (got ' . $r->getStatusCode() . ')');
    }

    public function test_unpaid_book_cannot_add_manual_chapter(): void
    {
        $owner = User::factory()->create();
        $book  = $this->unpaidBook($owner);

        $r = $this->actingAs($owner)->postJson(route('ai-studio.chapters.manual', $book->id), [
            'title' => 'Free chapter',
        ]);

        $this->assertContains($r->getStatusCode(), [402, 403],
            'an unpaid book must not accept manual chapters');
    }
}
