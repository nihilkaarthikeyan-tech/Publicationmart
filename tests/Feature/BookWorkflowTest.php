<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A book must not reach the admin review queue until the author has actually
 * completed the earlier steps — otherwise staff review empty submissions.
 */
class BookWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_book_cannot_be_submitted_for_review(): void
    {
        $owner = User::factory()->create();

        // A brand-new draft: no specs, no pricing, no content.
        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'Empty', 'author_name' => 'A',
            'status' => 'draft', 'step_completed' => 0,
        ]);

        $this->actingAs($owner)->post(route('books.publish', $book->id));

        $this->assertNotSame('submitted', $book->fresh()->status,
            'an incomplete book must not enter the admin review queue');
    }

    public function test_completed_book_can_still_be_submitted(): void
    {
        $owner = User::factory()->create();

        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'Ready', 'author_name' => 'A',
            'status' => 'draft', 'step_completed' => 3,
            'author_biography' => 'A bio long enough to pass.',
            'about_book' => 'A description of the book that is long enough.',
            'num_pages' => 120, 'selling_price' => 499, 'author_cost' => 200,
            'interior_file' => 'interiors/example.docx',
        ]);

        $this->actingAs($owner)->post(route('books.publish', $book->id));

        $this->assertSame('submitted', $book->fresh()->status,
            'a completed book must still submit normally');
    }

    /** An approved/published book must not be revertible to "submitted". */
    public function test_published_book_cannot_be_reverted_by_resubmitting(): void
    {
        $owner = User::factory()->create();

        $book = Book::create([
            'user_id' => $owner->id, 'title' => 'Live Book', 'author_name' => 'A',
            'status' => 'approved', 'step_completed' => 5,
            'author_biography' => 'A bio long enough to pass.',
            'about_book' => 'A description long enough to pass.',
            'num_pages' => 120, 'selling_price' => 499, 'author_cost' => 200,
            'interior_file' => 'interiors/example.docx',
        ]);

        $this->actingAs($owner)->post(route('books.publish', $book->id));

        $this->assertSame('approved', $book->fresh()->status,
            'a live/approved book must not be knocked back to submitted');
    }
}
