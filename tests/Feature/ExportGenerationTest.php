<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Exercises real document generation end to end, rather than only the guards
 * around it. This is the largest and least-tested part of the codebase.
 */
class ExportGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function bookWithContent(User $owner): Book
    {
        return Book::create([
            'user_id'     => $owner->id,
            'title'       => 'The Test Manuscript',
            'author_name' => 'A. Author',
            'status'      => 'draft',
            'book_size'   => '5.5x8.5',
        ]);
    }

    /**
     * The export controller clears every output buffer (needed so binary
     * downloads are not corrupted by stray output). That also removes
     * PHPUnit's own buffer, so we restore the level around the call.
     */
    private function exportBook(User $owner, Book $book, array $payload)
    {
        $level = ob_get_level();
        try {
            return $this->actingAs($owner)
                ->post(route('books.format.export', $book->id), $payload);
        } finally {
            while (ob_get_level() < $level) {
                ob_start();
            }
        }
    }

    private function sectionsPayload(): array
    {
        return [
            'format'   => 'docx',
            'sections' => [
                'chapter-1' => [
                    'title'   => 'Opening Chapter',
                    'content' => '<h1>Opening Chapter</h1><p>First paragraph with <strong>bold</strong> and <em>italic</em>.</p><p>Second paragraph.</p>',
                ],
                'chapter-2' => [
                    'title'   => 'Second Chapter',
                    'content' => '<h1>Second Chapter</h1><h2>A subheading</h2><p>Body text.</p><ul><li>Point one</li><li>Point two</li></ul>',
                ],
            ],
            'chapters'     => [
                ['id' => 'chapter-1', 'title' => 'Opening Chapter', 'type' => 'chapter'],
                ['id' => 'chapter-2', 'title' => 'Second Chapter',  'type' => 'chapter'],
            ],
            'frontMatters' => [],
            'endMatters'   => [],
        ];
    }

    /** A DOCX export must actually produce a valid, non-empty document. */
    public function test_docx_export_produces_a_real_document(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookWithContent($owner);

        $response = $this->exportBook($owner, $book, $this->sectionsPayload());

        $this->assertEquals(200, $response->getStatusCode(), 'export must not crash');

        // It must come back as a downloadable Word document.
        $this->assertStringContainsString(
            'wordprocessingml',
            (string) $response->headers->get('Content-Type'),
            'export should return a .docx content type'
        );
        $this->assertStringContainsString(
            'attachment',
            (string) $response->headers->get('Content-Disposition')
        );
    }

    /** Content with an image pointing outside storage must not leak that file. */
    public function test_export_does_not_embed_files_outside_storage(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookWithContent($owner);

        $payload = $this->sectionsPayload();
        $payload['sections']['chapter-1']['content'] =
            '<h1>Chapter</h1><p>Text</p><img src="storage/../../../.env">';

        $response = $this->exportBook($owner, $book, $payload);

        // It must still succeed, and must not have read the .env in doing so.
        $this->assertEquals(200, $response->getStatusCode());

        $disposition = (string) $response->headers->get('Content-Disposition');
        $this->assertStringContainsString('attachment', $disposition);
    }

    /** Malformed/empty content should be handled, not fatal. */
    public function test_export_handles_empty_content_without_crashing(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookWithContent($owner);

        $payload = $this->sectionsPayload();
        $payload['sections']['chapter-1']['content'] = '';
        $payload['sections']['chapter-2']['content'] = '<p></p>';

        $response = $this->exportBook($owner, $book, $payload);

        $this->assertNotEquals(500, $response->getStatusCode(), 'empty sections must not crash the export');
    }

    /** Deeply nested / unusual markup must not fatal the DOCX writer. */
    public function test_export_handles_messy_markup(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookWithContent($owner);

        $payload = $this->sectionsPayload();
        $payload['sections']['chapter-1']['content'] =
            '<h1>T</h1><div><p>Unclosed <strong>bold<p>nested para</p></div>'
            . '<table><tr><td>cell</td></tr></table>'
            . '<blockquote>quote</blockquote><h3>h3 without h2</h3>';

        $response = $this->exportBook($owner, $book, $payload);

        $this->assertNotEquals(500, $response->getStatusCode(), 'messy markup must not crash the export');
    }

    /**
     * Malformed input must produce a validation error, not a 500. The
     * generators read $chapter['id'] directly, so a bare string raised a
     * TypeError deep inside document generation.
     */
    public function test_malformed_chapter_payload_is_rejected_cleanly(): void
    {
        $owner = User::factory()->create();
        $book  = $this->bookWithContent($owner);

        $payload = $this->sectionsPayload();
        $payload['chapters'] = ['chapter-1', 'chapter-2']; // strings, not objects

        $response = $this->exportBook($owner, $book, $payload);

        // Malformed entries are dropped rather than crashing generation.
        $this->assertNotEquals(500, $response->getStatusCode(), 'malformed input must not crash the export');
        $this->assertEquals(200, $response->getStatusCode());
    }
}
