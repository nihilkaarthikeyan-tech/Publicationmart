<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Reply</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #a4485c, #6a222d); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
        .header p { color: #ecdcb4; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 30px; }
        .ticket-ref { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        .ticket-ref span { color: #a4485c; font-weight: bold; }
        .reply-box { background: #f5f3ff; border: 1px solid #eed2d5; border-left: 4px solid #a4485c; border-radius: 8px; padding: 20px; margin: 20px 0; color: #374151; line-height: 1.6; }
        .reply-label { font-size: 12px; color: #a4485c; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
        .btn { display: inline-block; background: #a4485c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 20px 0; font-size: 14px; }
        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{ $isAdminReply ? '💬 Support Team Replied' : '👤 User Replied' }}</h1>
        <p>Ticket #{{ $ticket->ticket_number }} – {{ $ticket->subject }}</p>
    </div>
    <div class="body">
        @if($isAdminReply)
            <p>Hi <strong>{{ $ticket->name }}</strong>,</p>
            <p>Our support team has replied to your ticket.</p>
        @else
            <p>The user <strong>{{ $ticket->name }}</strong> has replied to their support ticket.</p>
        @endif

        <div class="ticket-ref">
            Ticket: <span>{{ $ticket->ticket_number }}</span> &bull; {{ $ticket->subject }}
        </div>

        <div class="reply-box">
            <div class="reply-label">{{ $isAdminReply ? 'Support Team' : $ticket->name }} wrote:</div>
            {{ $replyMessage }}
        </div>

        @if($isAdminReply)
            <a href="{{ url('/support/' . $ticket->id) }}" class="btn">View Full Conversation</a>
            <p style="color:#6b7280; font-size:13px;">You can reply back by visiting the link above.</p>
        @else
            <a href="{{ url('/admin/support/' . $ticket->id) }}" class="btn">View & Reply in Admin Panel</a>
        @endif
    </div>
    <div class="footer">
        <p>PublicationMart Support &bull; <a href="{{ url('/') }}" style="color:#a4485c;">publicationmart.com</a></p>
        <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
</div>
</body>
</html>
