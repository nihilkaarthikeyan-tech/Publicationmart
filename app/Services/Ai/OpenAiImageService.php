<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiImageService
{
    protected string $baseUrl = 'https://api.openai.com/v1';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key');
    }

    /**
     * Generate an image using OpenAI Image API.
     *
     * Handles two models with different APIs:
     *  - dall-e-3    → quality: 'standard'|'hd', returns URL
     *  - gpt-image-1 → quality: 'low'|'medium'|'high'|'auto', returns b64_json
     *
     * @param string $prompt
     * @param string $size
     * @param string $quality   Pass 'auto' to let this method pick the right default per model.
     * @param string $model
     * @return string|null  URL string for dall-e-3, data-URI string for gpt-image-1
     * @throws \Exception
     */
    public function generateImage(string $prompt, string $size = '1024x1024', string $quality = 'auto', string $model = 'dall-e-3'): ?string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('OpenAI API key is missing. Please check your configuration.');
        }

        $isGptImage = ($model === 'gpt-image-1');

        // ── Model-aware payload ──────────────────────────────────────────────
        $payload = [
            'model'  => $model,
            'prompt' => $prompt,
            'n'      => 1,
            'size'   => $size,
        ];

        if ($isGptImage) {
            // gpt-image-1: quality must be 'low', 'medium', 'high', or 'auto'
            // It always returns base64 (b64_json); 'url' format is not supported.
            $payload['quality']       = ($quality === 'auto' || in_array($quality, ['low', 'medium', 'high'])) ? $quality : 'auto';
            $payload['output_format'] = 'png';
        } else {
            // dall-e-3: quality must be 'standard' or 'hd'
            // Invalid values like 'auto' must be mapped to a valid one.
            $payload['quality']          = in_array($quality, ['standard', 'hd']) ? $quality : 'hd';
            $payload['response_format']  = 'url';
        }
        // ────────────────────────────────────────────────────────────────────

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::timeout(120)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->post("{$this->baseUrl}/images/generations", $payload);

            if ($response->successful()) {
                $data = $response->json();

                if ($isGptImage) {
                    // gpt-image-1 returns base64-encoded PNG data
                    $b64 = $data['data'][0]['b64_json'] ?? null;
                    if (!$b64) {
                        throw new \Exception('gpt-image-1 returned no image data.');
                    }
                    // Return as a data URI so callers can detect and handle it
                    return 'data:image/png;base64,' . $b64;
                }

                // dall-e-3 returns a temporary public URL
                return $data['data'][0]['url'] ?? null;
            }

            // Handle API errors
            $error = $response->json()['error']['message'] ?? 'Unknown error';
            Log::error("OpenAI Image Error [{$model}]: " . $error);
            throw new \Exception("Image Generation Failed: " . $error);

        } catch (\Exception $e) {
            Log::error("OpenAI Connection Error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * UNIFIED GENERATION: Manual & Automatic
     * 1. ANALYZER (Step 1): Understands text, detects genre, extracts rich visual scene.
     * 2. PAINTER  (Step 2): Applies master-level art direction per genre.
     * 3. GENERATION (Step 3): Calls gpt-image-1 or dall-e-3.
     * 4. SAFETY FALLBACK (Step 4): If rejected by OpenAI safety, retries with a clean generic prompt.
     */
    public function generateIllustration(string $source, string $text, ?string $userCategory = null): ?string
    {
        // Step 1: Analyzer
        $plan = $this->analyzeContent($source, $text);

        // Step 2: Override book_type with user's explicit selection if provided
        if ($userCategory !== null) {
            $normalized = strtolower(trim($userCategory));
            if (str_contains($normalized, 'non-fiction') || $normalized === 'non-fiction') {
                $plan['book_type'] = 'non-fiction';
            } elseif (str_contains($normalized, 'fiction') || $normalized === 'fiction') {
                $plan['book_type'] = 'fiction';
            }
        }

        // Step 3: Build art-director-level prompt
        $finalPrompt = $this->buildPainterPrompt($plan);

        // Step 4: Choose model — gpt-image-1 for non-fiction (structured visuals), dall-e-3 for fiction (artistic)
        $model = (!str_contains($plan['book_type'] ?? '', 'fiction') || str_contains($plan['book_type'] ?? '', 'non-fiction'))
            ? 'gpt-image-1'
            : 'dall-e-3';

        // Step 5: Generate — with automatic safety fallback
        try {
            return $this->generateImage($finalPrompt, '1024x1024', 'auto', $model);
        } catch (\Exception $e) {
            $msg = strtolower($e->getMessage());

            // If OpenAI rejected for safety, retry with a sanitized generic prompt
            if (str_contains($msg, 'safety') || str_contains($msg, 'rejected') || str_contains($msg, 'policy')) {
                Log::warning('Safety rejection — retrying with safe fallback prompt', [
                    'genre'  => $plan['genre'] ?? 'unknown',
                    'source' => $source,
                ]);
                $safePrompt = $this->buildSafeFallbackPrompt($plan);
                return $this->generateImage($safePrompt, '1024x1024', 'auto', $model);
            }

            throw $e;
        }
    }

    /**
     * Builds a safe, sanitized fallback prompt when the primary prompt is rejected by OpenAI safety.
     * Uses only the genre to produce a clean, abstract concept illustration.
     */
    private function buildSafeFallbackPrompt(array $plan): string
    {
        $genre = strtolower($plan['genre'] ?? 'academic');
        $type  = strtolower($plan['book_type'] ?? 'non-fiction');

        $genreDescriptions = [
            'academic'   => 'interconnected geometric knowledge diagrams floating in deep space, illuminated nodes, abstract learning concepts',
            'scientific' => 'abstract molecular and cellular visualization, glowing particles in a dark void, scientific precision',
            'technical'  => 'clean architectural diagram of interconnected systems, blueprint aesthetic, electric blue on dark background',
            'business'   => 'abstract ascending geometric forms, chess pieces, scales of balance on dark navy background with gold accents',
            'self-help'  => 'lone silhouette on a hilltop at golden sunrise, vast open sky, path leading to horizon',
            'biography'  => 'dramatic portrait lighting on an anonymous silhouette, warm sepia tones, archival atmosphere',
            'history'    => 'ancient architectural ruins at golden sunset, dramatic sky, timeless atmosphere',
            'fantasy'    => 'enchanted ancient forest with bioluminescent glow, magical atmosphere, sweeping environmental vista',
            'sci-fi'     => 'vast space station orbiting a ringed planet, stars and nebula, cinematic scale',
            'mystery'    => 'rain-slicked empty urban street at night, single lamppost casting dramatic shadows, noir atmosphere',
            'thriller'   => 'dark urban corridor with single cold light source, deep shadows, cinematic tension',
            'horror'     => 'empty hallway in an old house, single light at the end, eerie quiet atmosphere',
            'romance'    => 'overflowing rose garden at golden dusk, warm candlelight, lush and intimate atmosphere',
            'adventure'  => 'vast mountain landscape at dawn, tiny explorer figure, endless horizon ahead',
            'historical' => 'ancient cobblestone street scene, warm torch-lit atmosphere, painterly historic quality',
            'literary'   => 'abstract symbolic composition with muted tones, contemplative and layered visual metaphor',
            'children'   => 'whimsical watercolor forest with friendly animals gathering around a glowing lantern',
            'young adult'=> 'bold silhouette against a dramatic sunset sky with deep jewel tones, symbolic and powerful',
        ];

        $description = $genreDescriptions[$genre] ?? 'abstract concept illustration with dramatic lighting, professional editorial quality, deep blue background';

        return
            "GENERATE: A professional editorial book illustration.\n\n" .
            "SUBJECT: {$description}\n\n" .
            "STYLE: Premium editorial illustration quality, cinematic lighting, rich colors\n" .
            "MOOD: Authoritative, evocative, visually compelling\n\n" .
            "RULES: No text · No watermarks · No cartoons · Professional publication quality";
    }

    /**
     * STEP 1: ANALYZER — Extracts a rich, specific visual scene from the content.
     * Uses GPT-4o to detect genre, mood, lighting, and a concrete scene description.
     * The richer the scene output, the better the image generation result.
     */
    private function analyzeContent(string $source, string $text): array
    {
        $systemPrompt =
            "You are an expert book art director and visual development artist.\n\n" .
            "Your task: Read the given book content and output precise image generation instructions.\n\n" .
            "CRITICAL RULES:\n" .
            "- Output ONLY valid JSON. No markdown. No explanations. No code fences.\n" .
            "- visual_scene must describe a SPECIFIC scene, setting, objects, characters — never abstract or vague.\n" .
            "- Include concrete sensory details: lighting angle, dominant colors, time of day, textures.\n" .
            "- must_include = 2-4 most important visual elements that MUST appear.\n" .
            "- must_avoid = elements that would ruin this genre's aesthetic.\n" .
            "- Be precise and specific. Generic descriptions produce generic images.";

        $userPrompt =
            "Content Source: {$source}\n\n" .
            "Content Text:\n" . substr($text, 0, 1200) . "\n\n" .
            "Output this exact JSON structure:\n" .
            "{\n" .
            "  \"book_type\": \"fiction | non-fiction\",\n" .
            "  \"genre\": \"academic | scientific | technical | business | self-help | biography | history | literary | fantasy | sci-fi | mystery | thriller | horror | romance | historical | adventure | young adult | children\",\n" .
            "  \"visual_scene\": \"Specific visual scene in 1-2 sentences: what is shown, setting, key objects, characters (no names), time of day, light source\",\n" .
            "  \"dominant_mood\": \"single word: e.g. awe | dread | longing | wonder | gravitas | warmth | tension\",\n" .
            "  \"lighting\": \"specific lighting: e.g. dramatic Rembrandt side-light | warm golden-hour backlight | cold desaturated overcast | bioluminescent glow | candlelight\",\n" .
            "  \"must_include\": [\"specific element 1\", \"specific element 2\"],\n" .
            "  \"must_avoid\": [\"element that breaks genre\", \"style to avoid\"]\n" .
            "}\n\n" .
            "Genre classification rules:\n" .
            "- Fiction: literary, fantasy, sci-fi, mystery, thriller, horror, romance, historical, adventure, young adult, children\n" .
            "- Non-fiction: academic, scientific, technical, business, self-help, biography, history\n" .
            "- 'historical' = Historical Fiction (fiction). 'history' = Non-fiction history books.\n" .
            "- 'young adult' for YA fiction targeting teens.";

        try {
            $response = Http::timeout(45)->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type'  => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model'       => 'gpt-4o',
                'messages'    => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userPrompt],
                ],
                'temperature' => 0.4,
                'max_tokens'  => 400,
            ]);

            if ($response->successful()) {
                $raw   = $response->json()['choices'][0]['message']['content'] ?? '{}';
                $clean = preg_replace('/```json|```/', '', $raw);
                $plan  = json_decode(trim($clean), true);
                if (is_array($plan) && !empty($plan['genre'])) {
                    return $plan;
                }
            }
        } catch (\Exception $e) {
            Log::error("Analyzer Step Failed: " . $e->getMessage());
        }

        // Fallback Plan
        return [
            'book_type'     => 'non-fiction',
            'genre'         => 'general',
            'visual_scene'  => substr($text, 0, 300),
            'dominant_mood' => 'informative',
            'lighting'      => 'dramatic spotlight',
            'must_include'  => [],
            'must_avoid'    => [],
        ];
    }

    /**
     * STEP 2: PAINTER — Master-level art direction per genre.
     *
     * Each prompt is a professional art director brief with:
     * - Specific hex color palettes (not vague color names)
     * - Named lighting rigs (Rembrandt, chiaroscuro, volumetric, etc.)
     * - Concrete compositional rules (rule of thirds, diagonal tension, etc.)
     * - Real-world style references (specific artists, films, publications)
     * - Hard negative rules preventing generic/unusable outputs
     */
    private function buildPainterPrompt(array $plan): string
    {
        $type     = strtolower($plan['book_type'] ?? 'non-fiction');
        $rawGenre = strtolower(trim($plan['genre'] ?? ''));

        // Normalize genre label (handle prefixes like "Fiction: Fantasy")
        if (str_contains($rawGenre, ':')) {
            $rawGenre = trim(explode(':', $rawGenre, 2)[1]);
        }

        $genreMap = [
            'academic / textbooks'             => 'academic',
            'scientific & research books'      => 'scientific',
            'scientific & research'            => 'scientific',
            'technical & professional books'   => 'technical',
            'technical & professional'         => 'technical',
            'business & economics'             => 'business',
            'self-help & personal development' => 'self-help',
            'biographies & autobiographies'    => 'biography',
            'biographies'                      => 'biography',
            'autobiography'                    => 'biography',
            'history'                          => 'history',
            'literary fiction'                 => 'literary',
            'literary'                         => 'literary',
            'fantasy'                          => 'fantasy',
            'science fiction'                  => 'sci-fi',
            'sci-fi'                           => 'sci-fi',
            'historical fiction'               => 'historical',
            'historical'                       => 'historical',
            'romance'                          => 'romance',
            'mystery & thriller'               => 'mystery',
            'mystery'                          => 'mystery',
            'thriller'                         => 'thriller',
            'horror'                           => 'horror',
            'adventure'                        => 'adventure',
            'young adult (ya) fiction'         => 'young adult',
            'young adult'                      => 'young adult',
            'ya'                               => 'young adult',
            "children's fiction"               => 'children',
            'children'                         => 'children',
            'general'                          => 'general',
        ];

        $genre = $genreMap[$rawGenre] ?? $rawGenre ?: 'academic';
        $scene = $plan['visual_scene'] ?? ($plan['visual_intent'] ?? 'A compelling concept illustration');
        $mood  = $plan['dominant_mood'] ?? '';

        Log::info("Image generation — type: {$type}, genre: {$genre}, mood: {$mood}");

        $isFiction = str_contains($type, 'fiction') && !str_contains($type, 'non-fiction');

        // ══════════════════════════════════════════════════════════════════════
        //  NON-FICTION  →  Authoritative · Informative · Cinematic-Editorial
        // ══════════════════════════════════════════════════════════════════════
        if (!$isFiction) {
            switch ($genre) {

                // ── 1. ACADEMIC / TEXTBOOKS ────────────────────────────────────
                case 'academic':
                    return
                        "GENERATE: A National Geographic editorial infographic illustration.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Single unified subject centered with 3D volumetric depth — NOT a flat grid or multi-panel\n" .
                        "- Dark slate-charcoal background (#1c2330) with a focused warm amber spotlight (#c8922a) illuminating the subject\n" .
                        "- Cross-section, exploded-view, or process diagram rendered with photorealistic 3D quality\n" .
                        "- Micro-detail textures: grain, metallic sheen, organic surface — tactile and dimensional\n" .
                        "- Sparse, elegant call-out labels in clean sans-serif — informative but minimal\n" .
                        "- Rule of thirds: subject positioned at left intersection, label space on right\n\n" .
                        "COLOR PALETTE: Deep charcoal (#1c2330) · Warm amber-gold (#c8922a) · Ivory white labels · Rust-terracotta accents\n" .
                        "LIGHTING: Dramatic three-point studio lighting — key light from upper-left, rim light defining edges, dark fill\n" .
                        "STYLE REFERENCES: National Geographic DNA diagrams · Scientific American infographics · Cambridge University Press textbook illustrations\n" .
                        "MOOD: Authoritative, precise, deeply informative — makes the reader feel expert\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO cartoons, clip-art, or flat illustration styles\n" .
                        "- NO plain white backgrounds\n" .
                        "- NO watermarks or decorative borders\n" .
                        "- NO generic school-diagram aesthetic";

                // ── 2. SCIENTIFIC / RESEARCH ───────────────────────────────────
                case 'scientific':
                case 'medical':
                    return
                        "GENERATE: A high-impact scientific journal cover visualization.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Deep midnight-blue/black void background (#090d1a) with volumetric particle glow\n" .
                        "- Central photorealistic subject: molecular structure, cellular anatomy, physical phenomenon, or research process — rendered with scientific accuracy\n" .
                        "- Bioluminescent or crystalline highlights in electric teal (#00d4c8) and cobalt-white (#e8f4fd)\n" .
                        "- Cinematic depth-of-field: razor-sharp foreground subject, softly glowing atmospheric background\n" .
                        "- Macro-photography aesthetic — as if shot by an electron microscope or ultra-HD lens\n" .
                        "- Clean, open composition — single focal element dominates 60% of frame\n\n" .
                        "COLOR PALETTE: Void black (#090d1a) · Electric teal (#00d4c8) · Cobalt white (#e8f4fd) · Deep purple accent (#4a0080)\n" .
                        "LIGHTING: Volumetric bioluminescent inner glow · Cool blue rim lighting · Particle scatter in background\n" .
                        "STYLE REFERENCES: Nature journal covers · Cell journal visualizations · NASA Hubble imagery aesthetic\n" .
                        "MOOD: Prestigious, awe-inspiring, intellectually profound — this is a discovery worth publishing\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO cartoon science, NO flat diagrams, NO clip-art biology\n" .
                        "- Scientific structures must be accurate — no invented morphology\n" .
                        "- NO text overlays · NO watermarks";

                // ── 3. TECHNICAL / PROFESSIONAL ────────────────────────────────
                case 'technical':
                    return
                        "GENERATE: A precision technical visualization — engineering blueprint meets cinematic render.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Matte dark background (#0f141e) with a subtle grid-line blueprint overlay at low opacity\n" .
                        "- Subject rendered in precise isometric or 45-degree angled 3D — system architecture, mechanical assembly, or technical diagram\n" .
                        "- Primary accent: electric blue (#0b8cff) glowing on structural outlines and data-flow paths\n" .
                        "- Secondary labels in white (#ffffff) — sparse, purposeful, typographically elegant\n" .
                        "- Component hierarchy: main system large and lit, secondary elements receding into background\n" .
                        "- Reflective surfaces suggesting high-precision manufacturing: brushed aluminum, glass panels\n" .
                        "- Rule of thirds composition — technical subject at left, breathing room at right\n\n" .
                        "COLOR PALETTE: Near-black (#0f141e) · Electric blue (#0b8cff) · White highlights · Silver/gunmetal accents\n" .
                        "LIGHTING: Edge-lighting on components — cool blue front fill, warm white specular highlights\n" .
                        "STYLE REFERENCES: O'Reilly technical book aesthetic · NASA engineering renders · Boeing cutaway technical art · Wired magazine information graphics\n" .
                        "MOOD: Expert-level precision, trustworthy, authoritative — the author clearly knows their subject\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO artistic flourishes or decorative elements\n" .
                        "- NO cartoons or stock-illustration style\n" .
                        "- Technical accuracy required — no invented components\n" .
                        "- NO text beyond minimal labels";

                // ── 4. BUSINESS / ECONOMICS ────────────────────────────────────
                case 'business':
                    return
                        "GENERATE: A premium business editorial illustration — The Economist cover meets McKinsey visual language.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Deep charcoal or navy background (#0d1117 or #12213a) with selective warm-gold (#c8a84b) accent lighting\n" .
                        "- Bold, singular symbolic imagery: NOT literal (no generic handshakes, meetings, pie charts) — use power metaphors: chess pieces, scales, architectural structures, rising geometric forms\n" .
                        "- Abstract data-flow or momentum elements: ascending curves, network nodes, trajectory lines — all rendered as premium design objects\n" .
                        "- Strong single focal point — one dominant visual idea, surrounded by negative space\n" .
                        "- Confident minimal composition — what is NOT shown is as important as what is\n" .
                        "- Corporate gravitas: matte textures, dimensional depth, no glossy stock-photo feel\n\n" .
                        "COLOR PALETTE: Deep navy (#12213a) · Burnished gold (#c8a84b) · Ice white · Warm amber accent\n" .
                        "LIGHTING: Dramatic single-source key light from above with deep shadow — theatre lighting for a single subject\n" .
                        "STYLE REFERENCES: The Economist cover illustrations · Harvard Business Review photography · Penguin Business book covers · Bloomberg Businessweek design\n" .
                        "MOOD: Ambitious, credible, forward-thinking — this author has command of their domain\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO stock-photo business clichés (handshakes, meetings, generic offices)\n" .
                        "- NO pie charts or basic infographics\n" .
                        "- NO clip-art or flat design\n" .
                        "- NO photorealistic stock-image style";

                // ── 5. SELF-HELP / PERSONAL DEVELOPMENT ───────────────────────
                case 'self-help':
                    return
                        "GENERATE: A transformational cinematic illustration — aspirational, human, emotionally resonant.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Wide cinematic landscape format — vast sky dominates upper 60% of frame\n" .
                        "- Human silhouette or lone figure positioned at lower-third intersection — small but purposeful, facing toward light or horizon\n" .
                        "- Golden-hour or sunrise lighting: warm amber-orange (#f0a830) horizon, soft lavender-pink upper sky, backlit figure with radiant rim glow\n" .
                        "- Symbolic transformation imagery: ascending path, open horizon, breaking through darkness into light, bridge, mountain summit\n" .
                        "- Real environment — natural landscape (mountain, ocean, open field, urban skyline at dawn) — NOT a studio backdrop\n" .
                        "- Painterly cinematic quality — referencing photography but elevated to editorial illustration\n" .
                        "- Emotional resonance over literal representation: the feeling of breakthrough, not the act\n\n" .
                        "COLOR PALETTE: Warm amber-gold (#f0a830) · Soft rose-peach (#f7b89c) · Deep cerulean sky (#1a3a6e) · Ivory light (#fff8ec)\n" .
                        "LIGHTING: Golden-hour backlight — subject silhouetted against warm horizon, atmospheric haze\n" .
                        "STYLE REFERENCES: Atomic Habits cover energy · Paulo Coelho book aesthetic · Nat Geo adventure photography · Terrence Malick film cinematography\n" .
                        "MOOD: Inspiring, warm, achievable, transformational — the reader believes change is possible\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO generic motivational poster style (no fists raised, no cheesy stock smiles)\n" .
                        "- NO corporate 'success' clichés\n" .
                        "- NO cartoons or flat illustration\n" .
                        "- Emotion must feel EARNED, not manufactured";

                // ── 6. BIOGRAPHY / AUTOBIOGRAPHY ──────────────────────────────
                case 'biography':
                    return
                        "GENERATE: A gravitas-charged documentary portrait illustration.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Dramatic Rembrandt portrait lighting: strong key light from 45 degrees upper-left, deep shadow covering 2/3 of face or figure, warm catchlight\n" .
                        "- Warm sepia-bronze color grading with selective desaturation — a window into preserved time\n" .
                        "- Anonymous or symbolic figure — NO identifiable real persons — use silhouette, partial profile, or symbolic surrogate\n" .
                        "- Period-appropriate environmental detail in background: architectural elements, archival texture, era-specific objects at low opacity\n" .
                        "- Vintage editorial quality: slight grain texture, tonal compression suggesting aged silver-gelatin photography\n" .
                        "- Tight crop, intimate framing — the viewer feels close to history\n" .
                        "- Applied vignette pulling focus to facial illumination\n\n" .
                        "COLOR PALETTE: Aged sepia (#8b6914) · Warm bronze · Deep shadow black · Selective amber highlight\n" .
                        "LIGHTING: Rembrandt side-lighting — 45-degree key, no fill, strong shadow — timeless portrait drama\n" .
                        "STYLE REFERENCES: TIME and Life magazine portrait photography · National Geographic historical archives · Annie Leibovitz documentary work · Walker Evans FSA photography\n" .
                        "MOOD: Gravitas, timeless credibility, historical weight — you feel the significance of this life\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO identifiable real persons\n" .
                        "- NO modern aesthetics, clothing, or technology\n" .
                        "- NO cartoons or illustrated portrait style\n" .
                        "- NO flat or generic portrait photography look";

                // ── 7. HISTORY ─────────────────────────────────────────────────
                case 'history':
                    return
                        "GENERATE: A vivid historical reconstruction — living scene from the past, not a museum exhibit.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Oil-painting aesthetic inspired by Dutch Golden Age and Romantic-era history painting\n" .
                        "- Large-scale scene with figures in motion — NOT posed, static, or diorama-like\n" .
                        "- Warm, rich palette: burnt sienna (#8b3a1a), raw umber (#6b4423), aged gold (#c9a84c), and smoke-blue shadow\n" .
                        "- Dramatic chiaroscuro lighting — torch light, firelight, or dramatic natural shafts of light cutting through atmospheric haze\n" .
                        "- Period-accurate architecture, costume, and tools — every detail researched\n" .
                        "- Diagonal compositional line creating movement and momentum across the frame\n" .
                        "- You can smell the era — dust, smoke, stone, woodsmoke\n" .
                        "- NO identifiable real persons — composite historical types only\n\n" .
                        "COLOR PALETTE: Burnt sienna (#8b3a1a) · Raw umber (#6b4423) · Aged gold (#c9a84c) · Smoke-blue shadow · Firelight orange\n" .
                        "LIGHTING: Dramatic firelight or shaft-of-daylight chiaroscuro — Caravaggio meets National Geographic\n" .
                        "STYLE REFERENCES: Jean-Leon Gerome historical paintings · John Singleton Copley · National Geographic historical reconstructions · Ken Burns documentary visual language\n" .
                        "MOOD: Visceral immersion — the reader IS in the era, not looking at it behind glass\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO modern anachronisms (no contemporary faces, clothing, materials)\n" .
                        "- NO cartoons or simplified illustration\n" .
                        "- NO identifiable real historical persons\n" .
                        "- NO clean, sterile museum-diorama look";

                // ── NON-FICTION FALLBACK ───────────────────────────────────────
                default:
                    return
                        "GENERATE: Premium editorial non-fiction illustration.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION: Dark professional background with dramatic spotlight lighting · accurate informative visualization · dimensional depth with clear focal hierarchy · publication-ready quality\n" .
                        "STYLE: Editorial documentary quality — credible, precise, visually striking\n" .
                        "MOOD: Authoritative, clear, impressive\n\n" .
                        "RULES: No cartoons · No flat styling · No generic stock images · No watermarks";
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        //  FICTION  →  Artistic · Emotionally Evocative · Stylized
        // ══════════════════════════════════════════════════════════════════════
        else {
            switch ($genre) {

                // ── 1. CHILDREN'S FICTION ──────────────────────────────────────
                case 'children':
                    return
                        "GENERATE: A Caldecott Medal-quality children's picture book illustration.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Full-bleed environment illustration — characters integrated INTO their world, not floating on white\n" .
                        "- Hand-crafted medium simulation: gouache or watercolor with visible brushstroke texture and soft paper grain\n" .
                        "- Rich, layered environment: three distinct depth planes (foreground detail, midground action, background atmosphere)\n" .
                        "- Character design: expressive faces with oversized eyes and emotive body language, culturally diverse, warm and approachable\n" .
                        "- Color palette: warm, high-saturation primaries softened with ochre-warm toning — joyful but not garish\n" .
                        "- Visual storytelling: every corner of the image rewards exploration — small hidden details\n" .
                        "- Safe, nurturing emotional temperature — the world feels kind even when adventurous\n\n" .
                        "COLOR PALETTE: Warm ochre (#e8a830) · Sage green (#7ba05b) · Sky blue (#6ab4e8) · Rose blush (#f4a4a4) · Cream (#fdf6ec)\n" .
                        "LIGHTING: Soft diffused warm sunlight — golden hour quality, no harsh shadows, welcoming\n" .
                        "STYLE REFERENCES: Jon Klassen (texture and restraint) · Quentin Blake (warmth and movement) · Oliver Jeffers (emotional directness) · Eric Carle (pattern and texture) · Shaun Tan (environmental depth)\n" .
                        "MOOD: Pure delight — adventurous, warm, surprising, inclusive\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NOT Disney/Pixar 3D CGI style\n" .
                        "- NOT flat vector art or modern digital-clean aesthetic\n" .
                        "- NO isolated characters on blank white background\n" .
                        "- NO adult fear, darkness, or threat — emotionally safe always\n" .
                        "- NO text in image";

                // ── 2. LITERARY FICTION ────────────────────────────────────────
                case 'literary':
                    return
                        "GENERATE: A Booker Prize finalist literary illustration — symbolic, painterly, emotionally layered.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Deliberately abstract: suggests the theme without illustrating it literally — invite interpretation\n" .
                        "- Bold confident brushwork — thick impasto-style texture or gestural mark-making visible\n" .
                        "- Strictly limited color palette: 2-3 tones maximum, desaturated with one unexpected chromatic accent\n" .
                        "- Works as a strong graphic composition at thumbnail scale AND as a detailed fine-art piece at full size\n" .
                        "- Strong axis or tension line cutting through frame — creates visual unease or contemplation\n" .
                        "- Negative space used strategically — emptiness carries as much weight as content\n" .
                        "- The image should feel like it's asking a question, not answering one\n\n" .
                        "COLOR PALETTE: Muted greys (#6b7280) · Aged parchment (#d4c5a9) · One accent: deep terracotta (#a0432b) OR prussian blue (#1c3a5e) · Black\n" .
                        "LIGHTING: Ambiguous — flat natural light with subtle directional suggestion, no dramatic shadows\n" .
                        "STYLE REFERENCES: Penguin Modern Classics covers · NYRB Classics visual identity · Francis Bacon's painted figures · Peter Blake illustration · Anselm Kiefer's material paintings\n" .
                        "MOOD: Contemplative, intellectually unsettling, layered with subtext — for a reader who thinks\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO literal narrative illustration\n" .
                        "- NO generic 'literary' clichés (typewriters, quill pens, open books)\n" .
                        "- NO cartoons or commercial illustration style\n" .
                        "- NO obvious or crowd-pleasing imagery\n" .
                        "- NO text";

                // ── 3. FANTASY ─────────────────────────────────────────────────
                case 'fantasy':
                    return
                        "GENERATE: Epic fantasy concept art — the world itself is the protagonist.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Sweeping environmental hero shot: ancient city, mountain fortress, enchanted forest, or unearthly sky — NOT a character portrait\n" .
                        "- Scale is everything: if figures appear, they are tiny against the environment, showing vast scope\n" .
                        "- Atmosphere layering: foreground detail, midground world-building, background atmospheric haze fading to sky\n" .
                        "- Magical light source: bioluminescent plants, aurora phenomena, multiple moons, god-rays through storm clouds — light that exists nowhere on Earth\n" .
                        "- Rich deep jewel-tone palette: midnight cobalt (#1a2a6e), forest emerald (#1a5c3a), burnished gold (#c89b30), ancient crimson (#8b1a1a)\n" .
                        "- Intricate world detail: moss-covered ruins, carved sigils, living architecture — a world with centuries of history\n" .
                        "- Diagonals and dynamic sky composition — the image feels ALIVE with movement\n\n" .
                        "COLOR PALETTE: Midnight cobalt (#1a2a6e) · Forest emerald (#1a5c3a) · Burnished gold (#c89b30) · Ancient crimson (#8b1a1a) · Deep purple (#3a1560) · Aurora teal\n" .
                        "LIGHTING: Magical multi-source: primary god-ray from dramatic sky, secondary bioluminescent glow from ground, deep atmospheric shadows\n" .
                        "STYLE REFERENCES: John Howe and Alan Lee Tolkien art · Michael Whelan's Sanderson covers · Donato Giancola fantasy painting · Guild Wars 2 environmental concept art\n" .
                        "MOOD: Mythical vastness — the reader wants to LIVE in this world\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO generic fantasy hero poses (sword-raised figures, etc.)\n" .
                        "- NO dragons unless specifically the subject\n" .
                        "- NO stock fantasy clichés (glowing swords, medieval market squares)\n" .
                        "- NOT photorealistic — clearly a painted artistic world\n" .
                        "- NO text";

                // ── 4. SCIENCE FICTION ─────────────────────────────────────────
                case 'sci-fi':
                    return
                        "GENERATE: Hard sci-fi concept art — scientifically plausible, cinematically awe-inspiring.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Scale of cosmos: vast structures (dyson spheres, orbital rings, generation ships, alien megastructures) dwarfing any human presence\n" .
                        "- Atmosphere is the character: gas clouds, stellar dust, orbital mechanics, the curve of a planet's horizon\n" .
                        "- Cool desaturated base palette punctuated by ONE warm accent: engine exhaust heat-glow (#f07030), dawn on an alien world (#f0a830), or bioluminescent habitat (#00d4c8)\n" .
                        "- Hard science aesthetic — technology looks FUNCTIONAL, not decorative: worn surfaces, heat shields, sensor arrays, solar panels\n" .
                        "- Depth through atmospheric perspective: objects fade into space/haze with distance creating infinite depth\n" .
                        "- Single dominant focal structure or phenomenon — maximum two visual elements of primary importance\n\n" .
                        "COLOR PALETTE: Deep space black (#040810) · Cool steel blue (#4a6fa8) · ONE warm accent color · White specular highlights\n" .
                        "LIGHTING: Hard vacuum space lighting: razor-sharp unfiltered sunlight on lit side, absolute black shadow — plus one secondary glow source\n" .
                        "STYLE REFERENCES: Arrival (Denis Villeneuve) · Interstellar IMAX frames · The Martian · Ralph McQuarrie Star Wars concept art · Syd Mead's industrial future\n" .
                        "MOOD: Awe at the scale of the universe — lonely, vast, wondrous, intellectually transcendent\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO neon cyberpunk aesthetic (no neon signs, rain-slicked streets, holographic ads)\n" .
                        "- NO campy retro sci-fi (no bubble helmets, chrome robots)\n" .
                        "- NO fantasy-sci-fi (no magic disguised as technology)\n" .
                        "- Technology must look PLAUSIBLE not decorative\n" .
                        "- NO text";

                // ── 5. MYSTERY / THRILLER ──────────────────────────────────────
                case 'mystery':
                case 'thriller':
                    return
                        "GENERATE: A psychological thriller illustration — Fincher film still meets noir graphic novel.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Urban or claustrophobic interior environment: rain-slicked streets, brutalist architecture, narrow alleys, dimly lit corridors\n" .
                        "- Extreme high-contrast noir lighting: 90% desaturated image with ONE cold-color accent (ice blue #0b6ef0, toxic teal #00c8a0, or blood red #c80000)\n" .
                        "- Threat from unseen source: a shadow out of place, a light left on in an empty room, a figure at the end of a corridor — the danger IMPLIED not shown\n" .
                        "- Off-center composition with deliberate edge tension — something wrong about how the scene is framed\n" .
                        "- Rain, mist, or fog as atmospheric device — obscuring, distorting, hiding\n" .
                        "- Extreme camera angles: Dutch tilt, worm's-eye, or bird's-eye perspective — nothing is level, nothing is safe\n" .
                        "- Film grain texture over entire image\n\n" .
                        "COLOR PALETTE: 90% Black/white tones · ONE accent from: ice blue (#0b6ef0) · toxic teal (#00c8a0) · or blood red (#c80000)\n" .
                        "LIGHTING: Harsh single-source motivated light (streetlamp, monitor glow, flashlight beam) — everything else in deep shadow\n" .
                        "STYLE REFERENCES: David Fincher's visual grammar (Seven, Gone Girl, Dragon Tattoo) · Nordic noir aesthetic · Thomas Harris atmosphere · Neo-noir film photography\n" .
                        "MOOD: Intelligent dread — the reader knows something is wrong before they can name it\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO gore, blood, or explicit violence\n" .
                        "- NO generic detective imagery (magnifying glasses, investigation boards)\n" .
                        "- Psychological tension ONLY — not slasher horror\n" .
                        "- NO cartoons\n" .
                        "- NO text";

                // ── 6. HORROR ──────────────────────────────────────────────────
                case 'horror':
                    return
                        "GENERATE: Literary psychological horror — the wrong detail in the right place.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- A scene that appears almost normal — one small but deeply wrong detail disrupts everything\n" .
                        "- Environment as the threat: a house that seems to breathe, a hallway that seems to lean, a garden that seems to watch\n" .
                        "- Deep chiaroscuro: absolute black shadows occupying most of the frame, ONE cold light source (moonlight, television static, a crack under a door)\n" .
                        "- Muted desaturated palette: ash-grey, cold concrete white, one sickly color accent (jaundice yellow #c8b830 or decay green #5a7a3a or wrongness purple #6a2080)\n" .
                        "- Strategic negative space: large areas of absolute darkness that the eye keeps returning to\n" .
                        "- Shallow depth of field: some elements unnervingly sharp, others uncomfortably blurred\n" .
                        "- Composition should feel like the viewpoint is being watched — the viewer is NOT safe\n\n" .
                        "COLOR PALETTE: Ash grey (#8a8a8a) · Concrete white (#d8d4cc) · Absolute black · ONE wrongness accent color\n" .
                        "LIGHTING: Single cold-source motivated light — moonlight through curtains, television flicker, crack of light under a door\n" .
                        "STYLE REFERENCES: Stanley Kubrick's The Shining (environment as dread) · Ari Aster's Hereditary (domestic horror) · Shirley Jackson (house as psychological entity) · Simon Stalenhag's unsettling landscapes\n" .
                        "MOOD: Creeping dread — the horror the reader FEELS but cannot quite see is worse than anything shown\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO monsters, creatures, demons, or ghosts\n" .
                        "- NO blood, gore, or slasher imagery\n" .
                        "- NO jump-scare imagery\n" .
                        "- NO cartoons or Halloween-aesthetic\n" .
                        "- Psychological ONLY — the image disturbs through composition and wrongness, not content\n" .
                        "- NO text";

                // ── 7. HISTORICAL FICTION ──────────────────────────────────────
                case 'historical':
                    return
                        "GENERATE: Living historical fiction illustration — oil painting quality, cinematic storytelling.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Rich oil-painting aesthetic: impasto-style texture, glazing technique, visible painterly quality\n" .
                        "- Living scene with figures in motion — conversation, labor, conflict, celebration — NOT posed or static\n" .
                        "- Period-authentic details: architecture style, costume fabric and cut, light sources (candles, torches, hearth, sun angle), tools and objects\n" .
                        "- Warm, aged palette: burnt sienna (#8b3a1a), raw umber (#6b4423), Venetian red (#a03828), aged gold (#c9a84c), candlelight ivory (#fff2cc)\n" .
                        "- Rembrandt or Caravaggio chiaroscuro: warm light source from within the scene illuminating players, deep background shadow\n" .
                        "- Diagonal compositional line: eye travels through the scene following action and light\n" .
                        "- Sense of texture you can almost touch: rough-spun cloth, worn wood, stone walls, metal armor\n\n" .
                        "COLOR PALETTE: Burnt sienna (#8b3a1a) · Raw umber (#6b4423) · Venetian red (#a03828) · Aged gold (#c9a84c) · Candlelight ivory (#fff2cc)\n" .
                        "LIGHTING: Warm interior light source (candle, torch, hearth) creating Caravaggio-style drama — or golden-hour exterior light\n" .
                        "STYLE REFERENCES: Hilary Mantel's BBC Wolf Hall production design · Ken Follett's medieval scope · Rembrandt's group portraits · Jean-Leon Gerome historical scenes · Ridley Scott's historical film palette\n" .
                        "MOOD: Visceral immersion — the reader does not look at history, they inhabit it\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO identifiable real historical persons\n" .
                        "- NO modern anachronisms of any kind\n" .
                        "- NOT a museum diorama or reconstruction — this is living drama\n" .
                        "- NOT photorealistic — clearly a painted artwork\n" .
                        "- NO text";

                // ── 8. ADVENTURE ───────────────────────────────────────────────
                case 'adventure':
                    return
                        "GENERATE: Classic adventure illustration — the environment is as heroic as the explorer.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Dramatic environmental hero shot: jungle canopy at dawn, ocean horizon under storm clouds, mountain summit in morning light, desert dune under a vast sky\n" .
                        "- Human figure(s) small-but-purposeful in vast environment — creates scale and tension (figure occupies maximum 15% of frame)\n" .
                        "- Bold diagonal composition: ascending toward an unseen goal, OR descending into the unknown — dynamic, never static\n" .
                        "- Vibrant, high-saturation palette: deep jungle green (#1a5c28), ocean cobalt (#1a3a8b), terracotta desert (#c85a1a), storm purple (#4a2880)\n" .
                        "- Strong horizon line at lower third: sky dominates, feels like anything is possible\n" .
                        "- Dramatic natural lighting: golden hour, storm light, first-light dawn — nature at its most theatrical\n" .
                        "- Visual momentum: clouds, waves, wind in vegetation — everything is in motion\n\n" .
                        "COLOR PALETTE: Jungle green (#1a5c28) · Ocean cobalt (#1a3a8b) · Desert terracotta (#c85a1a) · Storm-purple sky (#4a2880) · Golden light\n" .
                        "LIGHTING: Dramatic natural light — golden hour rim on figure, theatrical sky, strong environmental shadows\n" .
                        "STYLE REFERENCES: Classic Penguin Adventure covers · Indiana Jones poster art · Tintin's compositional boldness · National Geographic adventure photography · N.C. Wyeth's adventure illustrations\n" .
                        "MOOD: Discovery, freedom, courage — the reader's heart is beating faster before they turn the page\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO clichéd action poses (guns raised, swords drawn)\n" .
                        "- NO generic stock-photo adventure imagery\n" .
                        "- Environment must be as prominent as any character\n" .
                        "- NO flat or minimalist illustration\n" .
                        "- NO text";

                // ── 9. YOUNG ADULT ─────────────────────────────────────────────
                case 'young adult':
                case 'ya':
                    return
                        "GENERATE: Contemporary YA editorial illustration — bold, symbolic, designed for BookTok and Instagram.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- Bold graphic composition that WORKS at thumbnail scale AND at full size\n" .
                        "- Single dominant symbolic image: a figure silhouetted against fire, a crown floating in dark water, two hands not quite touching, a world splitting in two — emotion over plot, symbol over literal\n" .
                        "- Rich jewel-tone palette OR bold contrast pairing: amethyst (#6a2080) + gold · midnight (#0d1a40) + flame · forest (#1a4030) + bioluminescent\n" .
                        "- Strong silhouette readable in black-and-white — the composition has graphic power independent of color\n" .
                        "- Clear compositional breathing room: sky at top third for title typography, open space designed-in\n" .
                        "- Emotional directness: fear, longing, defiance, belonging, identity — the image SAYS the emotion without illustrating a scene\n" .
                        "- Contemporary editorial quality — feels relevant to 2020s aesthetic\n\n" .
                        "COLOR PALETTE: Rich jewel tones — amethyst (#6a2080) · midnight (#0d1a40) · deep teal · flame orange · OR stark black/white + one saturated accent\n" .
                        "LIGHTING: Dramatic, graphic — single source creating strong silhouette, OR flat bold graphic with no shadow\n" .
                        "STYLE REFERENCES: The Hunger Games cover design · Six of Crows aesthetic · They Both Die at the End cover · Leigh Bardugo's Grishaverse visual identity · Sarah J. Maas cover art energy\n" .
                        "MOOD: Intense, emotionally raw, identity-defining — a teenager sees themselves in this image\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO childish or juvenile aesthetic — this is for 14-25 readers\n" .
                        "- NO generic teen/coming-of-age clichés\n" .
                        "- Bold graphic impact is NON-NEGOTIABLE\n" .
                        "- NO text";

                // ── 10. ROMANCE ────────────────────────────────────────────────
                case 'romance':
                    return
                        "GENERATE: A premium romance illustration — charged, lush, emotionally intimate.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION RULES:\n" .
                        "- The charged moment BEFORE contact: almost-touching hands, stolen glance across a room, figures leaning toward each other with inches between — tension without resolution\n" .
                        "- Lush environmental richness: overflowing roses, rain on cobblestones, candlelit drawing room, summer garden at dusk, Regency ballroom — environment amplifies emotion\n" .
                        "- Warm intimate lighting: golden candlelight (#f0c060), soft window light, dappled garden sun — never harsh, never cold\n" .
                        "- Rich painterly quality: oil-painting or digital-painting aesthetic, not photography\n" .
                        "- Color palette: warm rose (#d4607a), burgundy (#7a1830), warm gold (#c8a030), cream (#fdf4e8), forest shadow (#2a3a28)\n" .
                        "- Depth through focus: one element razor-sharp in foreground (a gloved hand, a falling petal, a wine glass), background romantically soft\n" .
                        "- Sensory detail: you can feel the silk, smell the roses, hear the music\n\n" .
                        "COLOR PALETTE: Warm rose (#d4607a) · Burgundy (#7a1830) · Warm gold (#c8a030) · Cream (#fdf4e8) · Deep forest shadow (#2a3a28)\n" .
                        "LIGHTING: Golden candlelight or soft window light — warm, intimate, flattering\n" .
                        "STYLE REFERENCES: Bridgerton Season 1 production design · Julia Quinn adaptation cinematography · Outlander visual palette · Pre-Raphaelite painting richness (Waterhouse, Millais) · Nora Roberts cover art sensibility\n" .
                        "MOOD: Longing, warmth, possibility — the reader's heart is full before the chapter even begins\n\n" .
                        "ABSOLUTE RULES:\n" .
                        "- NO generic stock-couple photographs or clipart\n" .
                        "- TASTEFUL ONLY — intimate not explicit\n" .
                        "- NO cold, clinical, or editorial lighting\n" .
                        "- The environment must be as lush as the emotion\n" .
                        "- NO text";

                // ── FICTION FALLBACK ───────────────────────────────────────────
                default:
                    return
                        "GENERATE: Artistic narrative book illustration.\n\n" .
                        "SUBJECT: {$scene}\n\n" .
                        "COMPOSITION: Painterly digital art with cinematic dramatic lighting · Rich atmospheric colors · Single compelling focal composition · Illustrated storytelling quality — evocative and emotionally engaging\n" .
                        "LIGHTING: Dramatic single key source with deep atmospheric shadows\n" .
                        "STYLE: Editorial illustrated fiction — narrative, immersive, emotionally resonant\n" .
                        "MOOD: Engaging, atmospheric, memorable\n\n" .
                        "RULES: NOT photorealistic · Rich artistic quality · No text";
            }
        }
    }
}
