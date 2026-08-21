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
        // Only fetch books that have been approved by Admin
        $books = Book::with('user')
            ->where('status', 'approved')
            ->latest()
            ->get();

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
            'amount' => 'required|numeric|min:0',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        // Create a pending transaction
        $transaction = \App\Models\Transaction::create([
            'book_id' => $book->id,
            'user_id' => auth()->id(),
            'author_id' => $book->user_id,
            'quantity' => $validated['quantity'],
            'amount' => $validated['amount'],
            'author_revenue' => $validated['amount'] * 0.7, // 70% to author
            'platform_commission' => $validated['amount'] * 0.3, // 30% platform fee
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
            'amount' => $validated['amount'],
        ]);
    }
}
