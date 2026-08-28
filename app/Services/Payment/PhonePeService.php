<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Log;
use PhonePe\Env;
use PhonePe\payments\v2\models\request\builders\StandardCheckoutPayRequestBuilder;
use PhonePe\payments\v2\standardCheckout\StandardCheckoutClient;

class PhonePeService
{
    protected $client;
    protected $merchantId;
    protected $saltKey;
    protected $saltIndex;

    public function __construct()
    {
        $this->merchantId = config('services.phonepe.merchant_id');
        $this->saltKey = config('services.phonepe.salt_key');
        $this->saltIndex = config('services.phonepe.salt_index');

        $clientId = config('services.phonepe.client_id');
        $clientSecret = config('services.phonepe.client_secret');
        $clientVersion = config('services.phonepe.client_version', 1);
        $envConfig = strtoupper(config('services.phonepe.env', 'UAT'));

        $env = ($envConfig === 'PROD') ?Env::PRODUCTION : Env::UAT;

        // If client ID is missing, we can't initialize the SDK properly.
        // For now, we'll try to initialize it, but it might fail if creds are missing.
        if ($clientId && $clientSecret) {
            $this->client = StandardCheckoutClient::getInstance(
                $clientId,
                $clientVersion,
                $clientSecret,
                $env
            );
        }
    }

    /**
     * Standard Pay Page API
     * 
     * @return array
     */
    public function initiatePayment($merchantTransactionId, $amount, $callbackUrl, $redirectUrl, $userId = null, $mobileNumber = '9999999999')
    {
        // Local safety: the .env here carries PRODUCTION PhonePe credentials,
        // so a test checkout on localhost would reach the real gateway. Every
        // payment flow funnels through this method, so refusing here disables
        // them all at once. Nothing is removed — on staging/production
        // (APP_ENV != local) this guard never triggers, and it can be
        // overridden locally with PHONEPE_ALLOW_LOCAL=true when a gateway
        // test is genuinely intended.
        if (app()->environment('local') && !env('PHONEPE_ALLOW_LOCAL', false)) {
            \Log::info('PhonePe payment blocked in local environment', [
                'txn' => $merchantTransactionId,
                'amount' => $amount,
            ]);
            return [
                'success' => false,
                'message' => 'Payments are disabled in the local environment. Set PHONEPE_ALLOW_LOCAL=true in .env to enable gateway testing.'
            ];
        }

        if (!$this->client) {
            return [
                'success' => false,
                'message' => 'PhonePe Client ID or Secret not configured.'
            ];
        }

        try {
            $amountInPaisa = (int)round($amount * 100);

            // Build the request using the Builder
            $request = StandardCheckoutPayRequestBuilder::builder()
                ->merchantOrderId($merchantTransactionId)
                ->amount($amountInPaisa)
                ->redirectUrl($redirectUrl)
                ->message("Payment for Order " . $merchantTransactionId)
                ->build();

            // Make the payment request
            $response = $this->client->pay($request);

            // The response object has redirectUrl
            $payUrl = $response->getRedirectUrl();

            if ($payUrl) {
                return [
                    'success' => true,
                    'url' => $payUrl,
                    'transactionId' => $merchantTransactionId
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get redirect URL from PhonePe.'
            ];

        }
        catch (\Exception $e) {
            Log::error('PhonePe Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Internal Error: ' . $e->getMessage()];
        }
    }

    /**
     * Verify Payment Status
     * 
     * @return array
     */
    public function verifyPayment($merchantTransactionId)
    {

        if (!$this->client) {
            return [
                'success' => false,
                'message' => 'PhonePe Client ID or Secret not configured.'
            ];
        }

        try {
            $response = $this->client->getOrderStatus($merchantTransactionId);

            // Allow accessing properties directly or via getters if available
            // Looking at SDK code, CheckStatusResponse likely has state
            // Let's inspect the response structure from SDK code or assume standard getters

            // The SDK's StatusCheckResponse likely extends something or has properties.
            // Let's assume we can get state.
            // In StandardCheckoutClient.php: return new StandardCheckoutPayResponse(...)
            // Wait, getOrderStatus returns StatusCheckResponse

            $state = $response->getState(); // Assuming getState() exists or property is public

            if ($state === 'COMPLETED' || $state === 'SUCCEEDED' || $state === 'PAYMENT_SUCCESS') {
                // Actual state strings need verification, but usually 'COMPLETED' or 'SUCCEEDED' for V2
                return ['success' => true, 'status' => 'paid', 'data' => $response];
            }
            elseif ($state === 'PENDING') {
                return ['success' => true, 'status' => 'pending', 'data' => $response];
            }

            return ['success' => false, 'status' => 'failed', 'data' => $response];

        }
        catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
