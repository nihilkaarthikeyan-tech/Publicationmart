<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>New Contact Inquiry</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div
            style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #6366f1;">
            <h2 style="margin: 0; color: #111827;">New Contact Inquiry</h2>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> {{ $inquiry->name }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:{{ $inquiry->email }}"
                    style="color: #6366f1;">{{ $inquiry->email }}</a></p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ $inquiry->subject }}</p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4b5563;">Message:</h3>
            <div style="white-space: pre-wrap; color: #1f2937;">{{ $inquiry->message }}</div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.url') }}/admin/support"
                style="background-color: #8c3541; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View
                in Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from {{ config('app.name') }}
        </p>
    </div>
</body>

</html>