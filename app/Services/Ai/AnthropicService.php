<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicService
{
    protected string $baseUrl = 'https://api.anthropic.com/v1';
    protected string $apiKey;
    protected string $model;
    protected string $version = '2023-06-01';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.key');
        $this->model = config('services.anthropic.model', 'claude-sonnet-4-6');

        if (empty($this->apiKey)) {
            Log::warning('Anthropic API key is missing.');
        }
    }

    /**
     * Generate text based on a prompt.
     *
     * @param string $systemPrompt Rules/Context for the AI
     * @param string $userMessage The actual request
     * @param int $maxTokens
     * @return string
     * @throws \Exception
     */
    public function generateContent(string $systemPrompt, string $userMessage, int $maxTokens = 4096): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file.');
        }

        $retries = 2;
        $lastError = null;

        for ($attempt = 1; $attempt <= $retries; $attempt++) {
            try {
                $response = Http::timeout(120) // 2 minute timeout for long content
                    ->connectTimeout(30)
                    ->withHeaders([
                        'x-api-key' => $this->apiKey,
                        'anthropic-version' => $this->version,
                        'content-type' => 'application/json',
                    ])->post("{$this->baseUrl}/messages", [
                            'model' => $this->model,
                            'max_tokens' => $maxTokens,
                            'system' => $systemPrompt,
                            'messages' => [
                                [
                                    'role' => 'user',
                                    'content' => $userMessage,
                                ],
                            ],
                        ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $content = $data['content'][0]['text'] ?? '';

                    if (empty($content)) {
                        throw new \Exception('AI returned empty response.');
                    }

                    return $content;
                }

                // Handle specific error codes
                $status = $response->status();
                $body = $response->json();
                $errorMessage = $body['error']['message'] ?? $response->body();

                if ($status === 401) {
                    throw new \Exception('Invalid API key. Please check your ANTHROPIC_API_KEY.');
                } elseif ($status === 429) {
                    throw new \Exception('API rate limit exceeded. Please wait and try again.');
                } elseif ($status === 500 || $status === 503) {
                    $lastError = "Anthropic server error (attempt {$attempt}): {$errorMessage}";
                    Log::warning($lastError);
                    if ($attempt < $retries) {
                        sleep(2); // Wait before retry
                        continue;
                    }
                } else {
                    throw new \Exception("API error ({$status}): {$errorMessage}");
                }

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                $lastError = "Connection timeout (attempt {$attempt}): " . $e->getMessage();
                Log::warning($lastError);
                if ($attempt < $retries) {
                    sleep(1);
                    continue;
                }
            }
        }

        throw new \Exception($lastError ?? 'Failed to generate content after multiple attempts.');
    }
}
