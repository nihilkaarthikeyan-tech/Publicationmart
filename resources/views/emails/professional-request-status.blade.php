@component('mail::message')
# Status Update: {{ $serviceName }}

Hello {{ $request->user->name }},

The status of your **{{ $serviceName }}** request for the book **"{{ $request->book->title ?? 'your book' }}"** has been
updated to:

# **{{ strtoupper(str_replace('_', ' ', $status)) }}**

@if($adminNotes)
    @component('mail::panel')
    **Message from our team:**
    {{ $adminNotes }}
    @endcomponent
@endif

@if($status === 'in_progress')
    Our professional team has started working on your request. We will notify you once it is completed.
@elseif($status === 'completed')
    Great news! Your request has been completed successfully.
    @if($formattedFile)
        You can now download your formatted manuscript from your dashboard.
    @endif
@elseif($status === 'cancelled')
    Your request has been cancelled. If you believe this is a mistake, please contact support.
@endif

@component('mail::button', ['url' => config('app.url') . '/dashboard'])
View Dashboard
@endcomponent

Best regards,
**PublicationMart Team**

---
*If you have any questions, please reply to this email.*
@endcomponent