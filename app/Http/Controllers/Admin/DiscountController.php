<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DiscountController extends Controller
{
    public function index()
    {
        $coupons = Coupon::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code|max:20',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'min_order_value' => 'nullable|numeric|min:0',
        ]);

        Coupon::create([
            'code' => strtoupper($validated['code']),
            'discount_percentage' => $validated['discount_percentage'],
            'is_active' => true,
            'created_by' => Auth::id(),
            'min_order_value' => $validated['min_order_value'] ?? null,
            'usage_count' => 0,
            'valid_genres' => null,
            'valid_books' => null,
        ]);

        return redirect()->back()->with('success', 'Coupon created successfully.');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return redirect()->back()->with('success', 'Coupon deleted successfully.');
    }

    public function toggleStatus(Coupon $coupon)
    {
        $coupon->update(['is_active' => !$coupon->is_active]);
        return redirect()->back()->with('success', 'Coupon status updated.');
    }
}
