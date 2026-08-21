<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Services\Ai\AnthropicService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BookWriterController extends Controller
{
    protected $aiService;

    public function __construct(AnthropicService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Generate content for a book section.
     */
    public function generate(Request $request)
    {
        // Validate input
        $request->validate([
            'prompt' => 'required|string|min:5|max:5000',
            'context' => 'nullable|string|max:10000', // Previous chapters or outline
            'tone' => 'nullable|string|in:Casual,Formal,Mystery,Thriller,Romance,Fantasy,Non-fiction',
        ]);

        try {
            $userPrompt = $request->input('prompt');
            $context = $request->input('context', '');
            $tone = $request->input('tone', 'Non-fiction');

            // Construct the System Prompt (The "Brain" instructions)
            $systemPrompt = $this->buildSystemPrompt($tone);

            // Construct the User Message
            $fullMessage = "Context:\n$context\n\nTask: $userPrompt";

            // Call AI Service
            // Note: In a real production app, you might want to stream this response
            // or use a queue if it's very long. For now, we'll return JSON.
            $content = $this->aiService->generateContent($systemPrompt, $fullMessage);

            return response()->json([
                'success' => true,
                'content' => $content,
            ]);

        } catch (\Exception $e) {
            Log::error('AI Generation Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'AI generation failed. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Build the persona/instructions for the AI
     */
    private function buildSystemPrompt(string $tone): string
    {
        return <<<EOT
You are an expert professional book writer and editor for a publishing platform. 
Your ONLY goal is to write high-quality content for a book manuscript.
The user wants the tone to be: $tone.

STRICT RULES:
1. You must ONLY write content valid for a book (fiction, non-fiction, poetry, academic, etc.).
2. If the user asks for anything unrelated to book creation (e.g., "Write a pizza recipe" (unless for a cookbook), "Write code for a game", "Tell me a joke"), you MUST refuse politely.
3. Refusal message: "I am a Book Writing Assistant designed only to help with manuscripts and publishing tasks."

Guidelines:
- Write naturally and avoid robotic phrases.
- Focus on "show, don't tell" for fiction.
- Be clear, concise, and structured for non-fiction.
- Respect the context provided.
- Do not output any "Here is your chapter" meta-talk. Just write the content itself.
EOT;
    }
}
