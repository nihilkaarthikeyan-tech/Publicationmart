<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric',
        ]);

        $code = strtoupper($validated['code']);
        $coupon = Coupon::where('code', $code)->first();

        // 1. Basic Validity Checks
        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code.'
            ], 422);
        }

        if (!$coupon->is_active) {
            // Same message as 'not found' on purpose: distinguishing the two
            // turns this public endpoint into an oracle for discovering which
            // coupon codes exist.
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code.'
            ], 422);
        }

        // 2. Minimum Order Value Check
        // If min_order_value is set and the cart amount is less than required
        if ($coupon->min_order_value && $validated['amount'] < $coupon->min_order_value) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimum order value of ₹' . number_format($coupon->min_order_value, 2) . ' required.'
            ], 422);
        }

        // 3. Calculate Discount
        // Ensure discount doesn't exceed 100% or result in negative amount
        $discountPercentage = min(100, max(0, $coupon->discount_percentage));
        $discountAmount = ($validated['amount'] * $discountPercentage) / 100;

        // Ensure we don't discount more than the total amount
        $discountAmount = min($discountAmount, $validated['amount']);

        $finalAmount = max(0, $validated['amount'] - $discountAmount);

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_percentage' => (float) $coupon->discount_percentage,
            'discount_amount' => round($discountAmount, 2),
            'final_amount' => round($finalAmount, 2),
            'message' => 'Coupon applied successfully!'
        ]);
    }
}
