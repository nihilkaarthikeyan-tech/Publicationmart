<?php

namespace App\Services\Admin;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Coupon;
use App\Models\ChallengeEnrollment;
use Illuminate\Support\Facades\Auth;

class AdminDashboardService
{
    /**
     * Get all dashboard metrics
     */
    public function getDashboardMetrics()
    {
        $adminId = Auth::id();
        $isSuperAdmin = Auth::user()->hasRole('super_admin');

        // Get all transactions for admin's books (for calculations)
        $adminBookIds = Book::where('user_id', $adminId)->pluck('id');
        $allTransactions = Transaction::where('payment_status', 'completed')
            ->whereIn('book_id', $adminBookIds)
            ->get();

        $revenueGrowth = $this->calculateRevenueGrowth($allTransactions);
        $stats = $this->calculateStats($adminId, $allTransactions, $revenueGrowth);
        $monthlyRevenue = $this->calculateMonthlyRevenue($allTransactions);

        $topBooks = $this->getTopBooks($adminId);
        $recentBooks = $this->getRecentBooks($adminId);
        $recentTransactions = $this->getRecentTransactions($adminBookIds);

        $pendingBooks = $this->getPendingBooks();
        $coupons = $this->getCoupons($isSuperAdmin);
        $latestPlatformOrders = $this->getLatestPlatformOrders();
        $aiWritingStats = $this->getAiWritingStats();
        $challengeEnrollments = $this->getChallengeEnrollments();

        return [
            'stats' => $stats,
            'monthlyRevenue' => $monthlyRevenue,
            'topBooks' => $topBooks,
            'recentBooks' => $recentBooks,
            'recentTransactions' => $recentTransactions,
            'pendingBooks' => $pendingBooks,
            'coupons' => $coupons,
            'isMainAdmin' => $isSuperAdmin,
            'aiWritingStats' => $aiWritingStats,
            'latestPlatformOrders' => $latestPlatformOrders,
            'challengeEnrollments' => $challengeEnrollments,
        ];
    }

    private function calculateRevenueGrowth($allTransactions)
    {
        // This month and last month revenue for growth calculation
        $thisMonthRevenue = $allTransactions
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('author_revenue');
        $lastMonthRevenue = $allTransactions
            ->where('created_at', '>=', now()->subMonth()->startOfMonth())
            ->where('created_at', '<', now()->startOfMonth())
            ->sum('author_revenue');

        // Calculate revenue growth percentage
        return $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($thisMonthRevenue > 0 ? 100 : 0);
    }

