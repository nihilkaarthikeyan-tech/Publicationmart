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
 * Covers the AI Book Studio: ownership on every endpoint, the paid image-credit
 * limit, and the book-context save. All outbound AI calls are faked so the
 * suite never spends money or depends on a third party being up.
 */
class AiStudioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Nothing in this suite may reach a real API.
        Http::preventStrayRequests();
    }

    private function makeBook(User $owner, array $attrs = []): Book
    {
        return Book::create(array_merge([
            'user_id'             => $owner->id,
            'title'               => 'AI Book',
            'author_name'         => 'Author',
            'status'              => 'draft',
            'image_credits_used'  => 0,
            'image_credits_limit' => 15,
        ], $attrs));
    }

    private function makeSection(Book $book): AiSection
    {
        $chapter = AiChapter::create([
            'book_id'     => $book->id,
            'title'       => 'Chapter One',
            'order_index' => 1,
            'status'      => 'approved',
        ]);

        return AiSection::create([
            'ai_chapter_id' => $chapter->id,
            'title'         => 'Section One',
            'order_index'   => 1,
            'content'       => 'Existing content',
        ]);
    }

    // ---------------------------------------------------------------- ownership

    public function test_user_cannot_save_context_on_another_users_book(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->makeBook($owner);

        $this->actingAs($attacker)
            ->post(route('ai-studio.context', $book->id), ['topic' => 'stolen'])
            ->assertForbidden();
    }

    public function test_user_cannot_generate_sections_on_another_users_chapter(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $section  = $this->makeSection($this->makeBook($owner));

        $this->actingAs($attacker)
            ->post(route('ai-studio.sections', $section->ai_chapter_id))
            ->assertForbidden();
    }

    public function test_user_cannot_write_another_users_section(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $section  = $this->makeSection($this->makeBook($owner));

        $this->actingAs($attacker)
            ->post(route('ai-studio.write', $section->id))
            ->assertForbidden();
    }

    public function test_user_cannot_generate_image_on_another_users_section(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $section  = $this->makeSection($this->makeBook($owner));

        $this->actingAs($attacker)
            ->post(route('ai-studio.image', $section->id))
            ->assertForbidden();
    }

    // ------------------------------------------------------------- book context

    /** The topic/audience columns were missing entirely — this endpoint used to 500. */
    public function test_owner_can_save_book_context(): void
    {
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        $this->actingAs($owner)
            ->post(route('ai-studio.context', $book->id), [
                'topic'    => 'Machine learning for beginners',
                'audience' => 'Undergraduate students',
                'genre'    => 'Academic',
            ])
            ->assertOk();

        $book->refresh();
        $this->assertSame('Machine learning for beginners', $book->topic);
        $this->assertSame('Undergraduate students', $book->audience);
        $this->assertSame('Academic', $book->genre);
    }

    // ------------------------------------------------------------- image credits

    /** H6: the paid image limit must actually block once reached. */
    public function test_image_generation_is_blocked_at_the_credit_limit(): void
    {
        $owner   = User::factory()->create();
        $book    = $this->makeBook($owner, ['image_credits_used' => 15, 'image_credits_limit' => 15]);
        $section = $this->makeSection($book);

        $this->actingAs($owner)
            ->post(route('ai-studio.image', $section->id))
            ->assertStatus(403)
            ->assertJson(['success' => false]);

        // And no outbound image call may have been attempted.
        Http::assertNothingSent();
    }

    /**
     * H6 regression: the usage counter must actually advance. It was commented
     * out, which made the limit above unreachable no matter how many were made.
     */
    public function test_image_credit_counter_increments_after_generation(): void
    {
        $owner   = User::factory()->create();
        $book    = $this->makeBook($owner, ['image_credits_used' => 0, 'image_credits_limit' => 15]);
        $section = $this->makeSection($book);

        // Mock the image service so this exercises the controller's credit
        // accounting without depending on OpenAI's response shape.
        $fake = \Mockery::mock(\App\Services\Ai\OpenAiImageService::class);
        $fake->shouldReceive('generateIllustration')
             ->andReturn('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $this->app->instance(\App\Services\Ai\OpenAiImageService::class, $fake);

        $before = $book->fresh()->image_credits_used;

        $this->actingAs($owner)->post(route('ai-studio.image', $section->id));

        $after = $book->fresh()->image_credits_used;

        $this->assertGreaterThan(
            $before,
            $after,
            'image_credits_used must increase, otherwise the paid limit can never be enforced'
        );
    }

    // ------------------------------------------------------------ manual outline

    /** L6: blank lines must not leave gaps in chapter ordering. */
    public function test_manual_chapters_get_contiguous_order_index(): void
    {
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        // A blank line in the middle previously produced 1,3,4 instead of 1,2,3.
        $this->actingAs($owner)->post(route('ai-studio.outline', $book->id), [
            'mode'           => 'manual',
            'manual_content' => "Chapter A\n\nChapter B\nChapter C",
        ]);

        $indexes = AiChapter::where('book_id', $book->id)
            ->orderBy('order_index')
            ->pluck('order_index')
            ->all();

        $this->assertSame([1, 2, 3], $indexes, 'order_index must be contiguous');
    }
}
