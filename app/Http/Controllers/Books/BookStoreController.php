<?php

namespace App\Http\Controllers\Books;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookStoreController extends Controller
{
    /**
     * Display a listing of approved books.
     */
    public function index()
    {
        // Only fetch books that have been approved by Admin.
        // Select just the columns the storefront renders — the full rows
        // (formatting_data, cover_data, biographies…) plus each author's
        // user record weighed ~1.6MB of JSON per visit; this is ~240KB.
        $books = Book::where('status', 'approved')
            ->latest()
            ->get(['id', 'title', 'author_name', 'genre', 'selling_price',
                   'cover_design_path', 'amazon_link', 'google_books_link']);

        return Inertia::render('BookStore/Index', [
            'books' => $books
        ]);
    }

    /**
     * Display the specified book details (public view).
     */
    public function show(Book $book)
    {
        // Only show approved books
        if ($book->status !== 'approved') {
            abort(404, 'Book not found');
        }

        return Inertia::render('BookStore/Show', [
            'book' => $book->load('user')
        ]);
    }

    /**
     * Display the cart page for a book purchase.
     */
    public function cart(Request $request, Book $book)
    {
        if ($book->status !== 'approved') {
            abort(404, 'Book not found');
        }

        $format = $request->query('format', 'hardcover');

        return Inertia::render('BookStore/Cart', [
            'book' => $book,
            'format' => $format,
        ]);
    }

    /**
     * Process checkout and redirect to payment gateway.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'format' => 'required|in:hardcover,audiobook,ebook',
            'quantity' => 'required|integer|min:1',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        // SECURITY: price is computed server-side from the book's per-format
        // price, never taken from the request. Falls back to selling_price.
        $unitPrice = match ($validated['format']) {
            'hardcover' => (float) ($book->hardcover_price ?? $book->selling_price ?? 0),
            'ebook'     => (float) ($book->ebook_price ?? $book->selling_price ?? 0),
            'audiobook' => (float) ($book->audio_price ?? round(((float) ($book->selling_price ?? 0)) * 0.7)),
            default     => (float) ($book->selling_price ?? 0),
        };
        $amount = round($unitPrice * $validated['quantity'], 2);

        // Create a pending transaction
        $transaction = \App\Models\Transaction::create([
            'book_id' => $book->id,
            'user_id' => auth()->id(),
            'author_id' => $book->user_id,
            'quantity' => $validated['quantity'],
            'amount' => $amount,
            'author_revenue' => round($amount * 0.7, 2), // 70% to author
            'platform_commission' => round($amount * 0.3, 2), // 30% platform fee
            'sales_channel' => 'direct',
            'format' => $validated['format'],
            'payment_status' => 'pending',
            'transaction_id' => 'TXN_' . strtoupper(uniqid()),
        ]);

        // TODO: Integrate actual payment gateway here
        // For now, redirect to a placeholder payment page or success
        return Inertia::render('Payment/Checkout', [
            'book' => $book,
            'transaction' => $transaction,
            'format' => $validated['format'],
            'amount' => $amount,
        ]);
    }
}