    private function calculateStats($adminId, $allTransactions, $revenueGrowth)
    {
        // Base query for non-admin users (Authors) to replace invalid 'is_admin' column check
        $nonAdminBase = User::where(function ($q) {
            $q->whereNull('role')->orWhereNotIn('role', ['super_admin', 'editor']);
        });

        return [
            // Book stats
            'totalBooks' => Book::where('user_id', $adminId)->count(),
            'publishedBooks' => Book::where('user_id', $adminId)->where('status', 'approved')->count(),
            'pendingBooks' => Book::where('user_id', $adminId)
                ->where(function ($q) {
                    $q->whereIn('status', ['pending', 'draft'])->orWhereNull('status');
                })->count(),
            // Count ALL pending submissions for the approvals queue badge
            'awaitingApproval' => Book::where('step_completed', '>=', 4)
                ->where(function ($q) {
                    $q->whereIn('status', ['pending', 'draft', 'submitted'])->orWhereNull('status');
                })->count(),

            // Revenue stats (from real transactions)
            'totalRevenue' => $allTransactions->sum('amount'),
            'totalAuthorRevenue' => $allTransactions->sum('author_revenue'),
            'platformCommission' => $allTransactions->sum('platform_commission'),
            'revenueGrowth' => $revenueGrowth,

            // Sales stats
            'totalSales' => $allTransactions->sum('quantity'),
            'salesToday' => $allTransactions->where('created_at', '>=', now()->startOfDay())->sum('quantity'),
            'salesThisMonth' => $allTransactions->where('created_at', '>=', now()->startOfMonth())->sum('quantity'),

            // Author stats (for admin view)
            'totalAuthors' => (clone $nonAdminBase)->count(),
            'activeAuthors' => (clone $nonAdminBase)
                ->whereHas('books', fn($q) => $q->where('status', 'approved'))
                ->count(),
            'newAuthorsThisMonth' => (clone $nonAdminBase)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),

            // Breakdown by channel (Admin's books only)
            'breakdown' => [
                'amazon' => [
                    'quantity' => $allTransactions->where('sales_channel', 'amazon')->sum('quantity'),
                    'revenue' => $allTransactions->where('sales_channel', 'amazon')->sum('author_revenue'),
                ],
                'google' => [
                    'quantity' => $allTransactions->where('sales_channel', 'google')->sum('quantity'),
                    'revenue' => $allTransactions->where('sales_channel', 'google')->sum('author_revenue'),
                ],
                'other' => [
                    'quantity' => $allTransactions->where('sales_channel', 'other')->sum('quantity'),
                    'revenue' => $allTransactions->where('sales_channel', 'other')->sum('author_revenue'),
                ],
                'direct' => [
                    'quantity' => $allTransactions->where('sales_channel', 'direct')->sum('quantity'),
                    'revenue' => $allTransactions->where('sales_channel', 'direct')->sum('author_revenue'),
                ],
            ],
        ];
    }

    private function calculateMonthlyRevenue($allTransactions)
    {
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthRevenue = $allTransactions
                ->where('created_at', '>=', $month->copy()->startOfMonth())
                ->where('created_at', '<=', $month->copy()->endOfMonth())
                ->sum('author_revenue');
            $monthlyRevenue[] = [
                'month' => $month->format('M'),
                'revenue' => (float) $monthRevenue,
            ];
        }
        return $monthlyRevenue;
    }

    private function getTopBooks($adminId)
    {
        return Book::where('user_id', $adminId)
            ->where('status', 'approved')
            ->select('id', 'title', 'author_name')
            ->get()
            ->map(function ($book) {
                $bookTransactions = Transaction::where('book_id', $book->id)
                    ->where('payment_status', 'completed')
                    ->get();
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author_name' => $book->author_name,
                    'total_revenue' => (float) $bookTransactions->sum('author_revenue'),
                    'sales_count' => (int) $bookTransactions->sum('quantity'),
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(5)
            ->values();
    }

    private function getRecentBooks($adminId)
    {
        return Book::where('user_id', $adminId)
            ->select('id', 'title', 'author_name', 'status', 'created_at', 'user_id')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author_name' => $book->author_name,
                    'status' => $book->status ?? 'pending',
                    'created_at' => $book->created_at,
                ];
            });
    }

    private function getRecentTransactions($adminBookIds)
    {
        return Transaction::whereIn('book_id', $adminBookIds)
            ->with('book:id,title')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'book_title' => $t->book ? $t->book->title : 'Unknown Book',
                    'amount' => (float) $t->author_revenue,
                    'quantity' => (int) $t->quantity,
                    'payment_status' => $t->payment_status,
                    'sales_channel' => $t->sales_channel,
                    'created_at' => $t->created_at,
                ];
            });
    }

    private function getPendingBooks()
    {
        return Book::with('user:id,name,email')
            ->where(function ($q) {
                $q->whereIn('status', ['pending', 'draft'])
                    ->orWhereNull('status');
            })
            ->where('step_completed', '>=', 4) // Only books that completed the user flow
            ->select('id', 'title', 'author_name', 'status', 'created_at', 'user_id', 'isbn', 'selling_price', 'cover_design_path')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author_name' => $book->author_name,
                    'status' => $book->status ?? 'pending',
                    'created_at' => $book->created_at,
                    'user' => $book->user ? ['name' => $book->user->name, 'email' => $book->user->email] : null,
                    'has_isbn' => !empty($book->isbn),
                    'has_price' => $book->selling_price > 0,
                    'has_cover' => !empty($book->cover_design_path),
                ];
            });
    }

    private function getCoupons($isSuperAdmin)
    {
        if (!$isSuperAdmin) {
            return [];
        }

        return Coupon::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'discount_percentage' => $code->discount_percentage,
                    'min_order_value' => $code->min_order_value,
                    'is_active' => $code->is_active,
                    'usage_count' => $code->usage_count,
                    'created_at' => $code->created_at->format('Y-m-d'),
                ];
            });
    }

    private function getLatestPlatformOrders()
    {
        return Transaction::with(['book:id,title', 'user:id,name,email'])
            ->where('payment_status', 'completed')
            ->where('sales_channel', 'direct') // Direct store sales
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'transaction_id' => $t->transaction_id,
                    'book_title' => $t->book ? $t->book->title : 'Unknown Book',
                    'amount' => (float) $t->amount,
                    'quantity' => (int) $t->quantity,
                    'status' => $t->payment_status,
                    'customer_name' => $t->user ? $t->user->name : 'Guest',
                    'pys_shipping_details' => $t->notes ? json_decode($t->notes, true) : null,
                    'date' => $t->created_at->format('M d, Y H:i'),
                ];
            });
    }

    private function getAiWritingStats()
    {
        $booksWithAiPlans = Book::whereNotNull('ai_plan_type')->with(['aiChapters.sections'])->get();
        return [
            'totalAiBooks' => $booksWithAiPlans->count(),
            'activeToday' => Book::whereNotNull('ai_plan_type')
                ->whereHas('aiChapters.sections', fn($q) => $q->where('updated_at', '>=', now()->startOfDay()))
                ->count(),
            'totalPagesGenerated' => $booksWithAiPlans->sum(function ($book) {
                $totalWords = 0;
                foreach ($book->aiChapters as $chapter) {
                    $totalWords += $chapter->sections->sum(fn($s) => str_word_count($s->content ?? ''));
                }
                return ceil($totalWords / 275);
            }),
            'planBreakdown' => [
                'saver' => Book::where('ai_plan_name', 'saver')->count(),
                'standard' => Book::where('ai_plan_name', 'standard')->count(),
                'pro' => Book::where('ai_plan_name', 'pro')->count(),
                'enterprise' => Book::where('ai_plan_name', 'enterprise')->count(),
            ],
        ];
    }

    private function getChallengeEnrollments()
    {
        return ChallengeEnrollment::latest()
            ->limit(5)
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'type' => $e->challenge_type,
                    'name' => $e->full_name,
                    'email' => $e->email,
                    'mobile' => $e->mobile_number,
                    'city' => $e->city,
                    'fee' => $e->entry_fee,
                    'status' => $e->payment_status,
                    'date' => $e->created_at->format('M d, Y'),
                ];
            });
    }
}
