<?php

return [

    'api2pdf' => [
        // Read via config() so these keep working when the config is cached
        // (env() returns null once `php artisan config:cache` has run).
        'key'  => env('RAPIDAPI_KEY'),
        'host' => env('RAPIDAPI_HOST', 'api2pdf-api2pdf-v1.p.rapidapi.com'),
    ],

    'pexels' => [
        'key' => env('PEXELS_API_KEY', env('VITE_PEXELS_API_KEY')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20240620'),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],

    'phonepe' => [
        'merchant_id' => env('PHONEPE_MERCHANT_ID', 'SU2601211848232137219735'),
        'salt_key' => env('PHONEPE_SALT_KEY', '27af14d0-7727-4f4c-a2ac-df33f6714980'),
        'salt_index' => env('PHONEPE_SALT_INDEX', '1'),
        'client_id' => env('PHONEPE_CLIENT_ID', 'SU2601211848232137219735'),
        'client_secret' => env('PHONEPE_CLIENT_SECRET', '27af14d0-7727-4f4c-a2ac-df33f6714980'),
        'client_version' => env('PHONEPE_CLIENT_VERSION', 1),
        'env' => env('PHONEPE_ENV', 'PROD'),
        'host' => env('PHONEPE_HOST'), // Optional custom host override
    ],

    'recaptcha' => [
        'site_key' => env('RECAPTCHA_V3_SITE_KEY', '6Le2fGEsAAAAAMjTTSNnz7vQ2IodTgsie0_24VNj'),
        'secret_key' => env('RECAPTCHA_V3_SECRET_KEY', '6Le2fGEsAAAAABiHYSS9UVQr_wQye5OPyWVbR9Ig'),
        'min_score' => env('RECAPTCHA_MIN_SCORE', 0.5), // 0.0 to 1.0, higher = stricter
    ],
];
