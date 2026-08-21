<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        if (\Illuminate\Support\Facades\Auth::user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        $user = \Illuminate\Support\Facades\Auth::user();
        $books = $user->books;

        // Fetch user transactions (as author) - optimized
        $transactions = \App\Models\Transaction::select([
            'id',
            'book_id',
            'author_id',
            'quantity',
            'author_revenue',
            'payment_status',
            'sales_channel',
            'created_at'
        ])
            ->where('author_id', $user->id)
            ->where('payment_status', 'completed')
            ->get();

        // Calculate Analytics
        $totalSales = $transactions->sum('quantity');
        $totalRevenue = $transactions->sum('author_revenue');

        // This month's stats
        $thisMonthRevenue = $transactions->where('created_at', '>=', now()->startOfMonth())->sum('author_revenue');
        $thisMonthSales = $transactions->where('created_at', '>=', now()->startOfMonth())->sum('quantity');
        $todaySales = $transactions->where('created_at', '>=', now()->startOfDay())->sum('quantity');

        // Revenue growth
        $lastMonthRevenue = $transactions
            ->where('created_at', '>=', now()->subMonth()->startOfMonth())
            ->where('created_at', '<', now()->startOfMonth())
            ->sum('author_revenue');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($thisMonthRevenue > 0 ? 100 : 0);

        // --- NEW: Page Stats Calculation ---
        $activeDrafts = $this->getActiveDrafts($books);
        $smartSessions = $this->getSmartWriterSessions($user);

        $totalPagesCapacity = 0;
        $totalPagesUsed = 0;
        $pagesUsedThisMonth = 0;

        foreach ($activeDrafts as $proj) {
            $totalPagesCapacity += $proj['max_pages'];
            $totalPagesUsed += $proj['estimated_pages'];
        }
        foreach ($smartSessions as $sess) {
            // Parse plan name e.g "80-100" -> 100 max
            $max = 100;
            if (preg_match('/-(\d+)/', $sess['plan_name'], $m))
                $max = (int) $m[1];
            elseif (is_numeric($sess['plan_name']))
                $max = (int) $sess['plan_name'];
            elseif ($sess['plan_type'] == 'standard')
                $max = 150;
            elseif ($sess['plan_type'] == 'pro')
                $max = 200;
            elseif ($sess['plan_type'] == 'enterprise')
                $max = 250;

            // Estimate used pages (fallback logic as sessions don't store full content in list)
            $used = 0;

            $totalPagesCapacity += $max;
            $totalPagesUsed += $used;
        }

        $pagesRemaining = max(0, $totalPagesCapacity - $totalPagesUsed);


        return \Inertia\Inertia::render('Dashboard', [
            'books' => $books,
            'stats' => [
                'totalSales' => $totalSales,
                'totalRevenue' => $totalRevenue,
                'monthlyRevenue' => $thisMonthRevenue,
                'breakdown' => $this->getBreakdown($transactions),
                'totalBooks' => $books->count(),
                'publishedBooks' => $books->where('step_completed', '>=', 5)->count(),
                'draftBooks' => $books->where('step_completed', '<', 5)->count(),
                'revenueGrowth' => $revenueGrowth,
                'salesThisMonth' => $thisMonthSales,
                'salesToday' => $todaySales,
                // New Stats
                'pagesUsed' => $totalPagesUsed,
                'pagesRemaining' => $pagesRemaining,
                'pagesUsedThisMonth' => $pagesUsedThisMonth,
                'activePlan' => 'Creator Bundle',
                'walletBalance' => $user->wallet_balance ?? 0.00,
            ],
            'monthlyRevenueData' => $this->getMonthlyRevenueData($transactions),
            'topBooks' => $this->getTopBooks($books, $transactions),
            'recentTransactions' => $this->getRecentTransactions($user),
            'myCertificates' => \App\Models\Certificate::where('user_id', $user->id)->latest()->get(),
            'activeDrafts' => $activeDrafts,
            'smartWriterSessions' => $smartSessions,
            'referrals' => $this->getReferrals($user),
            'professionalRequests' => \App\Http\Controllers\ProfessionalServiceController::getUserRequests(),
            'activityFeed' => $this->getActivityFeed($user, $books, $transactions),
        ]);
    }

    private function getActivityFeed($user, $books, $transactions)
    {
        $feed = collect();

        // 1. Book Updates
        foreach ($books as $book) {
            $feed->push([
                'type' => 'book_update',
                'title' => 'Book Updated',
                'description' => "Updated \"{$book->title}\"",
                'date' => $book->updated_at,
                'icon' => 'book'
            ]);
            if ($book->created_at->diffInDays(now()) < 30) {
                $feed->push([
                    'type' => 'book_create',
                    'title' => 'New Book Created',
                    'description' => "Started working on \"{$book->title}\"",
                    'date' => $book->created_at,
                    'icon' => 'sparkles'
                ]);
            }
        }

        // 2. Transactions
        foreach ($transactions as $txn) {
            $feed->push([
                'type' => 'sale',
                'title' => 'New Sale',
                'description' => "Sold 1 copy of book via " . ucfirst($txn->sales_channel),
                'date' => $txn->created_at,
                'icon' => 'currency-rupee'
            ]);
        }

        // 3. Admin Feedback (from books)
        foreach ($books as $book) {
            if ($book->admin_feedback && $book->status === 'draft') {
                $feed->push([
                    'type' => 'alert',
                    'title' => 'Action Required',
                    'description' => "Admin requested changes on \"{$book->title}\"",
                    'date' => $book->updated_at,
                    'icon' => 'exclamation'
                ]);
            }
        }

        return $feed->sortByDesc('date')->values()->take(10);
    }

    private function getBreakdown($transactions)
    {
        return [
            'amazon' => [
                'quantity' => $transactions->where('sales_channel', 'amazon')->sum('quantity'),
                'revenue' => $transactions->where('sales_channel', 'amazon')->sum('author_revenue'),
            ],
            'google' => [
                'quantity' => $transactions->where('sales_channel', 'google')->sum('quantity'),
                'revenue' => $transactions->where('sales_channel', 'google')->sum('author_revenue'),
            ],
            'other' => [
                'quantity' => $transactions->where('sales_channel', 'other')->sum('quantity'),
                'revenue' => $transactions->where('sales_channel', 'other')->sum('author_revenue'),
            ],
            'direct' => [
                'quantity' => $transactions->where('sales_channel', 'direct')->sum('quantity'),
                'revenue' => $transactions->where('sales_channel', 'direct')->sum('author_revenue'),
            ],
        ];
    }

    private function getMonthlyRevenueData($transactions)
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthRevenue = $transactions
                ->where('created_at', '>=', $month->copy()->startOfMonth())
                ->where('created_at', '<=', $month->copy()->endOfMonth())
                ->sum('author_revenue');
            $data[] = [
                'month' => $month->format('M'),
                'revenue' => (float) $monthRevenue,
            ];
        }
        return $data;
    }

    private function getTopBooks($books, $transactions)
    {
        return $books->map(function ($book) use ($transactions) {
            $bookTransactions = $transactions->where('book_id', $book->id);
            return [
                'id' => $book->id,
                'title' => $book->title,
                'author_name' => $book->author_name,
                'total_revenue' => (float) $bookTransactions->sum('author_revenue'),
                'sales_count' => (int) $bookTransactions->sum('quantity'),
            ];
        })->sortByDesc('total_revenue')->take(5)->values();
    }

    private function getRecentTransactions($user)
    {
        return \App\Models\Transaction::with('book')
            ->where('author_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'book_title' => $t->book ? $t->book->title : 'Unknown Book',
                    'amount' => $t->author_revenue,
                    'quantity' => $t->quantity,
                    'payment_status' => $t->payment_status,
                    'sales_channel' => $t->sales_channel,
                    'created_at' => $t->created_at,
                ];
            });
    }

    private function getActiveDrafts($books)
    {
        // Include AI projects AND manual drafts
        return $books->filter(fn($book) => $book->step_completed < 5)->map(function ($book) {

            // Logic for AI Books
            if ($book->ai_plan_type) {
                $chapters = $book->aiChapters;
                $totalSections = 0;
                $sectionsWritten = 0;
                $totalWords = 0;

                foreach ($chapters as $chapter) {
                    $sections = $chapter->sections;
                    $totalSections += $sections->count();
                    $sectionsWritten += $sections->filter(fn($s) => !empty($s->content))->count();
                    $totalWords += $sections->sum(fn($s) => str_word_count($s->content ?? ''));
                }

                // Calculate max pages based on plan
                $maxPages = match ($book->ai_plan_name) {
                    'saver', '80-100' => 100,
                    'standard', '100-150' => 150,
                    'pro', '150-200' => 200,
                    'enterprise', '200-300' => 250,
                    default => 150
                };

                // Estimate pages (275 words per page for 6x9)
                $estimatedPages = ceil($totalWords / 275);
                $progress = $maxPages > 0 ? min(100, round(($estimatedPages / $maxPages) * 100)) : 0;

                return [
                    'id' => $book->id,
                    'title' => $book->title ?: 'Untitled Book',
                    'plan_type' => $book->ai_plan_type,
                    'plan_name' => $book->ai_plan_name,
                    'max_pages' => $maxPages,
                    'chapters_count' => $chapters->count(),
                    'total_sections' => $totalSections,
                    'sections_written' => $sectionsWritten,
                    'total_words' => $totalWords,
                    'estimated_pages' => $estimatedPages,
                    'progress' => $progress,
                    'status' => $sectionsWritten === 0 ? 'Not Started' : ($sectionsWritten >= $totalSections ? 'Completed' : 'In Progress'),
                    'cover_design_path' => $book->cover_design_path,
                    'formatted_file' => $book->interior_file,
                    'has_formatting_data' => !empty($book->formatting_data),
                    'updated_at' => $book->updated_at,
                ];
            } else {
                // Logic for Manual Books
                return [
                    'id' => $book->id,
                    'title' => $book->title ?: 'Untitled Book',
                    'plan_type' => 'Manual',
                    'plan_name' => 'Author Draft',
                    'max_pages' => 0,
                    'chapters_count' => 0,
                    'total_sections' => 0,
                    'sections_written' => 0,
                    'total_words' => 0,
                    'estimated_pages' => 0,
                    'progress' => ($book->step_completed / 5) * 100,
                    'status' => 'Draft',
                    'cover_design_path' => $book->cover_design_path,
                    'formatted_file' => $book->interior_file,
                    'has_formatting_data' => !empty($book->formatting_data),
                    'updated_at' => $book->updated_at,
                ];
            }
        })->values();
    }

    private function getSmartWriterSessions($user)
    {
        return \App\Models\GuestWritingSession::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->whereNull('book_id') // Exclude sessions already converted to books
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'session_token' => $session->session_token,
                    'title' => $session->title,
                    'plan_name' => $session->plan_name,
                    'plan_type' => ucfirst($session->plan_type),
                    'current_step' => $session->current_step,
                    'updated_at' => $session->updated_at,
                    'updated_at_human' => $session->updated_at->diffForHumans(),
                ];
            });
    }

    private function getReferrals($user)
    {
        return $user->referrals()->latest()->take(10)->get()->map(function ($ref) {
            return [
                'id' => $ref->id,
                'name' => $ref->name,
                'email' => $ref->email,
                'date' => $ref->created_at->format('Y-m-d'),
                'status' => 'Registered',
                'earnings' => 0 // Earnings are credited when they make purchases
            ];
        });
    }
}
