<!DOCTYPE html>
<html>

<head>
    <title>Your Smart Writer Access Link</title>
</head>

<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello {{ $session->full_name }},</h2>
        <p>Thank you for using PublicationMart Smart Writer.</p>
        <p>Here is the unique link to access and edit your book <strong>"{{ $session->title }}"</strong>:</p>

        <p style="margin: 30px 0;">
            <a href="{{ route('guest-writer.studio', $session->session_token) }}"
                style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access
                Book Studio</a>
        </p>

        <p>Or copy this URL:</p>
        <p><a
                href="{{ route('guest-writer.studio', $session->session_token) }}">{{ route('guest-writer.studio', $session->session_token) }}</a>
        </p>

        <p><strong>Note:</strong> This link is valid for 30 days. Please do not share it with anyone else.</p>

        <p>Happy writing!<br>The PublicationMart Team</p>
    </div>
</body>

</html>