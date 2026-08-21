<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TransactionsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have some books and users
        $books = Book::all();
        if ($books->count() == 0) {
            $this->command->info('No books found. Skipping transaction seeding.');
            return;
        }

        $users = User::all();
        $admin = User::where('email', 'admin@publicationmart.com')->first();
        // Buyer can be any user or admin, just for FK constraint
        $buyer = $users->first() ?? $admin;

        if (!$buyer) {
            $this->command->info('No users found. Skipping transaction seeding.');
            return;
        }

        foreach ($books as $book) {
            // Generate sales for the last 6 months
            for ($i = 0; $i < 50; $i++) {
                $channel = fake()->randomElement(['amazon', 'google', 'other', 'direct']);
                $quantity = fake()->numberBetween(1, 10);
                $date = Carbon::now()->subDays(rand(0, 180));

                $price = $book->selling_price > 0 ? $book->selling_price : 200;

                // Adjust logic based on channel if needed
                if ($channel === 'direct') {
                    // Author bought - price might be author cost
                    $price = $book->author_cost > 0 ? $book->author_cost : 150;
                }

                $totalAmount = $price * $quantity;

                // Revenue calculation:
                // Direct (Author copy): Revenue is 0 or different? Let's say user request implied profit calculation.
                // "author bought books" -> Author pays cost. Profit for platform? Or Author's profit? 
                // User dashboard says "Author's Profit". If author buys their own book at cost, profit is 0 usually from that specific sale for the author himself.
                // But for Amazon/International, Author gets Royalty.
                // Royalty = Selling Price - Printing Cost (Author Cost).

                $royaltyPerBook = 0;
                if ($channel !== 'direct') {
                    // Standard sale
                    $royaltyPerBook = max(0, $book->selling_price - $book->author_cost);
                } else {
                    // Author copy sale - No royalty to author usually, as they are paying cost.
                    // But maybe there is a platform fee?
                    // User prompt: "direct sale(author bought books )set the same logic"
                    // If author buys, they pay Printing + 40% (Author Cost).
                    // This 40% margin might be Platform commission?
                    // Let's assume Author's Profit (Royalty) is 0 for Direct sales (their own purchase).
                }

                $authorRevenue = $royaltyPerBook * $quantity;
                $platformCommission = $totalAmount - $authorRevenue; // simplified

                Transaction::create([
                    'book_id' => $book->id,
                    'user_id' => $buyer->id, // Placeholder buyer
                    'author_id' => $book->user_id,
                    'quantity' => $quantity,
                    'transaction_id' => 'TXN-' . Str::random(10),
                    'amount' => $totalAmount,
                    'author_revenue' => $authorRevenue,
                    'platform_commission' => $platformCommission,
                    'tax_amount' => $totalAmount * 0.18, // 18% GST estimate
                    'payment_method' => 'card',
                    'payment_status' => 'completed',
                    'sales_channel' => $channel,
                    // If channel is 'other' let's assume it's International
                    'country' => $channel === 'other' ? 'US' : 'IN',
                    'completed_at' => $date,
                    'created_at' => $date, // For analytics grouping
                    'updated_at' => $date,
                ]);
            }
        }
    }
}
