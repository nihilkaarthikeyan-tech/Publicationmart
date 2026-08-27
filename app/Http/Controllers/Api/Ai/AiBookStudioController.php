<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\AiChapter;
use App\Models\AiSection;
use App\Services\Ai\AnthropicService;
use App\Services\Ai\OpenAiImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Dompdf\Dompdf;
use Dompdf\Options;

class AiBookStudioController extends Controller
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

    /**
     * Start a fresh AI Studio session (Create New Book)
     */
    public function startNewSession()
    {
        $user = \Illuminate\Support\Facades\Auth::user();

        // Create a new blank book to serve as the project container
        $book = Book::create([
            'user_id' => $user->id,
            'title' => 'Untitled Project ' . now()->format('Y-m-d H:i'),
            'author_name' => $user->name,
            'genre' => 'Non-Fiction', // Default
            'step_completed' => 1,
            'status' => 'draft'
        ]);

        // Redirect to the Studio for this NEW book
        return redirect()->route('books.ai-studio', ['book' => $book->id]);
    }

    /**
     * Render the Studio Interface
     */
    public function index(Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403, 'Unauthorized access to this book.');
        }

        return \Inertia\Inertia::render('Books/AiBookStudio', [
            'book' => $book->load('aiChapters.sections'),
        ]);
    }

    /**
     * Alias for index - used for back navigation
     */
    public function show(Book $book)
    {
        return $this->index($book);
    }

    /**
     * Show Pro Pricing Plans
     */
    public function proPricing(Book $book)
    {
        return \Inertia\Inertia::render('Books/ProPricing', [
            'book' => $book,
        ]);
    }

    /**
     * Show Premium Pricing Plans
     */
    public function premiumPricing(Book $book)
    {
        return \Inertia\Inertia::render('Books/PremiumPricing', [
            'book' => $book,
        ]);
    }

    /**
     * Show Payment Gateway
     */
    public function payment(Book $book, string $plan, string $type)
    {
        return \Inertia\Inertia::render('Books/PaymentGateway', [
            'book' => $book,
            'plan' => $plan,
            'type' => $type,
        ]);
    }

    /**
     * Save Plan Info and Initiate Payment
     */
    public function savePlan(Request $request, Book $book)
    {
        $request->validate([
            'plan_type' => 'required|string|in:pro,premium,formatting,cover,publishing',
            'plan_name' => 'required|string'
        ]);

        $planName = strtolower($request->plan_name);
        $type = $request->plan_type;
        $pageRange = '80-100'; // Default

        // Map Plan Name to Page Range
        $ranges = [
            'saver' => '80-100',
            'standard' => '100-150',
            'pro' => '150-200',
            'enterprise' => '200-250'
        ];

        if (isset($ranges[$planName])) {
            $pageRange = $ranges[$planName];
        }
        else {
            $pageRange = $request->plan_name;
        }

        // Store specific plan tier
        $storedType = $type;
        if (in_array($storedType, ['publishing', 'premium'])) {
            $storedType = strtolower($request->plan_name);
        }

        // NOTE: We do NOT update the book here anymore. 
        // We wait for payment confirmation in PaymentController.

        // --- PRICING LOGIC ---
        $price = 0;

        // Formatting / Cover
        if ($type === 'formatting')
            $price = 1499;
        elseif ($type === 'cover')
            $price = 499;

        // Pro Plans
        elseif ($type === 'pro' || $type === 'publishing') {
            $proPrices = [
                'saver'      => 2999,  // Fixed: was incorrectly set to 1 (testing leftover)
                'standard'   => 3499,
                'pro'        => 3999,
                'enterprise' => 4499
            ];
            $price = $proPrices[$planName] ?? 2999;
        }
        // Premium Plans
        elseif ($type === 'premium') {
            $premiumPrices = [
                'saver'      => 5999,
                'standard'   => 7499,
                'pro'        => 8999,
                'enterprise' => 10999
            ];
            $price = $premiumPrices[$planName] ?? 5999;
        }

        // Generate Transaction ID with embedded details for stateless fulfillment if needed
        // Format: AI_{BOOK_ID}_{PLAN_TYPE}_{PLAN_NAME}_UNIQ
        // We encode plan_name using base64 or just clean string to avoid separator issues
        $cleanPlanName = \Illuminate\Support\Str::slug($pageRange); // e.g., 80-100 or starter
        $cleanStoredType = \Illuminate\Support\Str::slug($storedType);

        $txnId = 'AI_' . $book->id . '_' . $cleanStoredType . '_' . $cleanPlanName . '_' . uniqid();

        // Create Pending Transaction Record
        \App\Models\Transaction::create([
            'book_id' => $book->id,
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'author_id' => \Illuminate\Support\Facades\Auth::id(), // Self
            'quantity' => 1,
            'amount' => $price,
            'author_revenue' => 0,
            'platform_commission' => $price,
            'sales_channel' => 'direct',
            'payment_status' => 'pending',
            'transaction_id' => $txnId,
            // We can store plan details in a metadata column if it exists, but ID format helps too.
        ]);

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        // SECURITY: payment bypass is allowed ONLY in the local dev environment,
        // never based on a client-supplied Host header (was Host-spoofable).
        $isTestDomain = app()->environment('local');
        
        if ($isTestDomain) {
            \Illuminate\Support\Facades\Log::info('Bypassing AI Studio payment (local dev environment)');
            
            // Fulfill the transaction
            $book->update([
                'ai_plan_type' => $type,
                'ai_plan_name' => $planName
            ]);
            
            $transaction = \App\Models\Transaction::where('transaction_id', $txnId)->first();
            if ($transaction && $transaction->payment_status !== 'completed') {
                $transaction->update(['payment_status' => 'completed']);
            }
            
            // Return appropriate success URL based on plan type
            $successUrl = '';
            if ($type === 'formatting') {
                $successUrl = route('books.format', $book->id);
            } elseif ($type === 'cover') {
                $successUrl = route('books.cover-creator', $book->id);
            } else {
                $successUrl = route('books.ai-studio', $book->id);
            }
            
            return response()->json([
                'success' => true, 
                'payment_url' => $successUrl,
                'isTestBypass' => true
            ]);
        }

        // Initiate PhonePe Payment
        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        // Store transaction ID in session for fallback retrieval on redirect
        session(['pending_payment_txn_id' => $txnId]);

        $response = $this->phonePeService->initiatePayment(
            $txnId,
            $price,
            $callbackUrl,
            $redirectUrl,
            $book->user_id,
            \Illuminate\Support\Facades\Auth::user()->mobile_number ?? '9999999999'
        );

        if ($response['success']) {
            return response()->json(['success' => true, 'payment_url' => $response['url']]);
        }

        return response()->json(['success' => false, 'message' => 'Payment initiation failed: ' . ($response['message'] ?? 'Unknown Error')], 500);
    }

    /**
     * Update Context (Save Metadata for Step 1)
     */
    public function updateContext(Request $request, Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }

        $request->validate([
            'topic' => 'nullable|string',
            'audience' => 'nullable|string',
            'genre' => 'nullable|string',
            // Flexible keys
        ]);

        $updateData = [];
        if ($request->has('topic'))
            $updateData['topic'] = $request->topic;
        if ($request->has('audience'))
            $updateData['audience'] = $request->audience;
        if ($request->has('genre'))
            $updateData['genre'] = $request->genre;
        if ($request->has('title'))
            $updateData['title'] = $request->title;
        if ($request->has('author_name'))
            $updateData['author_name'] = $request->author_name;

        if (!empty($updateData)) {
            $book->update($updateData);
        }

        return response()->json(['success' => true]);
    }


    /**
     * Block 2: Generate Chapter Outline
     */
    public function generateOutline(Request $request, Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }
        // SECURITY: AI generation requires a paid plan (revenue paywall).
        // Without this, a logged-in user could generate an entire book free.
        abort_unless($book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before generating content.');

        $request->validate([
            'topic' => 'nullable|string',
            'audience' => 'nullable|string',
            'chapter_count' => 'nullable|integer|max:10',
            'title' => 'nullable|string|max:255',
            'author_name' => 'nullable|string|max:255',
            'mode' => 'nullable|string|in:ai,manual', // New mode selector
            'manual_content' => 'nullable|string', // For manual chapters
            'genre' => 'nullable|string'
        ]);

        // Update Book Details
        if ($request->has('title') && $request->title !== $book->title) {
            $book->title = $request->title;
            $book->save();
        }
        if ($request->has('author_name') && $request->author_name !== $book->author_name) {
            $book->author_name = $request->author_name;
            $book->save();
        }
        if ($request->has('genre')) {
            $book->genre = $request->genre;
            $book->save();
        }

        // Set Image Limit based on Page Range if provided
        if ($request->has('page_range')) {
            $limit = Book::getImageLimitByPageRange($request->page_range);
            $book->image_credits_limit = $limit;
            $book->save();
        }

        // MODE: MANUAL ENTRY
        if ($request->input('mode') === 'manual') {
            $content = $request->input('manual_content');
            if (!$content)
                return response()->json(['success' => false, 'message' => 'No content provided'], 422);

            $titles = array_values(array_filter(explode("\n", $content), fn($line) => trim($line) !== ''));
            $book->aiChapters()->delete();

            foreach ($titles as $index => $title) {
                AiChapter::create([
                    'book_id' => $book->id,
                    'title' => trim($title),
                    'order_index' => $index + 1,
                    'status' => 'pending'
                ]);
            }
            return response()->json(['success' => true, 'chapters' => $book->aiChapters]);
        }

        // MODE: AI GENERATION
        $topic = $request->input('topic');
        if (!$topic)
            return response()->json(['success' => false, 'message' => 'Topic required for AI generation'], 422);

        $audience = $request->input('audience', 'General Readers');

        // Logic: Validate Limits & Constraints (Dynamic Plan-Based)
        $count = $request->input('chapter_count', 10);
        $subCount = $request->input('sub_chapter_count', 5);

        $pageRange = $request->input('page_range', '80-100');
        $maxPages = 100;
        if (preg_match('/-(\d+)/', $pageRange, $matches)) {
            $maxPages = intval($matches[1]);
        }

        // Define Limits
        $limitCh = 12;
        $limitSub = 15; // Saver (Boosted)

        if ($maxPages >= 200) { // Enterprise
            $limitCh = 25;
            $limitSub = 30; // Boosted
        }
        elseif ($maxPages >= 150) { // Pro
            $limitCh = 20;
            $limitSub = 25; // Boosted
        }
        elseif ($maxPages >= 120) { // Standard
            $limitCh = 15;
            $limitSub = 20; // Boosted
        }

        if ($count > $limitCh)
            return response()->json(['message' => "Plan Limit Exceeded: Max {$limitCh} chapters allowed."], 422);

        if ($subCount > $limitSub)
            return response()->json(['message' => "Plan Limit Exceeded: Max {$limitSub} sub-chapters allowed."], 422);

        $pageRange = $request->input('page_range', '80-100');
        $maxPages = 100;
        if (preg_match('/-(\d+)/', $pageRange, $matches)) {
            $maxPages = intval($matches[1]);
        }

        // Strict Structure Check
        $totalSub = $count * $subCount;
        $pagesPerSub = floor($maxPages / $totalSub); // If totalSub is 0, this crashes? No, count min 1.

        if ($pagesPerSub < 1) {
            return response()->json([
                'success' => false,
                'message' => "Structure too large for plan. {$totalSub} sections exceed the {$maxPages} page limit (calculated < 1 page/section). Please reduce structure."
            ], 422);
        }

        $prompt = "Create a detailed book outline.\n\n" .
            "Topic: {$topic}\n" .
            "Genre/Style: " . ($book->genre ?? 'General') . "\n" .
            "Audience: {$audience}\n" .
            "Number of Chapters: {$count}\n\n" .
            "Strict Output Format:\n" .
            "Return ONLY a JSON array of chapter titles (strings).";

        try {
            $response = $this->aiService->generateContent(
                "You are an outline generator.\n\nRules:\n- Output ONLY valid JSON\n- No explanations\n- No markdown\n- No extra text",
                $prompt
            );

            // Clean up code blocks if present (markdown json)
            $cleanJson = str_replace(['```json', '```'], '', $response);
            $titles = json_decode($cleanJson, true);

            if (!is_array($titles)) {
                throw new \Exception("Invalid JSON format from AI");
            }

            $book->aiChapters()->delete();

            foreach ($titles as $index => $title) {
                AiChapter::create([
                    'book_id' => $book->id,
                    'title' => $title,
                    'order_index' => $index + 1,
                    'status' => 'pending'
                ]);
            }

            // Save Metadata to Book for later calculation constancy
            $book->update([
                'topic' => $topic,
                'audience' => $audience,
                // We might want to save chapter_count / sub_chapter_count / page_range preferences too?
                // Currently 'page_range' is not a column on books table standardized, but 'ai_plan_name' might store it?
                // For now, these are session inputs.
            ]);

            return response()->json(['success' => true, 'chapters' => $book->aiChapters]);

        }
        catch (\Exception $e) {
            Log::error("Outline Gen Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Could not generate the outline. Please try again.'], 500);
        }
    }

    /**
     * Block 2b: Manual Chapter Addition
     */
    public function storeManualChapter(Request $request, Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }
        abort_unless($book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before using the studio.');

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $nextIndex = $book->aiChapters()->max('order_index') + 1;

        $chapter = AiChapter::create([
            'book_id' => $book->id,
            'title' => $request->title,
            'order_index' => $nextIndex,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'chapters' => $book->aiChapters()->orderBy('order_index')->get()
        ]);
    }

    /**
     * Block 3: Generate Sub-Chapters (Sections) for a Chapter
     */
    public function generateSections(Request $request, AiChapter $chapter)
    {
        if ($chapter->book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }
        abort_unless($chapter->book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before generating content.');

        // Get user preference from request, default to 5
        $requestedCount = $request->input('count', 5);
        $count = max(2, min(15, intval($requestedCount)));

        // Optimized prompt for SPEED
        $genre = $chapter->book->genre ?? 'General';
        $prompt = "For the chapter \"{$chapter->title}\", generate exactly {$count} section titles.\n" .
            "Genre/Style: {$genre}\n\n" .
            "Strict Output Format:\n" .
            "Return ONLY a JSON array of strings.";

        try {
            // Lower max tokens to force quicker return
            $response = $this->aiService->generateContent(
                "You generate book section headings.\n\nRules:\n- Output ONLY valid JSON\n- No explanations\n- No markdown",
                $prompt,
                1000
            );

            $cleanJson = str_replace(['```json', '```'], '', $response);
            $sections = json_decode($cleanJson, true);

            if (!is_array($sections))
                throw new \Exception("Invalid JSON");

            $chapter->sections()->delete(); // Clear old drafts

            foreach ($sections as $index => $title) {
                AiSection::create([
                    'ai_chapter_id' => $chapter->id,
                    'title' => $title,
                    'order_index' => $index + 1,
                    'status' => 'draft'
                ]);
            }

            return response()->json(['success' => true, 'sections' => $chapter->sections]);

        }
        catch (\Exception $e) {
            \Log::error('AI Studio error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Something went wrong. Please try again.'], 500);
        }
    }

    /**
     * Block 3b: Save Manual Sections
     */
    public function saveManualSections(Request $request, AiChapter $chapter)
    {
        if ($chapter->book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }
        abort_unless($chapter->book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before using the studio.');

        $request->validate([
            'sections' => 'required|array',
            'sections.*' => 'required|string|max:255',
        ]);

        // Clear existing
        $chapter->sections()->delete();

        // Create new
        foreach ($request->sections as $title) {
            $chapter->sections()->create(['title' => $title]);
        }

        return response()->json([
            'success' => true,
            'sections' => $chapter->sections()->get()
        ]);
    }

    /**
     * Block 4: Write Section Content (AI)
     */
    public function writeSection(Request $request, AiSection $section)
    {
        if ($section->chapter->book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }
        abort_unless($section->chapter->book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before generating content.');

        $request->validate([
            'tone' => 'nullable|string',
            'perspective' => 'nullable|string'
            // word_count removed, we calculate strictly now
        ]);

        $user = \Illuminate\Support\Facades\Auth::user();

        $chapter = $section->chapter;
        if (!$chapter)
            return response()->json(['success' => false, 'message' => 'Chapter not found.'], 404);
        $book = $chapter->book;
        if (!$book)
            return response()->json(['success' => false, 'message' => 'Book not found.'], 404);

        $tone = $request->input('tone', 'Professional');
        $perspective = $request->input('perspective', '3rd Person');

        // LOGIC: DYNAMIC PAGE ALLOCATION (Logged In Use)
        $planRange = strtolower($book->ai_plan_name ?? '80-100');
        $planType = strtolower($book->ai_plan_type ?? '');
        $maxPages = 100;

        // 0. STRICT: Check Plan Type First (Most reliable)
        if ($planType === 'saver')
            $maxPages = 100;
        elseif ($planType === 'standard')
            $maxPages = 150;
        elseif ($planType === 'pro')
            $maxPages = 200;
        elseif ($planType === 'enterprise')
            $maxPages = 250;

        // 1. Check for Named Plans (Fallback if type missing/custom)
        $namedPlans = [
            'saver' => 100,
            'standard' => 150,
            'pro' => 200,
            'enterprise' => 250
        ];

        if (array_key_exists($planRange, $namedPlans)) {
            $maxPages = $namedPlans[$planRange];
        }
        // 2. Check for Range Strings "150-200"
        elseif (strpos($planRange, '-') !== false) {
            $parts = explode('-', $planRange);
            $maxPages = intval(end($parts));
        }
        // 3. Fallback: direct number "150"
        elseif (is_numeric($planRange)) {
            $maxPages = intval($planRange);
        }

        // Count TOTAL sections in entire book to distribute pages
        // We must load all chapters and count their sections
        $allChapters = $book->aiChapters()->withCount('sections')->get();
        $totalSubchapters = $allChapters->sum('sections_count');

        if ($totalSubchapters < 1)
            $totalSubchapters = 1;

        // ALLOCATION LOGIC per requirement (UPDATED FOR EFFICIENCY)
        $totalCapacityWords = $maxPages * 275;
        $targetWords = (int) floor($totalCapacityWords / $totalSubchapters);
        $pagesPerSubchapter = $targetWords / 275; // For prompt context (can be float now)

        // Minimum viable length check (approx 0.5 pages or 130 words)
        if ($targetWords < 130) {
            return response()->json(['success' => false, 'message' => "Configuration Error: Too many sections ({$totalSubchapters}) for the plan limit ({$maxPages} pages). Result would be too short."], 422);
        }

        // STRICT 6x9 FORMAT: 275 words per page is the standard for 6x9" books
        // We now use the precise targetWords calculated above

        $prompt = "Write the full content for the sub-chapter \"{$section->title}\".\n\n" .
            "context:\n" .
            "- Chapter: \"{$chapter->title}\"\n" .
            "- Topic (CORE CONCEPT): \"{$book->topic}\"\n" .
            "- Genre/Style: \"{$book->genre}\"\n" .
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
                $firstLine = trim(str_replace(['#', '*', '_', '<h3>', '</h3>'], '', $lines[0])); // Remove Markdown syntax
                $sectionTitleClean = trim(str_replace(['#', '*', '_'], '', $section->title));

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
                // Truncate to target words
                $truncatedWords = array_slice($words, 0, $targetWords);
                $truncatedText = implode(' ', $truncatedWords);
                // Try to end at a sentence
                $lastPeriod = strrpos($truncatedText, '.');
                if ($lastPeriod !== false && $lastPeriod > ($targetWords * 0.7 * 5)) { // At least 70% of content
                    $truncatedText = substr($truncatedText, 0, $lastPeriod + 1);
                }
                $content = '<p>' . nl2br($truncatedText) . '</p>';
            }
            else {
                // If content is short enough, ensure it is HTML formatted
                if (strip_tags($content) === $content) {
                    // No tags found, convert integers/newlines to HTML
                    $content = '<p>' . nl2br($content) . '</p>';
                }
            }

            // Deduct actual words used (DISABLED FOR TESTING)
            // $actualWords = str_word_count($content);
            // $user->word_credits = max(0, $user->word_credits - $actualWords);
            // $user->save();

            $section->update([
                'content' => $content,
                'status' => 'generated',
                'tone' => $tone
            ]);

            return response()->json([
                'success' => true,
                'section' => $section->fresh(),
                'remaining_credits' => $user->word_credits
            ]);

        }
        catch (\Exception $e) {
            \Log::error('AI Write Section Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'AI generation failed. Please try again.'], 500);
        }
    }

    /**
     * Block 4b: Generate Image for a Section
     */
    public function generateImage(Request $request, AiSection $section)
    {
        if ($section->chapter->book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }

        $book = $section->chapter->book;

        // SECURITY: image generation requires a paid plan (revenue paywall).
        abort_unless($book->hasPaidAiPlan(), 403, 'Please choose and pay for a plan before generating images.');

        // Check Image Credit Limit — same logic as Guest Smart Writer (15/20/30/45 based on plan)
        if ($book->image_credits_limit > 0 && $book->image_credits_used >= $book->image_credits_limit) {
            return response()->json([
                'success' => false,
                'message' => "Image limit reached! You have used {$book->image_credits_used} of {$book->image_credits_limit} image credits for your plan."
            ], 403);
        }

        $request->validate([
            'mode' => 'nullable|string|in:auto,custom',
            'custom_prompt' => 'nullable|string|max:1000'
        ]);

        $mode = $request->input('mode', 'auto');
        $customPrompt = $request->input('custom_prompt');

        try {
            $source = ($mode === 'custom' && !empty($customPrompt)) ? 'manual' : 'automatic';

            if ($source === 'manual') {
                $text = $customPrompt;
            }
            else {
                // --- GENRE-SPECIFIC PROMPT LOGIC ---
                $genre = $book->genre ?? 'General';
                $topic = $book->topic ?? 'Unknown Topic';
                $title = $section->title;
                // Use the first 400 chars of content as the "Summary" for the prompt
                $summary = $section->content ? substr($section->content, 0, 400) : "A section titled '{$title}' about {$topic}";
                // Clean summary of newlines for better prompt flow
                $summary = str_replace(["\r", "\n"], " ", $summary);

                // ---------------------------------------------------------------
                // FICTION = Artistic / Illustrative / Stylized
                // NON-FICTION = Realistic / Informative / Photographic
                // ---------------------------------------------------------------

                // 1. FICTION GENRES — artistic, illustrated, stylized
                if (stripos($genre, 'Children') !== false) {
                    // Children's: cute cartoon style — most illustrative / cartoonish
                    $template = "Children's book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: cute cartoon art, bright vivid colors, bold simple outlines, friendly expressive characters, whimsical playful composition. Fully illustrated, NOT photorealistic, NOT realistic. No text in image.";
                }
                elseif (stripos($genre, 'Fantasy') !== false) {
                    $template = "Fantasy book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: epic fantasy digital painting, magical glowing lighting, rich deep colors, detailed mythical environment, highly stylized artistic rendering. NOT photorealistic. No text in image.";
                }
                elseif (stripos($genre, 'Science Fiction') !== false || stripos($genre, 'Sci-Fi') !== false) {
                    $template = "Sci-fi book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: futuristic stylized concept art, neon and cool color palette, cinematic dramatic lighting, technology-themed artistic composition. NOT a real photograph, illustrated artistic style. No text in image.";
                }
                elseif (stripos($genre, 'Romance') !== false) {
                    $template = "Romance book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: soft watercolor or painterly illustration, warm pastel tones, dreamy romantic atmosphere, emotional artistic depth. NOT photorealistic, illustrated style. No text in image.";
                }
                elseif (stripos($genre, 'Mystery') !== false || stripos($genre, 'Thriller') !== false) {
                    $template = "Mystery/thriller book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: dark stylized noir illustration, dramatic high-contrast shadows, suspenseful moody atmosphere, artistic graphic novel aesthetic. NOT a real photograph. No text in image.";
                }
                elseif (stripos($genre, 'Horror') !== false) {
                    $template = "Horror book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: dark eerie stylized illustration, unsettling psychological horror aesthetic, dramatic shadows, haunting artistic mood, no gore. NOT photorealistic. No text in image.";
                }
                elseif (stripos($genre, 'Historical Fiction') !== false) {
                    $template = "Historical fiction book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: painterly period-era illustration, warm earthy historical tones, cinematic storytelling composition, artistic rendering of the era. NOT a real photograph. No text in image.";
                }
                elseif (stripos($genre, 'Adventure') !== false) {
                    $template = "Adventure book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: dynamic energetic illustration, vibrant bold colors, action-oriented cinematic composition, stylized artistic rendering. NOT photorealistic. No text in image.";
                }
                elseif (stripos($genre, 'Young Adult') !== false || stripos($genre, 'YA') !== false) {
                    $template = "Young adult fiction book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: modern stylized digital illustration, vibrant colors, expressive characters, contemporary artistic aesthetic. NOT photorealistic. No text in image.";
                }
                elseif (stripos($genre, 'Literary') !== false) {
                    $template = "Literary fiction book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: expressive painterly digital art, soft dramatic lighting, emotional artistic depth, fine art illustration quality. NOT photorealistic. No text in image.";
                }

                // 2. NON-FICTION GENRES — realistic, informative, photographic
                elseif (stripos($genre, 'Academic') !== false || stripos($genre, 'Textbook') !== false) {
                    // e.g. iron casting = accurate labeled cross-section diagram
                    $template = "High-quality magazine-style educational infographic for an academic textbook chapter titled '{$title}': [CHAPTER SUMMARY]. Style: photorealistic detailed illustration with cinematic dramatic lighting, rich warm earthy tones with golden amber highlights, accurate process visualization with realistic textures and depth, dark or deep neutral background with spotlight lighting, multiple panels showing steps, professional editorial quality. NOT cartoon, NOT flat, NOT plain white background. Factually accurate, visually rich, no watermarks, no text overlays.";
                }
                elseif (stripos($genre, 'Scientific') !== false || stripos($genre, 'Research') !== false) {
                    $template = "Realistic scientific illustration for a research chapter titled '{$title}': [CHAPTER SUMMARY]. Style: photorealistic scientific diagram, accurate anatomical or process visualization, precise proportions, research-paper quality, clean white background. NOT cartoon, NOT artistic. Scientifically accurate.";
                }
                elseif (stripos($genre, 'Technical') !== false || stripos($genre, 'Professional') !== false) {
                    $template = "Realistic technical diagram for a professional chapter titled '{$title}': [CHAPTER SUMMARY]. Style: precise engineering schematic or system architecture diagram, accurate technical details, clean professional layout, white background. NOT cartoon, NOT artistic. Technically accurate.";
                }
                elseif (stripos($genre, 'Business') !== false || stripos($genre, 'Economics') !== false) {
                    $template = "Realistic professional business visualization for a chapter titled '{$title}' about '{$topic}': [CHAPTER SUMMARY]. Style: photorealistic business infographic or professional data visualization, corporate and credible look, real-world imagery style. NOT cartoon, NOT artistic, informative and professional.";
                }
                elseif (stripos($genre, 'Self-Help') !== false || stripos($genre, 'Personal Development') !== false) {
                    $template = "Realistic inspirational image for a self-help chapter titled '{$title}': [CHAPTER SUMMARY]. Style: photorealistic photography-style image, real people in real environments, motivational but grounded and realistic composition, warm natural lighting. NOT cartoon, NOT artistic. Real and relatable.";
                }
                elseif (stripos($genre, 'Biography') !== false || stripos($genre, 'Autobiography') !== false) {
                    $template = "Realistic documentary-style illustration for a biography chapter titled '{$title}': [CHAPTER SUMMARY]. Style: photorealistic portrait or historical scene, documentary photography aesthetic, period-accurate realistic details, credible and factual feel. NOT cartoon, NOT artistic. No identifiable real persons.";
                }
                elseif (stripos($genre, 'History') !== false) {
                    $template = "Realistic historical scene illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: photorealistic period-accurate scene, documentary historical style, natural earthy tones, factual and credible composition. NOT cartoon, NOT artistic. No identifiable real persons.";
                }
                else {
                    // General Fallback
                    if (stripos($genre, 'Fiction') !== false && stripos($genre, 'Non') === false) {
                        // Fiction fallback → artistic
                        $template = "Fiction book illustration for a chapter titled '{$title}': [CHAPTER SUMMARY]. Style: vibrant narrative-driven digital art, cinematic stylized lighting, artistic illustrated rendering. NOT photorealistic. No text in image.";
                    }
                    else {
                        // Non-fiction fallback → realistic
                        $template = "Realistic informative illustration for a chapter titled '{$title}' about '{$topic}': [CHAPTER SUMMARY]. Style: photorealistic, accurate, informative, clean composition. NOT cartoon, NOT stylized. No text in image.";
                    }
                }

                // Inject Content
                $text = str_replace('[CHAPTER SUMMARY]', $summary, $template);

                // CRITICAL: Text Language Enforcement
                $text .= " \n\nCRITICAL RULE: Any text included in the image MUST be legible English. Do not create fake symbols or gibberish. If exact English spelling cannot be guaranteed, do not include text labels.";
            }

            // Always pass the book's genre so Custom mode stays within the book's visual style
            $imageResult = $this->imageService->generateIllustration($source, $text, $book->genre);

            if (!$imageResult) {
                throw new \Exception("AI Image Service returned no image data.");
            }

            // SAVE IMAGE LOCALLY (Crucial for PDF/DOCX Export)
            // gpt-image-1 returns a base64 data URI; dall-e-3 returns an HTTP URL.
            if (str_starts_with($imageResult, 'data:image/')) {
                // Decode base64 directly — no HTTP request needed
                $base64Data  = substr($imageResult, strpos($imageResult, ',') + 1);
                $imageContent = base64_decode($base64Data);
            } else {
                // Fetch from remote URL (dall-e-3)
                $imageContent = @file_get_contents($imageResult);
            }

            if (!$imageContent) {
                throw new \Exception("Failed to retrieve image from AI provider.");
            }

            $filename = 'section_' . $section->id . '_' . time() . '.png';
            $path = "books/{$book->id}/images/{$filename}";

            \Illuminate\Support\Facades\Storage::disk('public')->put($path, $imageContent);
            $localUrl = "/storage/" . $path;

            // Save to DB
            $section->update(['image_url' => $localUrl]);

            // Increment Usage (was commented out — image limit never enforced, H6)
            $book->increment('image_credits_used');

            return response()->json([
                'success' => true,
                'imageUrl' => $localUrl, // Return local URL to frontend
                'credits_used' => $book->image_credits_used + 1,
                'credits_limit' => $book->image_credits_limit
            ]);

        }
        catch (\Exception $e) {
            \Log::error('AI Studio error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Something went wrong. Please try again.'], 500);
        }
    }

    /**
     * Block 5: Download Compiled Book (DOCX or PDF)
     */
    /**
     * Submit book for admin approval
     */
    public function submitForApproval(Request $request, Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403);
        }

        // Ensure we don't overwrite if already approved
        if ($book->status === 'approved') {
            return response()->json(['success' => false, 'message' => 'Book is already published.'], 400);
        }

        $book->update([
            'status' => 'pending',
            'step_completed' => 5
        ]);

        // Broadcast to admins that a new book has been submitted
        try {
            \Event::dispatch(new \App\Events\BookSubmitted($book));
        }
        catch (\Throwable $e) {
            \Log::error('BookSubmitted Event failed: ' . $e->getMessage());
        // Proceed without failing the request
        }

        return response()->json(['success' => true, 'message' => 'Book submitted successfully.']);
    }

    public function downloadBook(Request $request, Book $book)
    {
        if ($book->user_id !== \Illuminate\Support\Facades\Auth::id() && !\Illuminate\Support\Facades\Auth::user()->is_admin) {
            abort(403);
        }
        abort_unless($book->hasPaidAiPlan() || \Illuminate\Support\Facades\Auth::user()->is_admin, 403, 'Please choose and pay for a plan before downloading.');

        $book->load('aiChapters.sections');
        $format = $request->query('format', 'docx');

        if ($format === 'pdf') {
            return $this->generatePDF($book);
        }
        else {
            return $this->generateDOCX($book);
        }
    }

    /**
     * Generate proper DOCX file using PHPWord
     */
    /**
     * Generate proper DOCX file using PHPWord
     */
    private function generateDOCX(Book $book)
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();

        // Match AiBookStudio Metadata & Settings
        $phpWord->getDocInfo()->setCreator('PublicationMart');
        $phpWord->getDocInfo()->setTitle($book->title);

        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12); // Standard 6x9 Book Format

        // Define styles
        $phpWord->addTitleStyle(1, ['bold' => true, 'size' => 22, 'allCaps' => true], ['alignment' => 'center', 'spaceAfter' => 240]);
        $phpWord->addTitleStyle(2, ['bold' => true, 'size' => 14], ['spaceAfter' => 120, 'spaceBefore' => 240]);

        // Add paragraph style with 1.15 line spacing (Standard Book Format)
        $phpWord->addParagraphStyle('bookParagraph', [
            'lineHeight' => 1.15,
            'spaceAfter' => 0, // No extra space between paragraphs (standard for indented fiction)
            'alignment' => 'both', // Justified
            'indentation' => ['firstLine' => 360] // 0.25 inch
        ]);

        // --- PAGE SIZE LOGIC (Strict 6x9 for Smart Writing Tool) ---
        // Smart Writing Tool always uses 6x9 regardless of book_size selection
        // The Formatting Tool respects the user's selected book size
        $dimensions = $this->getPageDimensions('6x9');
        $pageWidth = $dimensions['width'];
        $pageHeight = $dimensions['height'];
        $marginLeft = $dimensions['marginLeft'];
        $marginRight = $dimensions['marginRight'];

        $section = $phpWord->addSection([
            'pageSizeW' => $pageWidth,
            'pageSizeH' => $pageHeight,
            'marginTop' => $dimensions['marginTop'],
            'marginBottom' => $dimensions['marginBottom'],
            'marginLeft' => $marginLeft,
            'marginRight' => $marginRight,
            'gutter' => $dimensions['gutter'] ?? 0
        ]);

        // Title Page
        $section->addTextBreak(8);
        $section->addText($book->title, ['bold' => true, 'size' => 28, 'allCaps' => true], ['alignment' => 'center']);
        $section->addTextBreak(2);
        $section->addText('By ' . ($book->author_name ?? 'Unknown Author'), ['size' => 14], ['alignment' => 'center']);
        $section->addPageBreak();

        // Chapters
        foreach ($book->aiChapters as $chapter) {
            $section->addTitle(\Illuminate\Support\Str::title($chapter->title), 1);

            foreach ($chapter->sections as $sectionData) {
                $section->addTitle($sectionData->title, 2);

                // Add Image if exists
                if (!empty($sectionData->image_url)) {
                    // ROBUST PATH RESOLUTION
                    // 1. Remove optional full domain or leading slashes
                    $cleanPath = preg_replace('#^https?://[^/]+#', '', $sectionData->image_url);
                    $cleanPath = ltrim($cleanPath, '/');

                    // 2. Extract path relative to 'storage'
                    if (str_starts_with($cleanPath, 'storage/')) {
                        $relativePath = substr($cleanPath, 8); // Remove 'storage/'
                    }
                    else {
                        $relativePath = $cleanPath;
                    }

                    // 3. Construct absolute system path
                    $imagePath = storage_path("app/public/{$relativePath}");

                    // 4. Windows Path Fix (Ensure backslashes if needed, though PHP handles mixed usually)
                    $imagePath = str_replace('/', DIRECTORY_SEPARATOR, $imagePath);

                    if (file_exists($imagePath)) {
                        try {
                            // Create a centered paragraph with the image
                            $textRun = $section->addTextRun(['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);
                            $textRun->addImage($imagePath, [
                                'width' => 400,
                                // 'height' => 400, // ALLOW AUTO HEIGHT to maintain aspect ratio
                                'wrappingStyle' => 'inline'
                            ]);
                            $section->addTextBreak(1);
                        }
                        catch (\Exception $e) {
                        // Log error silently or add placeholder
                        }
                    }
                }

                $content = $sectionData->content ?? '';

                // HTML to Text Conversion for DOCX
                // 1. Convert breaks to newlines
                $content = str_ireplace(['<br />', '<br>', '<br/>'], "\n", $content);
                // 2. Convert closing paragraphs to double newlines
                $content = str_ireplace('</p>', "\n\n", $content);
                // 3. Strip all other tags
                $content = strip_tags($content);
                // 4. Decode entities
                $content = html_entity_decode($content);

                $paragraphs = preg_split('/\n+/', $content);
                foreach ($paragraphs as $para) {
                    if (trim($para)) {
                        $section->addText(trim($para), ['size' => 12, 'name' => 'Times New Roman'], 'bookParagraph');
                    }
                }
            }
            $section->addPageBreak();
        }

        // Save to temp file and return
        $filename = preg_replace('/[^a-zA-Z0-9]/', '_', $book->title) . '_Manuscript.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'docx');

        $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ])->deleteFileAfterSend(true);
    }

    /**
     * Generate proper PDF file using DOMPDF
     */
    /**
     * Generate proper PDF file using DOMPDF
     */
    private function generatePDF(Book $book)
    {
        // --- PAGE SIZE LOGIC (Strict 6x9 for Smart Writing Tool) ---
        // Smart Writing Tool always uses 6x9 regardless of book_size selection
        // The Formatting Tool respects the user's selected book size
        $dimensions = $this->getPageDimensions('6x9');
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
            body { 
                font-family: 'Times New Roman', serif; 
                font-size: 11pt; 
                line-height: 1.15; 
                text-align: justify; 
            }
            h1 { font-size: 22pt; text-align: center; page-break-before: always; margin-top: 2in; text-transform: uppercase; font-weight: bold; }
            h1.title-main { page-break-before: avoid; margin-top: 3in; font-size: 28pt; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; }
            p { 
                text-indent: 0.25in; 
                margin-bottom: 0pt; 
                margin-top: 0pt; 
            }
            .title-page { text-align: center; page-break-after: always; }
            .author { font-size: 14pt; margin-top: 24pt; }
        </style></head><body>";

        $html .= "<div class='title-page'><h1 class='title-main'>{$book->title}</h1><p class='author'>By " . ($book->author_name ?? 'Unknown Author') . "</p></div>";

        foreach ($book->aiChapters as $chapter) {
            $html .= "<h1>{$chapter->title}</h1>";
            foreach ($chapter->sections as $section) {
                $html .= "<h2>{$section->title}</h2>";

                // Add Image for PDF
                if (!empty($section->image_url)) {
                    // ROBUST PATH RESOLUTION (Identical to DOCX)
                    $cleanPath = preg_replace('#^https?://[^/]+#', '', $section->image_url);
                    $cleanPath = ltrim($cleanPath, '/');

                    if (str_starts_with($cleanPath, 'storage/')) {
                        $relativePath = substr($cleanPath, 8);
                    }
                    else {
                        $relativePath = $cleanPath;
                    }

                    $imagePath = storage_path("app/public/{$relativePath}");

                    if (file_exists($imagePath)) {
                        // BASE64 EMBEDDING (Fixes PDF blank images)
                        $imageData = base64_encode(file_get_contents($imagePath));
                        $src = 'data:image/png;base64,' . $imageData;

                        $html .= "<div style='text-align:center; margin-bottom:15px;'><img src='{$src}' style='max-width:100%; height:auto;'></div>";
                    }
                }

                // Content (HTML to Text to Clean HTML for PDF)
                $content = $section->content ?? '';
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
        $options->set('defaultFont', 'Times New Roman');

        // --- PAGE SIZE LOGIC FOR PDF (Strict) ---
        // Variables $widthPoints and $heightPoints calculated at top of function

        $dompdf = new Dompdf($options);
        $dompdf->setPaper([0, 0, $widthPoints, $heightPoints], 'portrait');
        $dompdf->loadHtml($html);
        $dompdf->render();

        $filename = preg_replace('/[^a-zA-Z0-9]/', '_', $book->title) . '_Manuscript.pdf';

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
            'width' => 8640, // 6"
            'height' => 12960, // 9"
            'marginTop' => 1080, // 0.75"
            'marginBottom' => 1080, // 0.75"
            'marginLeft' => 1080, // 0.75" (Inside/Gutter side)
            'marginRight' => 864, // 0.6"  (Outside)
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
}
