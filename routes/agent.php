<?php

/*
|--------------------------------------------------------------------------
| Support-agent portal — requires login + support_agent role
|--------------------------------------------------------------------------
| Same login as everyone else; the role middleware gates the portal.
*/

use App\Http\Controllers\SupportAgent\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'support_agent'])->prefix('agent')->name('agent.')->group(function () {
    Route::get('/dashboard', [TicketController::class, 'index'])->name('dashboard');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/reply', [TicketController::class, 'reply'])->name('tickets.reply');
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.status');
});
