<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #a4485c, #6a222d); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
        .header p { color: #ecdcb4; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 30px; }
        .ticket-box { background: #f5f3ff; border: 1px solid #eed2d5; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .ticket-number { font-size: 20px; font-weight: bold; color: #a4485c; margin-bottom: 10px; }
        .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-top: 12px; }
        .value { font-size: 15px; color: #111827; margin-top: 3px; }
        .message-box { background: #f9fafb; border-left: 4px solid #a4485c; padding: 15px; margin: 15px 0; border-radius: 4px; color: #374151; line-height: 1.6; }
        .btn { display: inline-block; background: #a4485c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 20px 0; font-size: 14px; }
        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{ $isAdminCopy ? '🎫 New Support Ticket' : '✅ Ticket Received' }}</h1>
        <p>{{ $isAdminCopy ? 'A new support ticket has been submitted.' : 'We have received your support request.' }}</p>
    </div>
    <div class="body">
        @if(!$isAdminCopy)
            <p>Hi <strong>{{ $ticket->name }}</strong>,</p>
            <p>Thank you for reaching out! Your support ticket has been created. Our team will respond within 24–48 hours.</p>
        @else
            <p>A new support ticket has been submitted and requires attention.</p>
        @endif

        <div class="ticket-box">
            <div class="ticket-number">{{ $ticket->ticket_number }}</div>

            <div class="label">Subject</div>
            <div class="value">{{ $ticket->subject }}</div>

            <div class="label">Category</div>
            <div class="value">{{ $ticket->category_label }}</div>

            <div class="label">Priority</div>
            <div class="value">{{ ucfirst($ticket->priority) }}</div>

            @if($isAdminCopy)
            <div class="label">From</div>
            <div class="value">{{ $ticket->name }} ({{ $ticket->email }})</div>
            @endif

            <div class="label">Message</div>
            <div class="message-box">{{ $ticket->message }}</div>
        </div>

        @if($isAdminCopy)
            <a href="{{ url('/admin/support/' . $ticket->id) }}" class="btn">View & Reply in Admin Panel</a>
        @else
            <a href="{{ url('/support/' . $ticket->id) }}" class="btn">View Your Ticket</a>
            <p style="color:#6b7280; font-size:13px;">You can also reply to this ticket by visiting the link above.</p>
        @endif
    </div>
    <div class="footer">
        <p>PublicationMart Support &bull; <a href="{{ url('/') }}" style="color:#a4485c;">publicationmart.com</a></p>
        <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
</div>
</body>
</html>
