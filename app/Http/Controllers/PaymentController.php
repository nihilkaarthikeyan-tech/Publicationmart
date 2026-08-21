<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $phonePeService;

    public function __construct(\App\Services\Payment\PhonePeService $phonePeService)
    {
        $this->phonePeService = $phonePeService;
    }

    /**
     * Calculate author cost based on book specifications using pricing matrix
     * This matches the frontend calculation in Details.jsx
     */
    private function calculateAuthorCost($book)
    {
        // Normalize inputs
        $size = str_replace(' ', '', $book->book_size ?? '5.5x8.5');
        $printing = (stripos($book->printing_color ?? 'B/W', 'color') !== false) ? 'Color' : 'B/W';
        $paper = strtolower($book->paper_type ?? 'White Paper');
        $binding = (stripos($book->binding_type ?? 'Soft Binding', 'hard') !== false) ? 'Hard' : 'Soft';

        // Pricing matrix matching frontend logic
        $pricingMatrix = [
            '5x8' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 1], 'Hard' => ['binding' => 200, 'perPage' => 1]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 1], 'Hard' => ['binding' => 200, 'perPage' => 1]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 1.5], 'Hard' => ['binding' => 200, 'perPage' => 1.5]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 5], 'Hard' => ['binding' => 200, 'perPage' => 5]],
                ],
            ],
            '6x9' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 1], 'Hard' => ['binding' => 200, 'perPage' => 1]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 1.2], 'Hard' => ['binding' => 200, 'perPage' => 1.2]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 1.75], 'Hard' => ['binding' => 200, 'perPage' => 1.75]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 5], 'Hard' => ['binding' => 200, 'perPage' => 5]],
                ],
            ],
            '5.5x8.5' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 1], 'Hard' => ['binding' => 200, 'perPage' => 1]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 1.2], 'Hard' => ['binding' => 200, 'perPage' => 1.2]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 1.75], 'Hard' => ['binding' => 200, 'perPage' => 1.75]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'bond paper' => ['Soft' => ['binding' => 50, 'perPage' => 6], 'Hard' => ['binding' => 200, 'perPage' => 6]],
                    'art paper' => ['Soft' => ['binding' => 50, 'perPage' => 5], 'Hard' => ['binding' => 200, 'perPage' => 5]],
                ],
            ],
            '8.5x8.5' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 80, 'perPage' => 1.5], 'Hard' => ['binding' => 300, 'perPage' => 1.5]],
                    'bond paper' => ['Soft' => ['binding' => 80, 'perPage' => 1.8], 'Hard' => ['binding' => 300, 'perPage' => 1.8]],
                    'art paper' => ['Soft' => ['binding' => 80, 'perPage' => 2.5], 'Hard' => ['binding' => 300, 'perPage' => 2.5]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 80, 'perPage' => 12], 'Hard' => ['binding' => 300, 'perPage' => 12]],
                    'bond paper' => ['Soft' => ['binding' => 80, 'perPage' => 12], 'Hard' => ['binding' => 300, 'perPage' => 12]],
                    'art paper' => ['Soft' => ['binding' => 80, 'perPage' => 10], 'Hard' => ['binding' => 300, 'perPage' => 10]],
                ],
            ],
            '8.5x11' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 80, 'perPage' => 1.5], 'Hard' => ['binding' => 300, 'perPage' => 1.5]],
                    'bond paper' => ['Soft' => ['binding' => 80, 'perPage' => 1.8], 'Hard' => ['binding' => 300, 'perPage' => 1.8]],
                    'art paper' => ['Soft' => ['binding' => 80, 'perPage' => 2.5], 'Hard' => ['binding' => 300, 'perPage' => 2.5]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 80, 'perPage' => 12], 'Hard' => ['binding' => 300, 'perPage' => 12]],
                    'bond paper' => ['Soft' => ['binding' => 80, 'perPage' => 12], 'Hard' => ['binding' => 300, 'perPage' => 12]],
                    'art paper' => ['Soft' => ['binding' => 80, 'perPage' => 10], 'Hard' => ['binding' => 300, 'perPage' => 10]],
                ],
            ],
            '16.5x11' => [
                'B/W' => [
                    'white paper' => ['Soft' => ['binding' => 120, 'perPage' => 3], 'Hard' => ['binding' => 500, 'perPage' => 3]],
                    'bond paper' => ['Soft' => ['binding' => 120, 'perPage' => 3.5], 'Hard' => ['binding' => 500, 'perPage' => 3.5]],
                    'art paper' => ['Soft' => ['binding' => 120, 'perPage' => 4], 'Hard' => ['binding' => 500, 'perPage' => 4]],
                ],
                'Color' => [
                    'white paper' => ['Soft' => ['binding' => 120, 'perPage' => 24], 'Hard' => ['binding' => 500, 'perPage' => 24]],
                    'bond paper' => ['Soft' => ['binding' => 120, 'perPage' => 24], 'Hard' => ['binding' => 500, 'perPage' => 24]],
                    'art paper' => ['Soft' => ['binding' => 120, 'perPage' => 20], 'Hard' => ['binding' => 500, 'perPage' => 20]],
                ],
            ],
        ];

        // Get pricing or fallback to default (5.5x8.5 B/W White Soft)
        $sizeData = $pricingMatrix[$size] ?? $pricingMatrix['5.5x8.5'];
        $printingData = $sizeData[$printing] ?? $sizeData['B/W'];
        $paperData = $printingData[$paper] ?? $printingData['white paper'];
        $bindingData = $paperData[$binding] ?? $paperData['Soft'];

        // Calculate printing cost and author cost
        $numPages = floatval($book->num_pages ?? 0);
        $printingCost = $numPages > 0 ? ($numPages * $bindingData['perPage']) + $bindingData['binding'] : 0;
        $authorCost = $printingCost > 0 ? $printingCost * 1.4 : 0;

        return $authorCost;
    }

    /**
     * Show Checkout Page for Author Copies
     */
    public function showAuthorCopiesCheckout(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'copies' => 'required|integer|min:0',
        ]);

        $book = \App\Models\Book::findOrFail($request->book_id);

        // Calculate author cost using pricing matrix (matches frontend calculation)
        $authorCost = $this->calculateAuthorCost($book);
        $publishingFee = ($book->step_completed < 5) ? 2999 : 0;
        $totalAmount = ($authorCost * $request->copies) + $publishingFee;

        return \Inertia\Inertia::render('Payment/AuthorCopiesCheckout', [
            'book' => $book,
            'copies' => (int) $request->copies,
            'costs' => [
                'per_copy' => $authorCost,
                'publishing_fee' => $publishingFee,
                'total' => $totalAmount
            ]
        ]);
    }

    /**
     * Check if current domain is a test/staging domain to allow payment bypass
     */
    private function isTestDomain()
    {
        $host = request()->getHost();
        return str_contains($host, 'radinfotec') || str_contains($host, 'localhost') || $host === '127.0.0.1';
    }

    /**
     * Process Author Copies Payment (POST)
     */
    public function initiateAuthorCopyPayment(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'copies' => 'required|integer|min:0',
            'shipping_address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:20',
            'contact_number' => 'required|string|max:20',
            'billing_name' => 'required|string|max:255',
            'billing_email' => 'required|email|max:255',
            'coupon_code' => 'nullable|string',
        ]);

        $book = \App\Models\Book::findOrFail($request->book_id);

        // Calculate author cost using pricing matrix (matches frontend calculation)
        $authorCost = $this->calculateAuthorCost($book);
        $publishingFee = ($book->step_completed < 5) ? 2999 : 0;

        $baseTotalAmount = ($authorCost * $request->copies) + $publishingFee;

        // Handle Coupon
        $discountAmount = 0;
        $appliedCouponCode = null;

        if ($request->coupon_code) {
            $coupon = \App\Models\Coupon::where('code', strtoupper($request->coupon_code))->where('is_active', true)->first();
            if ($coupon) {
                if (!$coupon->min_order_value || $baseTotalAmount >= $coupon->min_order_value) {
                    $discountAmount = ($publishingFee * $coupon->discount_percentage) / 100;
                    $appliedCouponCode = $coupon->code;
                }
            }
        }

        $finalAmount = max(0, $baseTotalAmount - $discountAmount);

        // Create Pending Transaction
        $transaction = \App\Models\Transaction::create([
            'book_id' => $book->id,
            'user_id' => auth()->id(),
            'author_id' => auth()->id(),
            'quantity' => $request->copies,
            'amount' => $finalAmount,
            'author_revenue' => 0,
            'platform_commission' => $publishingFee - $discountAmount,
            'payment_method' => 'upi',
            'sales_channel' => 'direct',
            'payment_status' => 'pending',
            'transaction_id' => 'TXN_' . strtoupper(uniqid()),
            'notes' => json_encode([
                'billing_name' => $request->billing_name,
                'billing_email' => $request->billing_email,
                'shipping_address' => $request->shipping_address,
                'city' => $request->city,
                'state' => $request->state,
                'pincode' => $request->pincode,
                'contact_number' => $request->contact_number,
                'type' => 'author_copies_order',
                'coupon_code' => $appliedCouponCode,
                'discount_amount' => $discountAmount,
                'base_amount' => $baseTotalAmount
            ]),
        ]);

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        if ($this->isTestDomain()) {
            \Illuminate\Support\Facades\Log::info('Bypassing payment for test domain: ' . request()->getHost());
            $this->fulfillOrder($transaction->transaction_id, ['bypass' => true]);
            return $this->redirectSuccess($transaction->transaction_id);
        }

        // Initiate PhonePe Payment
        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        // Store transaction ID in session for fallback retrieval on redirect
        session(['pending_payment_txn_id' => $transaction->transaction_id]);

        $response = $this->phonePeService->initiatePayment(
            $transaction->transaction_id,
            $finalAmount,
            $callbackUrl,
            $redirectUrl,
            auth()->id(),
            auth()->user()->mobile_number ?? '9999999999'
        );

        if ($response['success']) {
            return \Inertia\Inertia::location($response['url']);
        }

        return back()->with('error', 'Payment Initiation Failed: ' . ($response['message'] ?? 'Unknown error'));
    }

    /**
     * Show the checkout page for a book
     */
    public function checkout(Request $request, \App\Models\Book $book)
    {
        $type = $request->query('type', 'hardcover');

        return \Inertia\Inertia::render('Payment/Checkout', [
            'book' => $book->load('user'),
            'purchaseType' => $type
        ]);
    }

    /**
     * Process payment (General Book Purchase)
     */
    public function processPayment(Request $request, \App\Models\Book $book)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'shipping_details' => 'nullable|array', // Optional for now, but frontend enforces it
            'shipping_details.full_name' => 'nullable|string',
            'shipping_details.email' => 'nullable|email',
            'shipping_details.phone' => 'nullable|string',
            'shipping_details.address' => 'nullable|string',
            'shipping_details.city' => 'nullable|string',
            'shipping_details.state' => 'nullable|string',
            'shipping_details.pincode' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric',
        ]);

        // Generate Transaction ID
        $txnId = 'BOOK_' . strtoupper(uniqid());

        // Prepare Shipping Info as JSON for 'notes' column
        $shippingDetails = $validated['shipping_details'] ?? [];
        if (!empty($validated['coupon_code'])) {
            $shippingDetails['coupon_code'] = $validated['coupon_code'];
            $shippingDetails['discount_amount'] = $validated['discount_amount'];
        }
        $shippingJson = !empty($shippingDetails) ? json_encode($shippingDetails) : null;

        // Determine User Details
        $userId = auth()->id(); // Nullable for guests

        $mobileNumber = '9999999999';
        if (!empty($validated['shipping_details']['phone'])) {
            $mobileNumber = $validated['shipping_details']['phone'];
        } elseif (auth()->check()) {
            $mobileNumber = auth()->user()->mobile_number ?? '9999999999';
        }

        // Create Transaction Record
        try {
            \Illuminate\Support\Facades\Log::info('Creating transaction', ['validated' => $validated]);

            $shippingJson = json_encode($validated['shipping_details'] ?? []);

            $transaction = \App\Models\Transaction::create([
                'book_id' => $book->id,
                'user_id' => $userId, // Fixed: nullable
                'author_id' => $book->user_id, // Author to pay
                'quantity' => 1,
                'amount' => $validated['amount'],
                // Fees
                'author_revenue' => 0,
                'platform_commission' => $validated['amount'],
                'payment_method' => match ($validated['payment_method'] ?? 'card') {
                    'phonepe' => 'upi',
                    'card', 'upi', 'netbanking', 'wallet' => $validated['payment_method'],
                    default => 'other'
                },
                'sales_channel' => 'direct',
                'payment_status' => 'pending',
                'transaction_id' => $txnId,
                'notes' => $shippingJson,
                'city' => data_get($validated, 'shipping_details.city'),
                'state' => data_get($validated, 'shipping_details.state'),
                'country' => 'India', // Default
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating transaction: ' . $e->getMessage(), ['validated' => $validated]);
            return back()->with('error', 'Failed to create transaction. Please try again.');
        }

        // --- BYPASS LOGIC FOR TEST DOMAINS ---
        if ($this->isTestDomain()) {
            \Illuminate\Support\Facades\Log::info('Bypassing payment for test domain: ' . request()->getHost());
            $this->fulfillOrder($txnId, ['bypass' => true]);
            return $this->redirectSuccess($txnId);
        }

        // Initiate PhonePe Payment
        $callbackUrl = route('payment.phonepe.callback');
        $redirectUrl = route('payment.phonepe.redirect');

        // Store transaction ID in session for fallback retrieval on redirect
        session(['pending_payment_txn_id' => $txnId]);

        $response = $this->phonePeService->initiatePayment(
            $txnId,
            $validated['amount'],
            $callbackUrl,
            $redirectUrl,
            $userId ?? 'GUEST_' . uniqid(), // Pass a unique guest ID string if null
            $mobileNumber
        );

        if ($response['success']) {
            return \Inertia\Inertia::location($response['url']);
        }

        return back()->with('error', 'Payment Initiation Failed: ' . ($response['message'] ?? 'Unknown error'));
    }

    /**
     * Handle PhonePe Redirect (User Return)
     */
    public function handlePhonePeRedirect(Request $request)
    {
        $input = $request->all();
        \Illuminate\Support\Facades\Log::info('PhonePe Redirect Input:', $input);
        \Illuminate\Support\Facades\Log::info('PhonePe Redirect Full URL: ' . $request->fullUrl());

        // V2 Redirect usually has 'merchantOrderId' directly
        // Try multiple possible parameter names
        $merchantTransactionId = $input['merchantOrderId']
            ?? $input['transactionId']
            ?? $input['merchantTransactionId']
            ?? $input['orderId']
            ?? $input['order_id']
            ?? $input['txnId']
            ?? null;

        // Fallback: Check for 'response' (Base64 encoded - mostly V1 but sometimes used)
        if (!$merchantTransactionId && isset($input['response'])) {
            try {
                $decoded = json_decode(base64_decode($input['response']), true);
                \Illuminate\Support\Facades\Log::info('PhonePe Decoded Response:', $decoded);

                // Check V1/Hybrid structure
                $merchantTransactionId = $decoded['data']['merchantTransactionId']
                    ?? $decoded['data']['merchantOrderId']
                    ?? $decoded['payload']['merchantOrderId']
                    ?? null;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('PhonePe Response Decode Error: ' . $e->getMessage());
            }
        }

        // Fallback: Check the referrer URL from PhonePe for embedded ID
        if (!$merchantTransactionId) {
            // Check if there's a state parameter with encoded data
            if (isset($input['state'])) {
                \Illuminate\Support\Facades\Log::info('PhonePe State Parameter: ' . $input['state']);
            }
        }

        // Fallback: Check Laravel session for pending transaction ID
        // This handles cases where PhonePe redirect doesn't include the transaction ID in URL
        if (!$merchantTransactionId) {
            $pendingTxnId = session('pending_payment_txn_id');
            if ($pendingTxnId) {
                \Illuminate\Support\Facades\Log::info('Retrieved transaction ID from session: ' . $pendingTxnId);
                $merchantTransactionId = $pendingTxnId;
                // Clear the session after retrieval
                session()->forget('pending_payment_txn_id');
            }
        }

        if (!$merchantTransactionId) {
            // Log warning and redirect to dashboard with error
            \Illuminate\Support\Facades\Log::warning('PhonePe Redirect missing ID. Full Input: ' . json_encode($input));
            return redirect()->route('dashboard')->with('error', 'Invalid Payment Response: Missing Transaction ID. Please contact support if money was deducted.');
        }

        // Verify Status with backend (Server to Server Check)
        $response = $this->phonePeService->verifyPayment($merchantTransactionId);

        if ($response['success'] && $response['status'] === 'paid') {
            $this->fulfillOrder($merchantTransactionId, $response['data']);
            return $this->redirectSuccess($merchantTransactionId);
        } elseif ($response['status'] === 'pending') {
            return \Inertia\Inertia::render('Payment/Pending', ['transactionId' => $merchantTransactionId]);
        } else {
            return $this->redirectFailure($merchantTransactionId, $response['message'] ?? 'Payment Failed or Incomplete');
        }
    }

    /**
     * Handle PhonePe Callback (Server to Server)
     */
    public function handlePhonePeCallback(Request $request)
    {
        // V2 Callback is typically JSON body
        $content = $request->getContent();
        \Illuminate\Support\Facades\Log::info('PhonePe Callback Received: ' . $content);
        $data = json_decode($content, true);

        // Check for V2 structure: { "type": "PAYMENT_SUCCESS", "payload": { "merchantOrderId": "..." } }
        // Or V1 structure (managed by existing logic if needed, but we are moving to V2)

        $merchantTransactionId = null;
        $state = null;

        if (json_last_error() === JSON_ERROR_NONE && isset($data['payload'])) {
            // V2 Structure
            $merchantTransactionId = $data['payload']['merchantOrderId'] ?? null;
            $state = $data['payload']['state'] ?? null; // e.g., COMPLETED, PAYMENT_SUCCESS
        } else {
            // Fallback to V1 logic if needed or raw input check
            $input = $request->all();
            if (isset($input['response'])) {
                $json = base64_decode($input['response']);
                $v1Data = json_decode($json, true);
                $merchantTransactionId = $v1Data['data']['merchantTransactionId'] ?? null;
            }
        }

        if ($merchantTransactionId) {
            // Always verify with upstream to be secure
            $response = $this->phonePeService->verifyPayment($merchantTransactionId);

            if ($response['success'] && $response['status'] === 'paid') {
                $this->fulfillOrder($merchantTransactionId, $response['data']);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Fulfill Order Logic based on ID Prefix
     */
    protected function fulfillOrder($txnId, $gatewayData)
    {
        // (Logic remains same, ensuring we don't double-fulfill if already paid)

        if (str_starts_with($txnId, 'GUEST_')) {
            $id = substr($txnId, 6);
            $session = \App\Models\GuestWritingSession::find($id);
            if ($session && $session->payment_status !== 'paid') {
                $session->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                ]);
                try {
                    \Illuminate\Support\Facades\Mail::to($session->email)->send(new \App\Mail\GuestSessionAccess($session));
                } catch (\Exception $e) {
                }
            }
        } elseif (str_starts_with($txnId, 'CHAL_')) {
            $parts = explode('_', $txnId);
            $id = $parts[1] ?? null; // Extract ID properly

            if ($id) {
                $enrollment = \App\Models\ChallengeEnrollment::find($id);
                if ($enrollment) {
                    $enrollment->update(['payment_status' => 'paid']);
                }
            }
        } elseif (str_starts_with($txnId, 'PRO_')) {
            $id = substr($txnId, 4);
            $req = \App\Models\ProfessionalServiceRequest::find($id);
            if ($req && $req->payment_id !== $txnId) { // Check if we already processed this ID?
                // Better check: is it already in a paid state?
                // We'll just update it.
                $nextStatus = ($req->service_type !== 'cover') ? 'pending_upload' : 'pending';
                $req->update(['status' => $nextStatus, 'payment_id' => $txnId]);
            }
        } elseif (str_starts_with($txnId, 'TXN_') || str_starts_with($txnId, 'BOOK_')) {
            $txn = \App\Models\Transaction::where('transaction_id', $txnId)->first();
            if ($txn && $txn->payment_status !== 'completed') {
                $txn->update([
                    'payment_status' => 'completed',
                    'completed_at' => now()
                ]);

                // Credit author wallet balance (if royalty is defined and author exists)
                if ($txn->author_id && $txn->author_revenue > 0) {
                    $author = \App\Models\User::find($txn->author_id);
                    if ($author) {
                        $author->increment('wallet_balance', $txn->author_revenue);
                    }
                }

                // Update Book Status if applicable
                if ($txn->book_id) {
                    $book = \App\Models\Book::find($txn->book_id);
                    if ($book) {
                        // If book was in draft/process steps, move to submitted/published
                        if ($book->step_completed < 5) {
                            $book->update([
                                'step_completed' => 5,
                                'status' => 'submitted', // Or 'published' based on business logic, usually 'submitted' for review queue
                                'publication_date' => now()
                            ]);
                        }
                    }
                }

                // Notify Admin for Book Orders
                try {
                    \Illuminate\Support\Facades\Mail::to(config('mail.from.address', 'admin@publicationmart.com'))
                        ->send(new \App\Mail\OrderPlacedNotification($txn));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Order Notification Email Failed: ' . $e->getMessage());
                }

                // Notify Buyer (Order Confirmation)
                try {
                    $shipping = json_decode($txn->notes, true) ?? [];
                    // Prefer email from shipping details (checkout form), fallback to user account
                    $buyerEmail = $shipping['email'] ?? ($txn->user ? $txn->user->email : null);
                    $buyerName = $shipping['full_name'] ?? ($txn->user ? $txn->user->name : 'Customer');

                    if ($buyerEmail) {
                        \Illuminate\Support\Facades\Mail::to($buyerEmail)
                            ->send(new \App\Mail\OrderConfirmation($txn, $buyerName));
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Buyer Confirmation Email Failed: ' . $e->getMessage());
                }
            }
        } elseif (str_starts_with($txnId, 'AI_')) {
            // AI Studio Plan: AI_{book_id}_{plan_type}_{plan_name}_{uniq}
            $parts = explode('_', $txnId);

            // Expected at least 4 parts: AI, BookID, Type, Name, time
            if (count($parts) >= 4) {
                $bookId = $parts[1];
                $planType = $parts[2];
                $planName = $parts[3];

                $book = \App\Models\Book::find($bookId);
                if ($book) {
                    $book->update([
                        'ai_plan_type' => $planType,
                        'ai_plan_name' => $planName
                    ]);
                }

                // Update Transaction Status
                $txn = \App\Models\Transaction::where('transaction_id', $txnId)->first();
                if ($txn && $txn->payment_status !== 'completed') {
                    $txn->update(['payment_status' => 'completed']);
                }
            }
        }
    }

    protected function redirectSuccess($txnId)
    {
        if (str_starts_with($txnId, 'GUEST_')) {
            $id = substr($txnId, 6);
            $session = \App\Models\GuestWritingSession::find($id);
            if ($session) {
                return redirect()->route('guest-writer.studio', ['token' => $session->session_token]);
            }
        } elseif (str_starts_with($txnId, 'CHAL_')) {
            $parts = explode('_', $txnId);
            $id = $parts[1] ?? null;
            if ($id) {
                return redirect()->route('challenges.success', ['enrollment' => $id]);
            }
            return redirect()->route('dashboard')->with('success', 'Payment Successful');
        } elseif (str_starts_with($txnId, 'PRO_')) {
            $id = substr($txnId, 4);
            $req = \App\Models\ProfessionalServiceRequest::find($id);
            if ($req) {
                return redirect()->route('professional.success', $id);
            }
            return redirect()->route('dashboard')->with('success', 'Payment Successful');
        } elseif (str_starts_with($txnId, 'TXN_') || str_starts_with($txnId, 'BOOK_')) {
            $txn = \App\Models\Transaction::where('transaction_id', $txnId)->first();
            return \Inertia\Inertia::render('Payment/Success', [
                'transaction' => [
                    'transaction_id' => $txnId,
                    'amount' => $txn ? $txn->amount : '0.00'
                ]
            ]);
        } elseif (str_starts_with($txnId, 'AI_')) {
            $parts = explode('_', $txnId);
            $bookId = $parts[1];
            $plan = $parts[2];
            if ($plan === 'formatting')
                return redirect()->route('books.format', $bookId);
            if ($plan === 'cover')
                return redirect()->route('books.cover-creator', $bookId);
            return redirect()->route('books.ai-studio', $bookId);
        }

        return redirect()->route('dashboard')->with('success', 'Payment Successful');
    }

    protected function redirectFailure($txnId, $message)
    {
        return \Inertia\Inertia::render('Payment/Failure', ['error' => ['message' => $message, 'transaction_id' => $txnId]]);
    }

    /**
     * Handle payment success callback (Legacy/Internal)
     */
    public function paymentSuccess(Request $request)
    {
        return \Inertia\Inertia::render('Payment/Success', [
            'transaction' => $request->all()
        ]);
    }

    /**
     * Handle payment failure callback (Legacy/Internal)
     */
    public function paymentFailure(Request $request)
    {
        return \Inertia\Inertia::render('Payment/Failure', [
            'error' => $request->all()
        ]);
    }
}
