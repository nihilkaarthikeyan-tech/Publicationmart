<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Covers the book formatting / export flow: ownership on every endpoint, upload
 * validation, and the image-embedding guard that previously allowed reading
 * arbitrary server files (including .env) into an exported document.
 */
class FormattingExportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function makeBook(User $owner): Book
    {
        return Book::create([
            'user_id'     => $owner->id,
            'title'       => 'Formatting Test Book',
            'author_name' => 'Author',
            'status'      => 'draft',
            'book_size'   => '5.5x8.5',
        ]);
    }

    // ---------------------------------------------------------------- ownership

    public function test_user_cannot_open_another_users_formatting_tool(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->makeBook($owner);

        $this->actingAs($attacker)
            ->get(route('books.format', $book->id))
            ->assertForbidden();
    }

    public function test_user_cannot_export_another_users_book(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->makeBook($owner);

        $this->actingAs($attacker)
            ->get(route('books.format.export', $book->id))
            ->assertForbidden();
    }

    public function test_user_cannot_save_formatting_on_another_users_book(): void
    {
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->makeBook($owner);

        $this->actingAs($attacker)
            ->post(route('books.format.save', $book->id), ['formatting_data' => ['x' => 1]])
            ->assertForbidden();
    }

    public function test_user_cannot_upload_a_manuscript_to_another_users_book(): void
    {
        Storage::fake('public');
        $owner    = User::factory()->create();
        $attacker = User::factory()->create();
        $book     = $this->makeBook($owner);

        $this->actingAs($attacker)
            ->post(route('books.format.upload', $book->id), [
                'file' => UploadedFile::fake()->create('manuscript.docx', 100),
            ])
            ->assertForbidden();
    }

    // --------------------------------------------------------- upload validation

    /** H5: SVG carries script and must not be accepted as a book image. */
    public function test_svg_is_rejected_by_the_image_upload(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        $svg = UploadedFile::fake()->createWithContent(
            'x.svg',
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        );

        $this->actingAs($owner)
            ->post(route('books.format.upload-image', $book->id), ['image' => $svg])
            ->assertSessionHasErrors('image');
    }

    /** Only .docx manuscripts are accepted. */
    public function test_manuscript_upload_rejects_unexpected_file_types(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        $this->actingAs($owner)
            ->post(route('books.format.upload', $book->id), [
                'file' => UploadedFile::fake()->create('payload.php', 10),
            ])
            ->assertSessionHasErrors('file');
    }

    /** M7: uploads must be capped well below the old 1 GB limit. */
    public function test_oversized_manuscript_is_rejected(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        // 60 MB — above the 50 MB cap.
        $this->actingAs($owner)
            ->post(route('books.format.upload', $book->id), [
                'file' => UploadedFile::fake()->create('huge.docx', 60 * 1024),
            ])
            ->assertSessionHasErrors('file');
    }

    // ------------------------------------------------------- export image guard

    /**
     * C3: the export embedded any <img src> it was given, so a crafted book
     * could read .env (DB password, API keys) into the downloaded file.
     */
    public function test_export_refuses_paths_outside_public_storage(): void
    {
        $controller = app(\App\Http\Controllers\Books\FormattingToolController::class);
        $guard = new \ReflectionMethod($controller, 'safeLocalImagePath');
        $guard->setAccessible(true);

        $blocked = [
            storage_path('app/public/../../../.env'),
            base_path('.env'),
            base_path('composer.json'),
            storage_path('logs/laravel.log'),
        ];

        foreach ($blocked as $path) {
            $this->assertNull(
                $guard->invoke($controller, $path),
                "Export must refuse to read: {$path}"
            );
        }
    }

    public function test_export_still_allows_genuine_storage_images(): void
    {
        $dir = storage_path('app/public/testfixtures');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $file = $dir . '/cover.png';
        file_put_contents($file, 'fake-png-bytes');

        $controller = app(\App\Http\Controllers\Books\FormattingToolController::class);
        $guard = new \ReflectionMethod($controller, 'safeLocalImagePath');
        $guard->setAccessible(true);

        $this->assertNotNull($guard->invoke($controller, $file));

        @unlink($file);
        @rmdir($dir);
    }

    // ------------------------------------------------------------- owner access

    public function test_owner_can_open_their_own_formatting_tool(): void
    {
        $owner = User::factory()->create();
        $book  = $this->makeBook($owner);

        $response = $this->actingAs($owner)->get(route('books.format', $book->id));

        $this->assertNotEquals(403, $response->getStatusCode(), 'the owner must not be blocked');
    }
}
