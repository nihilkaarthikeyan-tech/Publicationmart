<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presale Verification Code</title>
</head>

<body
    style="background-color: #f9fafb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0;">

    <div
        style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

        <!-- Header -->
        <div style="background-color: #111827; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                PublicationMart</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px; text-align: center;">
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 16px; font-size: 22px;">Confirm Your Presale
                Booking</h2>

            <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">
                You are initiating a presale booking request
                @if($blogTitle)
                    for <strong>"{{ $blogTitle }}"</strong>.
                @else
                    on our platform.
                @endif
                Please use the verification code below to complete your booking.
            </p>

            <div
                style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 30px; display: inline-block;">
                <span
                    style="font-family: monospace; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 4px;">{{ $otp }}</span>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                If you did not request this code, please ignore this email.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ date('Y') }} PublicationMart. All rights reserved.
            </p>
        </div>
    </div>

</body>

</html>