<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Regression tests for the content-handling vulnerabilities: stored XSS in
 * blog submissions, SVG uploads, and the export image path traversal.
 */
class ContentSecurityTest extends TestCase
{
    use RefreshDatabase;

    /** H4: submitted blog HTML must be sanitized before it is stored. */
    public function test_blog_content_is_sanitized_on_submit(): void
    {
        $this->withSession(['presale_captcha_answer' => 4]);

        $payload = '<p>Legit paragraph</p><script>alert(document.cookie)</script>'
                 . '<img src=x onerror="alert(1)"><a href="javascript:alert(2)">click</a>';

        $this->post(route('blogs.store'), [
            'title'         => 'XSS attempt',
            'excerpt'       => 'Testing sanitization',
            'content'       => $payload,
            'category'      => 'General',
            'author_name'   => 'Tester',
            'author_email'  => 'tester@example.test',
            'captcha_num1'  => 2,
            'captcha_num2'  => 2,
            'captcha_answer'=> 4,
        ]);

        $blog = Blog::latest('id')->first();
        $this->assertNotNull($blog, 'the blog should have been created');

        $this->assertStringNotContainsString('<script', $blog->content);
        $this->assertStringNotContainsString('onerror', $blog->content);
        $this->assertStringNotContainsString('javascript:', $blog->content);
        $this->assertStringContainsString('Legit paragraph', $blog->content, 'safe markup must survive');
    }

    /** H5: SVG uploads must be rejected (they can carry script). */
    public function test_svg_upload_is_rejected_for_book_cover(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $book = \App\Models\Book::create([
            'user_id'     => $user->id,
            'title'       => 'Cover test',
            'author_name' => 'Tester',
            'status'      => 'draft',
        ]);

        $svg = UploadedFile::fake()->createWithContent(
            'evil.svg',
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        );

        $this->actingAs($user)
            ->post(route('books.save-cover', $book->id), ['cover_image' => $svg])
            ->assertSessionHasErrors('cover_image');
    }

    /** C3: export must not read files outside the app's own storage. */
    public function test_export_image_guard_blocks_paths_outside_storage(): void
    {
        $controller = app(\App\Http\Controllers\Books\FormattingToolController::class);
        $method = new \ReflectionMethod($controller, 'safeLocalImagePath');
        $method->setAccessible(true);

        // .env via traversal, and an absolute path — both must be refused.
        $this->assertNull($method->invoke($controller, storage_path('app/public/../../../.env')));
        $this->assertNull($method->invoke($controller, base_path('.env')));
        $this->assertNull($method->invoke($controller, base_path('composer.json')));
    }

    /** C3: a genuine file inside public storage is still allowed through. */
    public function test_export_image_guard_allows_real_storage_file(): void
    {
        $dir = storage_path('app/public/testfixtures');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $file = $dir . '/ok.png';
        file_put_contents($file, 'not-a-real-png-but-a-real-file');

        $controller = app(\App\Http\Controllers\Books\FormattingToolController::class);
        $method = new \ReflectionMethod($controller, 'safeLocalImagePath');
        $method->setAccessible(true);

        $this->assertNotNull($method->invoke($controller, $file), 'legitimate storage files must still embed');

        @unlink($file);
        @rmdir($dir);
    }
}
