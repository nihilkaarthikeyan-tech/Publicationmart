<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Blog;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate a dynamic XML sitemap.
     * Includes all static pages + all approved books + all published blogs.
     */
    public function index(): Response
    {
        // ─── Static Pages ───────────────────────────────────────
        $staticPages = [
            ['url' => 'https://publicationmart.com/', 'changefreq' => 'daily', 'priority' => '1.0'],
            ['url' => 'https://publicationmart.com/about', 'changefreq' => 'monthly', 'priority' => '0.8'],
            ['url' => 'https://publicationmart.com/services', 'changefreq' => 'monthly', 'priority' => '0.8'],
            ['url' => 'https://publicationmart.com/how-to-publish', 'changefreq' => 'monthly', 'priority' => '0.8'],
            ['url' => 'https://publicationmart.com/book-store', 'changefreq' => 'daily', 'priority' => '0.9'],
            ['url' => 'https://publicationmart.com/studio', 'changefreq' => 'daily', 'priority' => '0.7'],
            ['url' => 'https://publicationmart.com/challenges', 'changefreq' => 'weekly', 'priority' => '0.6'],
            ['url' => 'https://publicationmart.com/contact', 'changefreq' => 'yearly', 'priority' => '0.5'],
            ['url' => 'https://publicationmart.com/royalty-calculator', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['url' => 'https://publicationmart.com/login', 'changefreq' => 'yearly', 'priority' => '0.3'],
            ['url' => 'https://publicationmart.com/register', 'changefreq' => 'yearly', 'priority' => '0.3'],
            ['url' => 'https://publicationmart.com/privacy-policy', 'changefreq' => 'yearly', 'priority' => '0.2'],
            ['url' => 'https://publicationmart.com/terms-of-service', 'changefreq' => 'yearly', 'priority' => '0.2'],
        ];

        // ─── Dynamic: Approved Books ────────────────────────────
        $books = Book::where('status', 'approved')
            ->select('id', 'updated_at')
            ->latest()
            ->get();

        // ─── Dynamic: Published Blogs ───────────────────────────
        $blogs = Blog::where('is_published', true)
            ->select('slug', 'updated_at')
            ->latest()
            ->get();

        // ─── Build XML ──────────────────────────────────────────
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Static pages
        $today = now()->format('Y-m-d');
        foreach ($staticPages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$page['url']}</loc>\n";
            $xml .= "    <lastmod>{$today}</lastmod>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        // Book pages
        foreach ($books as $book) {
            $lastmod = $book->updated_at ? $book->updated_at->format('Y-m-d') : $today;
            $xml .= "  <url>\n";
            $xml .= "    <loc>https://publicationmart.com/book-store/{$book->id}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        // Blog pages
        foreach ($blogs as $blog) {
            $lastmod = $blog->updated_at ? $blog->updated_at->format('Y-m-d') : $today;
            $xml .= "  <url>\n";
            $xml .= "    <loc>https://publicationmart.com/studio/{$blog->slug}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
