<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Consent mode
    |--------------------------------------------------------------------------
    | 'block'  — nothing non-essential loads until the visitor agrees. The
    |            safer default, and what we recommend.
    | 'notice' — analytics and marketing load immediately; the banner only
    |            informs. Switch to this only on a documented decision.
    |
    | This is the single setting question 22 of the client sheet decides.
    */
    'mode' => env('COOKIE_CONSENT_MODE', 'block'),

    /*
    | Bump when the cookie categories or the policy materially change: a
    | stored choice from an older version is treated as no choice, so the
    | visitor is asked again rather than being silently opted in.
    */
    'version' => 1,

    // Measurement IDs. Blank either one and that tracker is never injected.
    'ga_id' => env('GA_MEASUREMENT_ID', 'G-0XH0VKQQX8'),
    'pixel_id' => env('FB_PIXEL_ID', '1303589550727690'),

];
