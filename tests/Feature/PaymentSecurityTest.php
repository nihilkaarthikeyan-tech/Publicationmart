<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Coupon;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for the payment vulnerabilities found in the August 2026
 * audit. These lock in the fixes so the bugs cannot silently return.
 */
class PaymentSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeBook(float $price = 500.00): Book
    {
        $author = User::factory()->create();

        return Book::create([
            'user_id'       => $author->id,
            'title'         => 'Test Book',
            'author_name'   => 'Test Author',
            'selling_price' => $price,
            'status'        => 'approved',
        ]);
    }

    /** C1: the order amount must come from the book, never from the request. */
    public function test_client_cannot_set_the_payment_amount(): void
    {
        $book = $this->makeBook(500.00);

        $this->post(route('payment.process', $book->id), [
            'payment_method'   => 'phonepe',
            'purchase_type'    => 'hardcover',
            'amount'           => 1,       // tampered — must be ignored
            'shipping_details' => ['full_name' => 'A', 'email' => 'a@b.test', 'phone' => '9999999999'],
        ]);

        $txn = Transaction::latest('id')->first();

        $this->assertNotNull($txn, 'a transaction should have been created');
        $this->assertEquals(500.00, (float) $txn->amount, 'the client-supplied amount must be ignored');
    }

    /** C1: an unknown/inactive coupon must not reduce the price. */
    public function test_invalid_coupon_does_not_reduce_the_amount(): void
    {
        $book = $this->makeBook(500.00);

        $this->post(route('payment.process', $book->id), [
            'payment_method'   => 'phonepe',
            'purchase_type'    => 'hardcover',
            'coupon_code'      => 'DOES-NOT-EXIST',
            'shipping_details' => ['full_name' => 'A', 'email' => 'a@b.test', 'phone' => '9999999999'],
        ]);

        $txn = Transaction::latest('id')->first();
        $this->assertEquals(500.00, (float) $txn->amount);
    }

    /** C1/M5: a valid coupon discounts server-side AND is recorded on the order. */
    public function test_valid_coupon_is_applied_and_recorded(): void
    {
        $book = $this->makeBook(500.00);

        Coupon::create([
            'code'                => 'HALF',
            'discount_percentage' => 50,
            'is_active'           => true,
            'created_by'          => User::factory()->create()->id,
        ]);

        $this->post(route('payment.process', $book->id), [
            'payment_method'   => 'phonepe',
            'purchase_type'    => 'hardcover',
            'coupon_code'      => 'HALF',
            'shipping_details' => ['full_name' => 'A', 'email' => 'a@b.test', 'phone' => '9999999999'],
        ]);

        $txn = Transaction::latest('id')->first();
        $this->assertEquals(250.00, (float) $txn->amount, 'discount must be computed server-side');

        $notes = json_decode($txn->notes, true) ?? [];
        $this->assertSame('HALF', $notes['coupon_code'] ?? null, 'coupon must survive into the saved order (M5)');
    }

    /** C1: audio purchases are priced at 70% server-side. */
    public function test_audio_purchase_is_priced_server_side(): void
    {
        $book = $this->makeBook(500.00);

        $this->post(route('payment.process', $book->id), [
            'payment_method'   => 'phonepe',
            'purchase_type'    => 'audio',
            'amount'           => 5,
            'shipping_details' => ['full_name' => 'A', 'email' => 'a@b.test', 'phone' => '9999999999'],
        ]);

        $txn = Transaction::latest('id')->first();
        $this->assertEquals(350.00, (float) $txn->amount);
    }

    /** M1: an order must only ever be fulfilled once, even under concurrency. */
    public function test_order_is_only_fulfilled_once(): void
    {
        $book   = $this->makeBook(500.00);
        $author = User::find($book->user_id);
        $author->update(['wallet_balance' => 0]);

        $txn = Transaction::create([
            'book_id'             => $book->id,
            'author_id'           => $author->id,
            'quantity'            => 1,
            'amount'              => 500,
            'author_revenue'      => 100,
            'platform_commission' => 400,
            'sales_channel'       => 'direct',
            'payment_status'      => 'pending',
            'transaction_id'      => 'BOOK_ONCE_ONLY',
        ]);

        $controller = app(\App\Http\Controllers\PaymentController::class);
        $method = new \ReflectionMethod($controller, 'fulfillOrder');
        $method->setAccessible(true);

        // Simulate the gateway callback and the browser redirect both arriving.
        $method->invoke($controller, 'BOOK_ONCE_ONLY', ['bypass' => true]);
        $method->invoke($controller, 'BOOK_ONCE_ONLY', ['bypass' => true]);

        $author->refresh();
        $this->assertEquals(100, (float) $author->wallet_balance, 'author must be credited exactly once');
        $this->assertEquals('completed', $txn->fresh()->payment_status);
    }
}
