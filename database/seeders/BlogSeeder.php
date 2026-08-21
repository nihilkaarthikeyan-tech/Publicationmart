<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $blogs = [
            [
                'title' => 'The Complete Guide to Self-Publishing in 2026',
                'slug' => 'complete-guide-to-self-publishing-2026',
                'excerpt' => 'Discover the step-by-step process of turning your manuscript into a professionally published book, from formatting to distribution.',
                'content' => '
                    <h2>Why Self-Publishing is Taking Over</h2>
                    <p>Gone are the days when you needed a "gatekeeper" to approve your work. Today, authors have more power than ever...</p>
                    <h3>Step 1: Professional Editing</h3>
                    <p>No matter how good your story is, typos break immersion. Hiring a professional editor is non-negotiable...</p>
                    <h3>Step 2: Cover Design</h3>
                    <p>People <i>do</i> judge books by their covers. Your cover needs to compete with bestsellers on the shelf...</p>
                    <h3>Step 3: Global Distribution</h3>
                    <p>With PublicationMart, your book reaches 100+ countries instantly. We handle the complex logistics...</p>
                ',
                'image_url' => 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2070',
                'author_name' => 'Dr. R. Karthik',
                'category' => 'Publishing',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => '5 Marketing Strategies for New Authors',
                'slug' => '5-marketing-strategies-for-new-authors',
                'excerpt' => 'Writing the book is only half the battle. Learn how to get your book into the hands of readers effectively.',
                'content' => '
                    <h2>1. Build Your Email List Early</h2>
                    <p>Don\'t wait until launch day. Start collecting emails now by offering a free chapter...</p>
                    <h2>2. Leverage Social Media</h2>
                    <p>TikTok (BookTok) and Instagram (Bookstagram) are powerful tools for fiction authors...</p>
                    <h2>3. Get Reviews</h2>
                    <p>Social proof is everything. Send Advance Reader Copies (ARCs) to potential reviewers...</p>
                ',
                'image_url' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2074',
                'author_name' => 'Sarah Jenkins',
                'category' => 'Marketing',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'How AI is Changing the Writing Landscape',
                'slug' => 'how-ai-is-changing-writing',
                'excerpt' => 'Explore how artificial intelligence tools are helping authors outline, draft, and edit faster than ever before.',
                'content' => '
                    <h2>The AI Revolution</h2>
                    <p>AI isn\'t here to replace authors; it\'s here to serve them. Tools like our AI Book Studio allow you to...</p>
                    <h3>Overcoming Writer\'s Block</h3>
                    <p>Stuck on a chapter? Let AI suggest the next plot twist or outline the scene for you...</p>
                ',
                'image_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2070',
                'author_name' => 'Tech Team',
                'category' => 'Writing Tips',
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'Understanding Royaties: Where Does the Money Go?',
                'slug' => 'understanding-royalties',
                'excerpt' => 'A clear breakdown of book pricing, printing costs, and how much you actually earn per sale.',
                'content' => '
                    <h2>The Traditional vs. Self-Publishing Model</h2>
                    <p>In traditional publishing, authors often see 8-10% royalties. With PublicationMart, you keep up to 100% of net profits...</p>
                ',
                'image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2070',
                'author_name' => 'Finance Dept',
                'category' => 'Success Stories',
                'published_at' => now()->subDays(15),
            ],
            [
                'title' => 'From Draft to Bestseller: An Author\'s Journey',
                'slug' => 'draft-to-bestseller-journey',
                'excerpt' => 'Read the inspiring story of how one PublicationMart author sold 10,000 copies in their first month.',
                'content' => '
                    <h2>Meet Priya</h2>
                    <p>Priya had a manuscript sitting in her drawer for 5 years. She was afraid of rejection...</p>
                    <h2>The Turning Point</h2>
                    <p>She decided to take control. Using our platform, she formatted her book in 2 hours...</p>
                ',
                'image_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1974',
                'author_name' => 'Priya S.',
                'category' => 'Success Stories',
                'published_at' => now()->subDays(20),
            ],
        ];

        foreach ($blogs as $blog) {
            \App\Models\Blog::create($blog);
        }
    }
}
