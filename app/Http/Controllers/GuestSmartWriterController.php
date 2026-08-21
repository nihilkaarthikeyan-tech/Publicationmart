<?php

namespace App\Http\Controllers;

use App\Models\GuestWritingSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Services\Ai\AnthropicService;
use App\Services\Ai\OpenAiImageService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Mail;
use App\Mail\GuestSessionAccess;

class GuestSmartWriterController extends Controller
{
    protected $aiService;
    protected $imageService;
    protected $phonePeService;

    public function __construct(AnthropicService $aiService, OpenAiImageService $imageService, \App\Services\Payment\PhonePeService $phonePeService)
    {
        $this->aiService = $aiService;
        $this->imageService = $imageService;
        $this->phonePeService = $phonePeService;
    }

    public function pricing()
    {
        // Allow logged-in users to access
        // if (auth()->check()) { return redirect()->route('dashboard'); }

        // Define pricing structure for view if needed (optional since we hardcode in view now)
        // But let's pass empty or basic metadata
        return Inertia::render('GuestSmartWriter/Pricing', []);
    }

    public function payment(Request $request)
    {
        // Enforce Direct Entry (Bypass Payment)
        // If users hit this route manually, redirect to setup
        return redirect()->route('guest-writer.setup', $request->query());
    }

    /**
     * Show Checkout Page for Guest Writer
     */
    public function setup(Request $request)
    {
        $plan = $request->query('plan', 'saver');
        $pages = $request->query('pages', '80-100');

        $ranges = ['saver' => '80-100', 'standard' => '100-150', 'pro' => '150-200', 'enterprise' => '200-250'];
        $finalRange = $ranges[$plan] ?? '80-100';

        // Calculate Price
        $price = GuestWritingSession::getPlanPrice($plan, $finalRange);
        // $price = 1; // TESTING ONLY: Force 1 Rupee as requested

        return Inertia::render('GuestSmartWriter/GuestCheckout', [
            'plan' => $plan,
            'pages' => $finalRange,
            'price' => $price
        ]);
    }

    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'full_name' => 'required|string',
            'book_title' => 'required|string|max:255',
            'plan_type' => 'required|in:saver,standard,pro,enterprise',
            'page_range' => 'nullable|string', // We will derive this, but keep validation loose
        ]);

        // STRICT LOGIC: Enforce Plan -> Page Range Mapping (Same as AiBookStudio)
        $ranges = [
            'saver' => '80-100',
            'standard' => '100-150',
            'pro' => '150-200',
            'enterprise' => '200-250'
        ];

        $planType = $validated['plan_type'];
        $pageRange = $ranges[$planType] ?? '80-100'; // Default to Saver if unknown

        $price = GuestWritingSession::getPlanPrice($planType, $pageRange);
        // $price = 1; // TESTING ONLY: Force 1 Rupee processing

        // Determine image limit based on page range (All paid plans get images now)
        $imageLimit = 15;
        switch ($pageRange) {
            case '80-100':
                $imageLimit = 15;
                break;
            case '100-150':
                $imageLimit = 20;
                break;
            case '150-200':
                $imageLimit = 30;
                break;
            default: // 200-250 and others
                $imageLimit = 45;
                break;
        }

        $session = GuestWritingSession::create([
            'session_token' => GuestWritingSession::generateToken(),
            'user_id' => auth()->id(), // Link to user if logged in
            'email' => $validated['email'],
            'full_name' => $validated['full_name'],
            'title' => $validated['book_title'],
            'plan_type' => $validated['plan_type'],
            'plan_name' => $pageRange,
            'amount_paid' => $price,
            'payment_status' => 'pending', // CHANGED from 'paid' to 'pending'
            'image_credits_limit' => $imageLimit,
            'current_step' => 1,
            'paid_at' => null, // Will be set on success
            'expires_at' => now()->addDays(30),
            'chapters_data' => [],
        ]);

        session(['guest_writer_token' => $session->session_token]);

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        $host = request()->getHost();
        $isTestDomain = str_contains($host, 'radinfotec') || str_contains($host, 'localhost') || $host === '127.0.0.1';
        
        if ($isTestDomain) {
            \Illuminate\Support\Facades\Log::info('Bypassing Guest Writer payment for test domain: ' . $host);
            
            // Fulfill the session directly
            $session->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
            
            // Send access email
            try {
                \Illuminate\Support\Facades\Mail::to($session->email)->send(new \App\Mail\GuestSessionAccess($session));
            } catch (\Exception $e) {
                // Ignore email failure on bypass
            }
            
            return redirect()->route('guest-writer.studio', ['token' => $session->session_token]);
        }

        // INITIATE PAYMENT
        $txnId = 'GUEST_' . $session->id;
        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        // Store transaction ID in session for fallback retrieval on redirect
        session(['pending_payment_txn_id' => $txnId]);

        $response = $this->phonePeService->initiatePayment(
            $txnId,
            $price,
            $callbackUrl,
            $redirectUrl,
            auth()->id(), // User ID if available
            '9999999999'  // We don't have phone in guest form, defaulting
        );

        if ($response['success']) {
            return Inertia::location($response['url']);
        }

        return back()->with('error', 'Payment Initiation Failed: ' . ($response['message'] ?? 'Unknown'));
    }

    public function studio($token)
    {
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        // Refresh session token cookie so account linking works if they register later
        session(['guest_writer_token' => $token]);

        if ($session->payment_status !== 'paid') {
            return redirect()->route('guest-writer.pricing')->with('error', 'Invalid Session. Please start over.');
        }

        return Inertia::render('GuestSmartWriter/Studio', [
            'session' => $session,
            'token' => $token,
            'existingChapters' => $session->chapters_data ?? [],
        ]);
    }

    public function save(Request $request, $token)
    {
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        $validated = $request->validate([
            'current_step' => 'nullable|integer',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author_name' => 'nullable|string|max:255',
            'full_name' => 'nullable|string',
            'email' => 'nullable|email',
            'genre' => 'nullable|string|max:255',
            'about_book' => 'nullable|string',
            'chapters_data' => 'nullable|array',
        ]);

        // Access Link Logic:
        // If updating email from placeholder to real email, send the access link.
        if (isset($validated['email']) && !empty($validated['email']) && $validated['email'] !== $session->email) {
            // Check if current was placeholder
            if (str_starts_with($session->email, 'guest_') || $session->email !== $validated['email']) {
                // Send Email
                try {
                    Mail::to($validated['email'])->send(new GuestSessionAccess($session));
                } catch (\Exception $e) {
                    Log::error("Failed to send guest access email: " . $e->getMessage());
                }
            }
        }

        $session->update($validated);

        return response()->json(['message' => 'Progress saved successfully.']);
    }

    public function generateOutline(Request $request)
    {
        $token = $request->input('session_token');
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        $request->validate([
            'topic' => 'required|string',
            'chapter_count' => 'required|integer|min:3|max:15',
            'sub_chapter_count' => 'required|integer|min:2|max:15',
        ]);

        // Check for Manual Mode
        if ($request->input('mode') === 'manual' && $request->has('manual_content')) {
            $input = $request->input('manual_content');
            // Support both array (if sent via JSON) or string with newlines
            $titles = is_array($input) ? $input : explode("\n", trim($input));

            $titles = array_filter(array_map('trim', $titles)); // Clean empty lines

            $structuredChapters = [];
            foreach ($titles as $index => $title) {
                $structuredChapters[] = [
                    'id' => "ch_" . uniqid(),
                    'title' => $title,
                    'outline' => "Manual entry",
                    'order' => $index + 1,
                    'sections' => []
                ];
            }

            $session->chapters_data = $structuredChapters;
            $session->save();

            return response()->json(['success' => true, 'chapters_data' => $structuredChapters]);
        }

        $topic = $request->input('topic');
        $audience = 'General Readers';
        $count = $request->input('chapter_count', 10);
        $subCount = $request->input('sub_chapter_count', 5);

        // LOGIC: Validate Limits & Constraints (Dynamic Plan-Based)
        $planRange = $session->plan_name ?? '80-100'; // e.g. "80-100"
        $maxPages = 100; // default
        if (preg_match('/-(\d+)/', $planRange, $matches)) {
            $maxPages = intval($matches[1]);
        }

        // Define Limits
        $limitCh = 12;
        $limitSub = 10; // Saver
        if ($maxPages >= 200) {
            $limitCh = 25;
            $limitSub = 20;
        } // Enterprise
        elseif ($maxPages >= 150) {
            $limitCh = 20;
            $limitSub = 15;
        } // Pro
        elseif ($maxPages >= 120) {
            $limitCh = 15;
            $limitSub = 12;
        } // Standard

        if ($count > $limitCh)
            return response()->json(['message' => "Max {$limitCh} chapters allowed for your plan."], 422);
        if ($subCount > $limitSub)
            return response()->json(['message' => "Max {$limitSub} sub-chapters allowed for your plan."], 422);

        $totalSub = $count * $subCount;
        $pagesPerSub = floor($maxPages / $totalSub);

        // Rule: Must be at least 1 page per section
        if ($pagesPerSub < 1) {
            return response()->json([
                'success' => false,
                'message' => "Structure too large for plan. {$totalSub} sections exceed the {$maxPages} page limit (calculated < 1 page/section). Please reduce structure."
            ], 422);
        }

        $prompt = "Create a detailed book outline.\n\n" .
            "Topic: {$topic}\n" .
            "Genre/Style: " . ($session->genre ?? 'General') . "\n" .
            "Audience: {$audience}\n" .
            "Number of Chapters: {$count}\n\n" .
            "Strict Output Format:\n" .
            "Return ONLY a JSON array of chapter titles (strings).";

        try {
            $response = $this->aiService->generateContent(
                "You are an outline generator.\n\nRules:\n- Output ONLY valid JSON\n- No explanations\n- No markdown",
                $prompt
            );

            $cleanJson = str_replace(['```json', '```'], '', $response);
            $titles = json_decode($cleanJson, true);

            if (!is_array($titles))
                throw new \Exception("Invalid JSON from AI");

            $structuredChapters = [];
            foreach ($titles as $index => $title) {
                $structuredChapters[] = [
                    'id' => "ch_" . uniqid(),
                    'title' => $title,
                    'outline' => "Focuses on {$title}",
                    'order' => $index + 1,
                    'sections' => [] // Empty initially, generated in Step 3
                ];
            }

            $session->chapters_data = $structuredChapters;
            $session->save();

            return response()->json(['success' => true, 'chapters_data' => $structuredChapters]);

        } catch (\Exception $e) {
            Log::error("Guest Outline Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function generateSections(Request $request)
    {
        $token = $request->input('session_token');
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        $request->validate([
            'chapter_id' => 'required',
            'count' => 'nullable|integer'
        ]);

        $chapters = $session->chapters_data ?? [];
        $activeChapter = null;
        $chapterIndex = -1;

        foreach ($chapters as $index => $chap) {
            if ($chap['id'] == $request->chapter_id) {
                $activeChapter = $chap;
                $chapterIndex = $index;
                break;
            }
        }

        if (!$activeChapter) {
            return response()->json(['message' => 'Chapter not found'], 404);
        }

        // Get user preference, default to 5
        $requestedCount = $request->input('count', 5);
        $count = max(2, min(15, intval($requestedCount)));

        // Manual content handling (if passed)
        if ($request->has('manual_content') && is_array($request->input('manual_content'))) {
            $manualSections = $request->input('manual_content');
            $sections = [];
            foreach ($manualSections as $idx => $title) {
                $sections[] = [
                    'id' => "sec_" . uniqid(),
                    'title' => $title,
                    'content' => '',
                    'image_url' => null,
                    'order' => $idx + 1
                ];
            }
            $chapters[$chapterIndex]['sections'] = $sections;
            $session->chapters_data = $chapters;
            $session->save();
            return response()->json(['success' => true, 'sections' => $sections]);
        }

        // AI Generation
        $genre = $session->genre ?? 'General';
        $prompt = "For the chapter \"{$activeChapter['title']}\" (Book: {$session->title}), generate exactly {$count} sub-chapter/section titles.\n" .
            "Genre/Style: {$genre}\n\n" .
            "Strict Output Format:\n" .
            "Return ONLY a JSON array of strings.";

        try {
            $response = $this->aiService->generateContent(
                "You generate book section headings.\n\nRules:\n- Output ONLY valid JSON\n- No explanations\n- No markdown",
                $prompt
            );

            $cleanJson = str_replace(['```json', '```'], '', $response);
            $titles = json_decode($cleanJson, true);

            if (!is_array($titles))
                throw new \Exception("Invalid JSON from AI");

            $sections = [];
            foreach ($titles as $index => $title) {
                $sections[] = [
                    'id' => "sec_" . uniqid(),
                    'title' => $title,
                    'content' => '',
                    'image_url' => null,
                    'order' => $index + 1
                ];
            }

            $chapters[$chapterIndex]['sections'] = $sections;
            $session->chapters_data = $chapters;
            $session->save();

            return response()->json(['success' => true, 'sections' => $sections]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function generateSectionContent(Request $request)
    {
        $token = $request->input('session_token');
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        $request->validate([
            'section_id' => 'required',
            'topic' => 'nullable|string',
            'tone' => 'nullable|string',
            'perspective' => 'nullable|string',
            'word_count' => 'nullable|integer'
        ]);

        $chapters = $session->chapters_data ?? [];
        $activeChapter = null;
        $activeSection = null;
        $chapterIndex = -1;
        $sectionIndex = -1;

        foreach ($chapters as $cIdx => $chap) {
            foreach ($chap['sections'] as $sIdx => $sec) {
                if ($sec['id'] == $request->section_id) {
                    $activeChapter = $chap;
                    $activeSection = $sec;
                    $chapterIndex = $cIdx;
                    $sectionIndex = $sIdx;
                    break 2;
                }
            }
        }

        if (!$activeSection)
            return response()->json(['message' => 'Section not found'], 404);

        $tone = $request->input('tone', 'Professional');
        $perspective = $request->input('perspective', '3rd Person');

        // LOGIC: DYNAMIC PAGE DISTRIBUTION
        $planRange = $session->plan_name ?? '80-100';
        $maxPages = 100; // default

        // 1. Strict Plan-Based Limit (Overrides regex if plan_type is reliable)
        if ($session->plan_type === 'saver')
            $maxPages = 100;
        elseif ($session->plan_type === 'standard')
            $maxPages = 150;
        elseif ($session->plan_type === 'pro')
            $maxPages = 200;
        elseif ($session->plan_type === 'enterprise')
            $maxPages = 250;

        // 2. Fallback Regex (for cases where plan_type might be old/missing)
        elseif (preg_match('/-(\d+)/', $planRange, $matches)) {
            $maxPages = intval($matches[1]);
        }
        // 3. Fallback for single number strings "100"
        elseif (is_numeric($planRange)) {
            $maxPages = intval($planRange);
        }

        // Calculate Total Sub-chapters (Global Context)
        $totalSubchapters = 0;
        foreach ($chapters as $chap) {
            $totalSubchapters += count($chap['sections'] ?? []);
        }

        // Fallback if structure is oddly empty but we are generating? 
        // Should not happen as we are generating FOR a section, so at least 1 exists.
        if ($totalSubchapters < 1)
            $totalSubchapters = 1;

        // ALLOCATION LOGIC per requirement (UPDATED FOR EFFICIENCY)
        // Old Logic: floor(pages / sections) -> wasted space (e.g. 1.5 pages became 1)
        // New Logic: (pages * 275) / sections -> precise word count

        $totalCapacityWords = $maxPages * 275;
        $targetWords = floor($totalCapacityWords / $totalSubchapters);
        $pagesPerSubchapter = $targetWords / 275; // For prompt context (can be float now)

        // Minimum viable length check (approx 0.5 pages or 130 words)
        if ($targetWords < 130) {
            return response()->json(['message' => 'Structure validation failed: Sections are too numerous for the page limit. result would be too short.'], 422);
        }

        // STRICT 6x9 FORMAT: 275 words per page is the standard for 6x9" books
        // We now use the precise targetWords calculated above

        $audience = 'General Readers';
        $topic = $request->input('topic') ?? $session->about_book ?? $session->title;

        // Enhanced Prompt with Strict Physical Layout Constraints based on DISTRIBUTION
        $prompt = "Write the full content for the sub-chapter \"{$activeSection['title']}\".\n\n" .
            "context:\n" .
            "- Chapter: \"{$activeChapter['title']}\"\n" .
            "- Topic (CORE CONCEPT): \"{$topic}\"\n" .
            "- Genre/Style: \"{$session->genre}\"\n" .
            "- Tone: {$tone}\n" .
            "- Perspective: {$perspective}\n\n" .
            "CONTENT PRIORITY:\n" .
            "- The TOPIC is the absolute main focus. Ensure every paragraph serves the Book Concept.\n" .
            "- Use the Genre to shape *how* you write, but the Topic dictates *what* you write.\n\n" .
            "PHYSICAL LAYOUT REQUIREMENT (NON-NEGOTIABLE):\n" .
            "- ABSOLUTE MAXIMUM LENGTH: {$targetWords} words.\n" .
            "- You MUST Stop writing before you reach {$targetWords} words.\n" .
            "- Do NOT exceed {$pagesPerSubchapter} physical pages (approx {$targetWords} words).\n" .
            "- Content MUST fit exactly within this limit. Be concise.\n" .
            "- Maintain consistent formatting.";

        try {
            $content = $this->aiService->generateContent(
                "You are an expert professional author who writes concisely.\n\n" .
                "STRICT RULES:\n" .
                "1. LENGTH: MAXIMUM {$targetWords} words. DO NOT EXCEED THIS LIMIT.\n" .
                "2. QUALITY: Use publication-ready Standard English. Perfect grammar.\n" .
                "3. STRUCTURE: Use paragraphs and standard HTML tags (<h3>, <p>).\n" .
                "4. NO TITLE: Do NOT repeat the section title. Start writing immediately.\n" .
                "5. CONCISENESS: Stop writing when you reach the word limit. Less is acceptable, more is NOT.",
                $prompt
            );

            if (empty($content)) {
                throw new \Exception("AI returned empty content.");
            }

            // POST-PROCESSING: Force removal of duplicate title if AI ignored the rule
            $lines = explode("\n", trim($content));
            if (!empty($lines)) {
                $firstLine = trim(str_replace(['#', '*', '_', '<h3>', '</h3>'], '', $lines[0])); // Remove Markdown/HTML syntax
                $sectionTitleClean = trim(str_replace(['#', '*', '_'], '', $activeSection['title']));

                // If first line is very similar to section title, remove it
                if (stripos($firstLine, $sectionTitleClean) !== false || preg_match("/^" . preg_quote($sectionTitleClean, '/') . "/i", $firstLine)) {
                    array_shift($lines);
                    $content = implode("\n", $lines);
                }
            }
            $content = trim($content);

            // POST-PROCESSING: HARD TRUNCATION to enforce word limit
            $words = preg_split('/\s+/', strip_tags($content));
            if (count($words) > $targetWords) {
                // Truncate to target words, preserving HTML structure as much as possible
                $truncatedWords = array_slice($words, 0, $targetWords);
                // Find the last complete sentence or paragraph break
                $truncatedText = implode(' ', $truncatedWords);
                // Try to end at a sentence
                $lastPeriod = strrpos($truncatedText, '.');
                if ($lastPeriod !== false && $lastPeriod > ($targetWords * 0.7 * 5)) { // At least 70% of content
                    $truncatedText = substr($truncatedText, 0, $lastPeriod + 1);
                }
                $content = '<p>' . nl2br($truncatedText) . '</p>';
            } else {
                // If content is short enough, ensure it is HTML formatted
                if (strip_tags($content) === $content) {
                    // No tags found, convert integers/newlines to HTML
                    $content = '<p>' . nl2br($content) . '</p>';
                }
            }

            $chapters[$chapterIndex]['sections'][$sectionIndex]['content'] = $content;
            $session->chapters_data = $chapters;
            $session->save();

            return response()->json(['success' => true, 'content' => $content]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function generateImage(Request $request)
    {
        $token = $request->input('session_token');
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        // Allow all paid plans to generate images
        // if ($session->plan_type !== 'premium') { ... }

        $request->validate([
            'section_id' => 'required', // Now required as primary lookup
            'section_title' => 'nullable|string', // Optional, can be inferred
            'chapter_title' => 'nullable|string', // Optional
            'book_topic' => 'nullable|string', // Optional
            'mode' => 'nullable|string',
            'custom_prompt' => 'nullable|string'
        ]);

        try {
            // Check limits against database field
            if ($session->image_credits_used >= $session->image_credits_limit) {
                return response()->json(['message' => 'You have reached your image limit.'], 403);
            }

            $source = ($request->mode === 'custom' && !empty($request->custom_prompt)) ? 'manual' : 'automatic';

            $sectionTitle = $request->section_title;
            // ... (keep existing logic to find section title/content) ...
            if ($request->section_id) {
                foreach ($session->chapters_data as $cIdx => $chap) {
                    foreach ($chap['sections'] as $sIdx => $sec) {
                        if ($sec['id'] === $request->section_id) {
                            $sectionTitle = $sec['title'];
                            $sectionContent = $sec['content'] ?? "";
                            $chapterTitle = $chap['title'];
                            // FOUND: Keep indices to update later
                            $targetChapterIndex = $cIdx;
                            $targetSectionIndex = $sIdx;
                            break 2;
                        }
                    }
                }
            }

            if ($source === 'manual') {
                $prompt = $request->custom_prompt;
            } else {
                // --- GENRE-SPECIFIC PROMPT LOGIC ---
                $genre = $session->genre ?? 'General';
                $topic = $request->book_topic ?? $session->about_book ?? $session->title;
                $title = $sectionTitle ?? $request->section_title;

                // Use 750 chars for richer context so each section generates a more unique image
                $summary = $sectionContent ? substr(strip_tags($sectionContent), 0, 750) : "A section titled '{$title}' about {$topic}";
                // Extract the most visually distinctive keyword from the title to guide the image
                $titleKeyword = trim(preg_replace('/[^\w\s]/u', '', $title));
                $summary = str_replace(["\r", "\n"], " ", $summary);

                // ---------------------------------------------------------------
                // FICTION = Artistic / Illustrative / Stylized
                // NON-FICTION = Realistic / Informative / Photographic
                // ---------------------------------------------------------------

                // 1. FICTION GENRES — artistic, illustrated, emotionally evocative
                if (stripos($genre, 'Children') !== false) {
                    $template = "Premium children's picture book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: rich full-bleed environment, characters integrated into their world, warm vibrant color palette with atmospheric depth, visible gouache or watercolor brushstroke texture, expressive characters full of personality. Style: Caldecott Medal picture book quality — Pixar concept art meets Quentin Blake warmth. Mood: joyful, adventurous, warm. Rules: no plain white backgrounds, no clip-art, child-friendly, no text.";
                } elseif (stripos($genre, 'Fantasy') !== false) {
                    $template = "Epic fantasy concept art illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: sweeping cinematic landscape or dramatic architectural scene, rich deep colors (golds, crimson, midnight blue, forest green), intricate world details with ancient ruins and glowing magical elements, dramatic sky, environment as the hero — scale, depth, wonder, silhouettes or distant figures only. Style: AAA game concept art quality — Brandon Sanderson cover art meets Lord of the Rings concept paintings. Mood: mythical, vast, wondrous, immersive. Rules: no photorealism, no generic fantasy heroes, no text.";
                } elseif (stripos($genre, 'Science Fiction') !== false || stripos($genre, 'Sci-Fi') !== false) {
                    $template = "Cinematic science fiction concept art for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: realistic futuristic environment, cool desaturated palette with selective warm accent light, vast scale — space, megastructures or alien landscapes, atmospheric depth with mist and light rays, single powerful focal element. Style: hard sci-fi concept art — NASA visualization meets film production design (Arrival, Interstellar aesthetic). Mood: awe, vast, wonder, future. Rules: no neon cyberpunk clichés, no text, not photorealistic, cinematic only.";
                } elseif (stripos($genre, 'Romance') !== false) {
                    $template = "Premium romance novel illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: warm intimate lighting — golden hour or candlelight, rich rose, burgundy and warm gold palette, atmospheric soft-focus background with sharp emotional foreground, tension and longing — stolen glance or charged moment, lush environmental detail (flowers, rain, fabric texture). Style: painterly romantic editorial — Bridgerton aesthetic, warm and lush. Mood: longing, warmth, intimacy, hope. Rules: no generic couple clipart, no text, tasteful only.";
                } elseif (stripos($genre, 'Mystery') !== false || stripos($genre, 'Thriller') !== false) {
                    $template = "Psychological thriller illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: rain-slicked urban environment or claustrophobic interior, dramatic high-contrast noir lighting — deep blacks and sharp highlights, desaturated palette with one cold accent color, strong sense of unseen threat, cinematic unusual angle. Style: graphic novel meets cinematic still — Fincher film aesthetic (Gone Girl, Dragon Tattoo energy). Mood: tense, unsettling, intelligent, dangerous. Rules: no cartoons, no text, psychological not gory.";
                } elseif (stripos($genre, 'Horror') !== false) {
                    $template = "Psychological horror illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: deeply atmospheric scene of isolation, wrongness and decay, muted desaturated palette with one unsettling accent color, ambient dread — something is wrong but unidentifiable, environmental horror where the location feels alive and threatening, negative space used deliberately. Style: atmospheric literary horror — The Shining, Hereditary, Stephen King aesthetic. Mood: dread, wrongness, isolation, creeping unease. Rules: no gore, no jump-scare imagery, no cartoons, no text, psychological only.";
                } elseif (stripos($genre, 'Historical Fiction') !== false) {
                    $template = "Immersive historical fiction illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: rich oil-painting aesthetic with warm amber and earth tones, living period scene with people in motion, authentic period architecture and costume, warm candlelight or golden hour natural light, cinematic storytelling composition with diagonal movement. Style: Renaissance oil painting meets cinematic storytelling — Hilary Mantel adaptations, Ken Follett covers. Mood: lived-in, vivid, immersive, historically rich. Rules: no identifiable real persons, no modern aesthetics, no text, NOT a photograph.";
                } elseif (stripos($genre, 'Adventure') !== false) {
                    $template = "Classic adventure book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: sweeping dramatic landscape — jungle, mountain, ocean or desert, bold graphic composition with strong horizon and sense of scale, vibrant saturated palette, hero(s) small against vast environment for tension, dynamic diagonal composition with movement and momentum. Style: classic adventure — Indiana Jones posters, National Geographic adventure aesthetic. Mood: discovery, danger, freedom, exhilaration. Rules: no flat imagery, no generic action poses, no text, environment is essential.";
                } elseif (stripos($genre, 'Young Adult') !== false || stripos($genre, 'YA') !== false) {
                    $template = "Contemporary young adult fiction illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: bold graphic composition striking at thumbnail size, emotional color palette — rich jewel tones or bold contrast pairs, symbolic imagery over literal — emotion over plot, strong silhouette or iconic single figure, designed to perform on BookTok and Instagram. Style: contemporary YA editorial — Hunger Games, Six of Crows, They Both Die at the End cover energy. Mood: intense, emotional, identity, belonging, defiance. Rules: no childish imagery, no text, bold graphic impact required.";
                } elseif (stripos($genre, 'Literary') !== false) {
                    $template = "Award-winning literary fiction illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Composition: abstract symbolic imagery that suggests theme without illustrating literally, bold painterly textures with confident brushwork, muted or limited color palette — 2-3 tones maximum, strong graphic composition, atmosphere over narrative — mood first. Style: fine art meets editorial — Booker Prize shortlist, Penguin Modern Classics cover quality. Mood: contemplative, literary, emotionally layered. Rules: no cartoons, no generic painted scenes, no text, subtle not obvious.";
                }

                // 2. NON-FICTION GENRES — section-title driven, diverse visual output
                elseif (stripos($genre, 'Academic') !== false || stripos($genre, 'Textbook') !== false) {
                    $template = "Unique conceptual editorial illustration for the textbook section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Identify the single most abstract or conceptual idea in this section title (e.g. 'Lean Manufacturing' → flowing production lines as rivers, 'Industrial Revolution' → historical factory contrasted with modern network, 'Global Shift' → world map with economic flow lines). DO NOT default to generic robotic arms or factory floors unless that specific object is the key concept. Instead, represent the IDEA symbolically. Composition: dark premium background, warm amber and slate tones, one powerful metaphorical focal image. Style: Bloomberg Businessweek meets Nature magazine cover — editorial and conceptual. Mood: authoritative, thought-provoking. Rules: No cartoons, no clip-art, every image must visually differentiate from other sections in the same book.";
                } elseif (stripos($genre, 'Scientific') !== false || stripos($genre, 'Research') !== false) {
                    $template = "Unique scientific visualization for the research section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: The image must visually represent the SPECIFIC scientific phenomenon or concept in this section title — not generic lab equipment. Identify the key object (molecule, ecosystem, brain, climate system, genome, etc.) and render it with stunning realism. Composition: deep dark background (midnight blue or charcoal), volumetric lighting, photorealistic visualization of the specific concept, glowing accent highlights (teal, white, gold). Style: Nature/Science magazine cover meets cinematic diagram. Rules: no cartoons, scientifically accurate, must be unique to this section topic.";
                } elseif (stripos($genre, 'Technical') !== false || stripos($genre, 'Professional') !== false) {
                    $template = "Unique technical visualization for the professional section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Identify the core technical subject in this title and represent it precisely — avoid repeating generic circuit boards or gears across sections. The image must be conceptually tied to exactly this section. Composition: dark professional background, isometric or 3D-style rendering of the specific concept, electric blue and silver blueprint accents, clean hierarchy. Style: O'Reilly book cover meets cinematic blueprint. Rules: no artistic flourishes, technically accurate to the section topic.";
                } elseif (stripos($genre, 'Business') !== false || stripos($genre, 'Economics') !== false) {
                    $template = "Unique premium business editorial illustration for the section titled '{$title}' about '{$topic}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Identify the single most powerful business concept in this section title (e.g. 'Supply Chain' → interconnected network, 'Leadership' → lone figure on summit, 'Market Disruption' → waves fragmenting old structure). Represent that concept symbolically — never use stock photo handshakes or bar charts. Composition: dark sophisticated background, warm golden accent lighting, one strong symbolic focal image. Style: The Economist cover meets premium business book. Rules: no clip-art, no generic imagery, every section must look visually distinct.";
                } elseif (stripos($genre, 'Self-Help') !== false || stripos($genre, 'Personal Development') !== false) {
                    $template = "Unique aspirational cinematic illustration for the self-help section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Each section must have a visually distinct look — derive the symbolic imagery directly from the section title. (e.g. 'Building Habits' → brick wall being constructed, 'Fear' → shadow looming over small figure, 'Clarity' → fog parting to reveal horizon). Never repeat a similar composition across sections. Composition: warm golden hour lighting, symbolic transformation imagery specific to this concept, rich warm tones. Style: Atomic Habits cover meets cinematic editorial. Rules: no cartoons, no generic motivational posters.";
                } elseif (stripos($genre, 'Biography') !== false || stripos($genre, 'Autobiography') !== false) {
                    $template = "Unique cinematic documentary illustration for the biography section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Derive the scene from the specific life event or theme in this section title — not a generic portrait. (e.g. 'The Early Years' → childhood street scene, 'Rise to Power' → ascending staircase with dramatic light, 'Legacy' → symbolic monument or ripple effect). Composition: Rembrandt-style portrait lighting, aged sepia tones, vintage editorial style. Style: National Geographic meets TIME magazine. Rules: no identifiable real persons, no modern aesthetics, must be specific to this section.";
                } elseif (stripos($genre, 'History') !== false) {
                    $template = "Unique cinematic historical illustration for the section titled '{$title}': [CHAPTER SUMMARY]. CRITICAL VISUAL DIRECTION: Each section must depict a visually distinct historical scene derived directly from its title — never reuse the same setting across sections. Identify the specific era and event (e.g. 'Ancient Rome' → colosseum at dusk, 'World War II' → wartime cityscape, 'The Renaissance' → studio with scholars and art). Composition: Rembrandt-style dramatic lighting, earthy period tones, authentic architecture and costumes. Rules: no cartoons, no modern aesthetics, historically specific to this section.";
                } else {
                    if (stripos($genre, 'Fiction') !== false && stripos($genre, 'Non') === false) {
                        $template = "Unique artistic narrative illustration for the chapter titled '{$title}': [CHAPTER SUMMARY]. CRITICAL: The image must be visually unique and derived from the specific themes of this chapter title — not a generic illustration. Composition: vibrant painterly digital art, cinematic dramatic lighting, single compelling focal composition specific to this chapter. Rules: NOT photorealistic, no text, visually distinct from other chapters.";
                    } else {
                        $template = "Unique premium editorial illustration for the section titled '{$title}' about '{$topic}': [CHAPTER SUMMARY]. CRITICAL: Identify the most important concept in this section title and represent it visually — avoid generic imagery. Composition: dark professional background, atmospheric lighting, strong focal composition specific to this section. Rules: no cartoons, no flat styling, each image must look unique.";
                    }
                }

                // Inject Content
                $prompt = str_replace('[CHAPTER SUMMARY]', $summary, $template);

                // CRITICAL: Text Language + Uniqueness Enforcement
                $prompt .= " \n\nCRITICAL RULES: (1) Any text included in the image MUST be legible English — no fake symbols or gibberish. (2) UNIQUENESS: This image must look visually different from any other image in this book. Derive the visual concept directly from the section title '{$title}'. Do NOT default to generic or repeated imagery.";
            }

            $imageResult = $this->imageService->generateIllustration($source, $prompt);

            if (!$imageResult) {
                throw new \Exception("AI Image Service returned no image data.");
            }

            $formattedTitle = Str::slug(substr($sectionTitle ?? 'image', 0, 20));
            $filename = "guest_{$session->id}_{$formattedTitle}_" . time() . ".png";
            $path = "guest_images/{$filename}";

            // gpt-image-1 returns a base64 data URI; dall-e-3 returns an HTTP URL.
            if (str_starts_with($imageResult, 'data:image/')) {
                // Decode base64 directly — no HTTP request needed
                $base64Data  = substr($imageResult, strpos($imageResult, ',') + 1);
                $imageContent = base64_decode($base64Data);
            } else {
                // Fetch from remote URL (dall-e-3)
                $imageContent = @file_get_contents($imageResult);
            }

            if (!$imageContent)
                throw new \Exception("Failed to retrieve image from AI provider.");

            Storage::disk('public')->put($path, $imageContent);
            $localUrl = "/storage/" . $path;

            $session->increment('image_credits_used');

            // CRITICAL FIX: Automatically save the image URL to the session data immediately
            if (isset($targetChapterIndex) && isset($targetSectionIndex)) {
                $allChapters = $session->chapters_data;
                $allChapters[$targetChapterIndex]['sections'][$targetSectionIndex]['image_url'] = $localUrl;
                $session->chapters_data = $allChapters;
                $session->save();
            }

            return response()->json(['success' => true, 'image_url' => $localUrl]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ================== EXPORT / DOWNLOAD LOGIC ==================

    public function downloadBook(Request $request, $token, $format = 'docx')
    {
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        if ($format === 'pdf') {
            return $this->generatePDF($session);
        } else {
            return $this->generateDOCX($session);
        }
    }

    public function export(Request $request, $token)
    {
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();

        $format = $request->query('format', 'docx');

        if ($format === 'pdf') {
            return $this->generatePDF($session);
        } else {
            return $this->generateDOCX($session);
        }
    }

    private function generateDOCX($session)
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();

        // Match AiBookStudio Metadata & Settings
        $phpWord->getDocInfo()->setCreator('PublicationMart');
        $phpWord->getDocInfo()->setTitle($session->title ?? 'Untitled');
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        // Define Styles (Parity with AiBookStudio)
        $phpWord->addTitleStyle(1, ['bold' => true, 'size' => 22, 'allCaps' => true], ['alignment' => 'center', 'spaceAfter' => 240]);
        $phpWord->addTitleStyle(2, ['bold' => true, 'size' => 14], ['spaceAfter' => 120, 'spaceBefore' => 240]);

        $phpWord->addParagraphStyle('bookParagraph', [
            'lineHeight' => 1.15,
            'spaceAfter' => 120,
            'alignment' => 'both',
            'indentation' => ['firstLine' => 360]
        ]);

        // --- PAGE SIZE LOGIC (Default 6x9 for Guests) ---
        // Guests dont have a book_size selection, so we enforce Industry Standard 6x9
        $dimensions = $this->getPageDimensions('6x9');

        $pageWidth = $dimensions['width'];
        $pageHeight = $dimensions['height'];
        $marginLeft = $dimensions['marginLeft'];
        $marginRight = $dimensions['marginRight'];

        $printableWidthPoints = ($pageWidth - $marginLeft - $marginRight) / 20; // ~335

        $sectionStyle = [
            'pageSizeW' => $pageWidth,
            'pageSizeH' => $pageHeight,
            'marginTop' => $dimensions['marginTop'],
            'marginBottom' => $dimensions['marginBottom'],
            'marginLeft' => $marginLeft,
            'marginRight' => $marginRight,
            'gutter' => $dimensions['gutter'] ?? 0
        ];

        // Title Page
        $section = $phpWord->addSection($sectionStyle);
        $section->addTextBreak(6);
        $title = $session->title ?? 'Untitled Book';
        $section->addText(strtoupper($title), ['bold' => true, 'size' => 28, 'allCaps' => true], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
        $section->addTextBreak(2);
        $section->addText("By " . ($session->author_name ?? 'Unknown'), ['size' => 14], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
        $section->addPageBreak();

        // Content
        $chapters = $session->chapters_data ?? [];
        foreach ($chapters as $chapter) {
            // Chapter Title
            $section->addTitle(Str::title($chapter['title']), 1);

            foreach ($chapter['sections'] as $sec) {
                // Section Title
                $section->addTitle(Str::title($sec['title']), 2);

                // Image Handling
                if (!empty($sec['image_url'])) {
                    $cleanPath = preg_replace('#^https?://[^/]+#', '', $sec['image_url']);
                    $cleanPath = ltrim($cleanPath, '/');
                    if (str_starts_with($cleanPath, 'storage/'))
                        $cleanPath = substr($cleanPath, 8);

                    $imagePath = storage_path("app/public/{$cleanPath}");
                    $imagePath = str_replace('/', DIRECTORY_SEPARATOR, $imagePath); // Windows Fix

                    if (file_exists($imagePath)) {
                        try {
                            // Ensure image fits
                            list($width, $height) = getimagesize($imagePath);
                            // If image is wider than printable area, scale it down
                            // 1 pt = 1.33 px approx? Logic varies. 
                            // Safest is to explicitly set width to printable width if it's large

                            $desiredWidth = $printableWidthPoints;
                            // Reduce slightly to avoid rounding edge cases causing overflow
                            $desiredWidth = $desiredWidth - 10;

                            $textRun = $section->addTextRun(['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
                            $textRun->addImage($imagePath, ['width' => $desiredWidth, 'wrappingStyle' => 'inline']);
                        } catch (\Exception $e) {
                            // Silently fail for image
                        }
                    }
                }

                // Content (HTML to Text Conversion)
                $content = $sec['content'] ?? '';
                $content = str_ireplace(['<br />', '<br>', '<br/>'], "\n", $content);
                $content = str_ireplace('</p>', "\n\n", $content);
                $content = strip_tags($content);
                $content = html_entity_decode($content);

                $paragraphs = preg_split('/\n+/', $content);

                foreach ($paragraphs as $para) {
                    if (trim($para)) {
                        $section->addText(trim($para), null, 'bookParagraph');
                    }
                }
            }
        }

        $filename = Str::slug($title) . '_Manuscript.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'docx');
        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    private function generatePDF($session)
    {
        $title = $session->title ?? 'Untitled';

        // --- PAGE SIZE LOGIC (Dynamic/Standardized) ---
        $dimensions = $this->getPageDimensions('6x9'); // Force 6x9 for Guests
        $widthPoints = $dimensions['width'] / 20;
        $heightPoints = $dimensions['height'] / 20;

        // Margins in Points
        $marginTop = $dimensions['marginTop'] / 20;
        $marginBottom = $dimensions['marginBottom'] / 20;
        $marginLeft = $dimensions['marginLeft'] / 20;
        $marginRight = $dimensions['marginRight'] / 20;

        $html = "<!DOCTYPE html><html><head><meta charset='utf-8'>
        <style>
            @page { 
                size: {$widthPoints}pt {$heightPoints}pt; 
                margin: {$marginTop}pt {$marginRight}pt {$marginBottom}pt {$marginLeft}pt; 
            }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.15; }
            h1 { text-align: center; page-break-before: always; text-transform: uppercase; }
            h2 { font-weight: bold; margin-top: 1em; }
            p { margin-bottom: 0.8em; }
            .title-page { text-align: center; page-break-after: always; padding-top: 3in; }
            img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
        </style></head><body>";

        $html .= "<div class='title-page'><h1>{$title}</h1><p>By " . ($session->author_name ?? 'Unknown') . "</p></div>";

        $chapters = $session->chapters_data ?? [];
        foreach ($chapters as $chapter) {
            $html .= "<h1>{$chapter['title']}</h1>";
            foreach ($chapter['sections'] as $sec) {
                $html .= "<h2>{$sec['title']}</h2>";

                if (!empty($sec['image_url'])) {
                    $cleanPath = preg_replace('#^https?://[^/]+#', '', $sec['image_url']);
                    $cleanPath = ltrim($cleanPath, '/');
                    if (str_starts_with($cleanPath, 'storage/'))
                        $cleanPath = substr($cleanPath, 8);

                    $imagePath = storage_path("app/public/{$cleanPath}");
                    if (file_exists($imagePath)) {
                        $imageData = base64_encode(file_get_contents($imagePath));
                        $src = 'data:image/png;base64,' . $imageData;
                        $html .= "<img src='{$src}'>";
                    }
                }

                // Content (HTML to Text to Clean HTML for PDF)
                $content = $sec['content'] ?? '';
                $content = str_ireplace(['<br />', '<br>', '<br/>'], "\n", $content);
                $content = str_ireplace('</p>', "\n\n", $content);
                $content = strip_tags($content);
                $content = html_entity_decode($content);

                $paragraphs = preg_split('/\n+/', $content);

                foreach ($paragraphs as $para) {
                    if (trim($para)) {
                        $html .= "<p>" . htmlspecialchars(trim($para)) . "</p>";
                    }
                }
            }
        }
        $html .= "</body></html>";

        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $dompdf = new Dompdf($options);

        // Standard 6x9 for Guests
        // Variables calculated at top of function
        $dompdf->setPaper([0, 0, $widthPoints, $heightPoints], 'portrait');
        $dompdf->loadHtml($html);
        $dompdf->render();

        $filename = Str::slug($title) . '_Manuscript.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\""
        ]);
    }

    /**
     * Helper: Get precise Page Dimensions & Margins based on Book Size
     * Returns values in Twips (1/1440 inch) for PHPWord
     */
    private function getPageDimensions($sizeStr)
    {
        $size = str_replace(' ', '', strtolower($sizeStr));

        // Defaults (6x9)
        $dims = [
            'width' => 8640,  // 6"
            'height' => 12960, // 9"
            'marginTop' => 1080,   // 0.75"
            'marginBottom' => 1080, // 0.75"
            'marginLeft' => 1080,  // 0.75" (Inside/Gutter side)
            'marginRight' => 864,   // 0.6"  (Outside)
            'gutter' => 0
        ];

        switch ($size) {
            case '5x8':
                $dims['width'] = 7200;
                $dims['height'] = 11520;
                break;
            case '5.25x8':
            case '5.25x8.25':
                $dims['width'] = 7560;
                $dims['height'] = 11880;
                break;
            case '5.5x8.5':
                $dims['width'] = 7920;
                $dims['height'] = 12240;
                break;
            case '6x9':
                $dims['width'] = 8640;
                $dims['height'] = 12960;
                break;
            case '8.5x8.5':
                $dims['width'] = 12240;
                $dims['height'] = 12240;
                $dims['marginLeft'] = 1152; // 0.8"
                break;
            case '8.5x11':
                $dims['width'] = 12240;
                $dims['height'] = 15840;
                $dims['marginLeft'] = 1296; // 0.9"
                break;
            case '16.5x11':
                $dims['width'] = 23760;
                $dims['height'] = 15840;
                $dims['marginLeft'] = 1440; // 1.0"
                break;
        }

        return $dims;
    }

    private function numberToWord($number)
    {
        $dictionary = [
            1 => 'One',
            2 => 'Two',
            3 => 'Three',
            4 => 'Four',
            5 => 'Five',
            6 => 'Six',
            7 => 'Seven',
            8 => 'Eight',
            9 => 'Nine',
            10 => 'Ten',
            11 => 'Eleven',
            12 => 'Twelve',
            13 => 'Thirteen',
            14 => 'Fourteen',
            15 => 'Fifteen',
            16 => 'Sixteen',
            17 => 'Seventeen',
            18 => 'Eighteen',
            19 => 'Nineteen',
            20 => 'Twenty'
        ];
        return $dictionary[$number] ?? $number;
    }

    public function success($token)
    {
        $session = GuestWritingSession::where('session_token', $token)->firstOrFail();
        return Inertia::render('GuestSmartWriter/Success', [
            'session' => $session,
            'token' => $token,
        ]);
    }

    public function linkToUser($token)
    {
        $session = GuestWritingSession::where('session_token', $token)->first();
        if (!$session)
            return redirect()->route('dashboard');

        $user = auth()->user();
        if ($user) {
            $session->update(['user_id' => $user->id]);
            session()->forget('guest_writer_token');
            return redirect()->route('dashboard')->with('success', 'Book saved to your account!');
        }
        return redirect()->route('login');
    }
}
