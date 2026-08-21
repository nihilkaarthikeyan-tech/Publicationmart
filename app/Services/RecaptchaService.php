<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    protected $secretKey;
    protected $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    protected $minScore;

    public function __construct()
    {
        $this->secretKey = config('services.recaptcha.secret_key');
        $this->minScore = config('services.recaptcha.min_score', 0.5);
    }

    /**
     * Verify reCAPTCHA v3 token
     *
     * @param string $token The reCAPTCHA token from frontend
     * @param string $expectedAction Optional expected action name
     * @return array ['success' => bool, 'score' => float, 'action' => string, 'error' => string|null]
     */
    public function verify(string $token, ?string $expectedAction = null): array
    {
        if (!$this->secretKey) {
            Log::warning('reCAPTCHA secret key not configured');
            // Allow pass-through in development if not configured
            if (app()->environment('local', 'development')) {
                return ['success' => true, 'score' => 1.0, 'action' => $expectedAction ?? 'unknown', 'error' => null];
            }
            return ['success' => false, 'score' => 0, 'action' => '', 'error' => 'reCAPTCHA not configured'];
        }

        try {
            $response = Http::asForm()->post($this->verifyUrl, [
                'secret' => $this->secretKey,
                'response' => $token,
            ]);

            $data = $response->json();

            Log::info('reCAPTCHA verification response', [
                'success' => $data['success'] ?? false,
                'score' => $data['score'] ?? 0,
                'action' => $data['action'] ?? '',
                'hostname' => $data['hostname'] ?? '',
            ]);

            if (!($data['success'] ?? false)) {
                return [
                    'success' => false,
                    'score' => 0,
                    'action' => '',
                    'error' => 'reCAPTCHA verification failed: ' . implode(', ', $data['error-codes'] ?? ['unknown error'])
                ];
            }

            $score = $data['score'] ?? 0;
            $action = $data['action'] ?? '';

            // Check minimum score
            if ($score < $this->minScore) {
                Log::warning('reCAPTCHA score too low', ['score' => $score, 'min_required' => $this->minScore]);
                return [
                    'success' => false,
                    'score' => $score,
                    'action' => $action,
                    'error' => 'Security check failed. Please try again.'
                ];
            }

            // Check action matches if provided
            if ($expectedAction && $action !== $expectedAction) {
                Log::warning('reCAPTCHA action mismatch', ['expected' => $expectedAction, 'received' => $action]);
                return [
                    'success' => false,
                    'score' => $score,
                    'action' => $action,
                    'error' => 'Security verification failed.'
                ];
            }

            return [
                'success' => true,
                'score' => $score,
                'action' => $action,
                'error' => null
            ];

        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification error: ' . $e->getMessage());
            return [
                'success' => false,
                'score' => 0,
                'action' => '',
                'error' => 'Security verification service unavailable.'
            ];
        }
    }

    /**
     * Quick check - returns true if verification passes
     */
    public function isValid(string $token, ?string $expectedAction = null): bool
    {
        return $this->verify($token, $expectedAction)['success'];
    }
}
