<?php

namespace App\Events;

use App\Models\Book;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Book $book)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-approvals'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'book-submitted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->book->id,
            'title' => $this->book->title,
            'author_name' => $this->book->author_name,
            'status' => $this->book->status,
            'isbn' => $this->book->isbn,
            'selling_price' => $this->book->selling_price,
            'cover_design_path' => $this->book->cover_design_path,
            'user' => $this->book->user ? ['name' => $this->book->user->name, 'email' => $this->book->user->email] : null,
            'created_at' => $this->book->created_at,
        ];
    }
}
