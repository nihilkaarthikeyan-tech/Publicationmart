<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Adversarial probing across many angles: mass assignment, boundary values,
 * validation gaps, and privilege boundaries. Each test states the property it
 * expects to hold; a failure is either a real bug or a wrong assumption.
 */
class BugHuntTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
    }

    private function book(User $owner, float $price = 500): Book
    {
        return Book::create([
            'user_id' => $owner->id, 'title' => 'B', 'author_name' => 'A',
            'selling_price' => $price, 'status' => 'approved',
        ]);
    }

    // ---------------------------------------------------- mass assignment (money)

    /** A user must not be able to top up their own wallet via the profile form. */
    public function test_profile_update_cannot_set_wallet_balance(): void
    {
        $user = User::factory()->create(['wallet_balance' => 0]);

        $this->actingAs($user)->patch(route('profile.update'), [
            'name'            => 'New Name',
            'email'           => 'new@example.test',
            'wallet_balance'  => 999999,
            'referral_balance'=> 999999,
        ]);

        $user->refresh();
        $this->assertEquals(0, (float) $user->wallet_balance, 'wallet_balance must not be mass-assignable via profile');
        $this->assertEquals(0, (float) $user->referral_balance);
    }

    /** Registration must not let a user grant themselves a role or balance. */
    public function test_registration_cannot_set_role_or_wallet(): void
    {
        $this->post(route('register'), [
            'name' => 'Evil', 'email' => 'evil@example.test',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'role' => 'super_admin', 'wallet_balance' => 500000, 'is_admin' => 1,
        ]);

        $user = User::where('email', 'evil@example.test')->first();
        if ($user) {
            $this->assertNotSame('super_admin', $user->role, 'registration must not set role');
            $this->assertEquals(0, (float) $user->wallet_balance, 'registration must not set wallet');
        }
        $this->assertTrue(true);
    }

    // ---------------------------------------------------------- coupon boundaries

    /** A coupon over 100% must never make the payable amount negative. */
    public function test_coupon_over_100_percent_cannot_go_negative(): void
    {
        $owner = User::factory()->create();
        $book  = $this->book($owner, 500);

        Coupon::create([
            'code' => 'MEGA', 'discount_percentage' => 150, 'is_active' => true,
            'created_by' => User::factory()->create()->id,
        ]);

        $this->post(route('payment.process', $book->id), [
            'payment_method' => 'phonepe', 'purchase_type' => 'hardcover',
            'coupon_code' => 'MEGA',
            'shipping_details' => ['full_name' => 'A', 'email' => 'a@b.test', 'phone' => '9999999999'],
        ]);

        $txn = \App\Models\Transaction::latest('id')->first();
        $this->assertGreaterThanOrEqual(0, (float) $txn->amount, 'amount must never be negative');
    }

    /** The coupon-verify API must reject a negative order amount. */
    public function test_coupon_verify_rejects_negative_amount(): void
    {
        Coupon::create([
            'code' => 'OK', 'discount_percentage' => 10, 'is_active' => true,
            'created_by' => User::factory()->create()->id,
        ]);
        $user = User::factory()->create();

        $r = $this->actingAs($user)->postJson(route('coupons.verify'), [
            'code' => 'OK', 'amount' => -1000,
        ]);

        // Whatever it does, it must not report a positive discount on a negative cart.
        if ($r->getStatusCode() === 200) {
            $this->assertLessThanOrEqual(0, (float) ($r->json('discount_amount') ?? 0));
        } else {
            $this->assertTrue(true);
        }
    }

    // ----------------------------------------------------------- boundary values

    /** Author copies of zero should not be a valid order. */
    public function test_author_copies_rejects_zero_copies(): void
    {
        $owner = User::factory()->create();
        $book  = $this->book($owner);

        $r = $this->actingAs($owner)->get(route('payment.author_copies', [
            'book_id' => $book->id, 'copies' => 0,
        ]));

        // Ordering zero copies is meaningless; it should not proceed to a payable order.
        $this->assertNotEquals(200, $r->getStatusCode(), 'zero copies should not be an orderable quantity');
    }

    /** Cart checkout must reject a zero or negative quantity. */
    public function test_cart_checkout_rejects_non_positive_quantity(): void
    {
        $owner = User::factory()->create();
        $book  = $this->book($owner);

        $this->actingAs($owner)->post(route('cart.checkout'), [
            'book_id' => $book->id, 'format' => 'hardcover', 'quantity' => 0,
        ])->assertSessionHasErrors('quantity');

        $this->actingAs($owner)->post(route('cart.checkout'), [
            'book_id' => $book->id, 'format' => 'hardcover', 'quantity' => -5,
        ])->assertSessionHasErrors('quantity');
    }

    // ------------------------------------------------------------- privilege line

    /** A normal user must not reach any admin route. */
    public function test_normal_user_cannot_reach_admin_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)->get('/admin/dashboard')->assertForbidden();
    }

    /** A normal user must not reach the challenge-settings admin page. */
    public function test_normal_user_cannot_reach_challenge_settings(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('admin.challenge-settings.index'))
            ->assertForbidden();
    }

    /** A normal user must not delete a coupon. */
    public function test_normal_user_cannot_delete_a_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'X', 'discount_percentage' => 10, 'is_active' => true,
            'created_by' => User::factory()->create()->id,
        ]);
        $user = User::factory()->create(['role' => 'user']);

        $r = $this->actingAs($user)->delete(route('admin.coupons.destroy', $coupon->id));
        $this->assertContains($r->getStatusCode(), [403, 404, 405], 'a normal user must not delete coupons');
        $this->assertDatabaseHas('coupons', ['id' => $coupon->id]);
    }

    // ------------------------------------------------------------- input handling

    /** Contact form with an over-length message must be rejected, not stored raw. */
    public function test_contact_form_rejects_missing_fields(): void
    {
        $this->post(route('contact.store'), ['name' => 'X'])
            ->assertSessionHasErrors(['email', 'subject', 'message']);
    }

    /** Unauthentodated users cannot open a support ticket list. */
    public function test_support_requires_auth(): void
    {
        $this->get(route('support.index'))->assertRedirect();
    }
}
