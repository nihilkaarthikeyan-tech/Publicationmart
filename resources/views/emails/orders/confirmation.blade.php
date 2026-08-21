<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .content {
            padding: 30px;
        }

        .order-summary {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }

        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 10px;
        }

        .row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .total-row {
            font-weight: bold;
            font-size: 18px;
            color: #4f46e5;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 10px;
        }

        .address-box {
            margin-top: 25px;
            padding: 15px;
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            border-radius: 4px;
        }

        .footer {
            background: #1f2937;
            color: #9ca3af;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }

        .btn {
            display: inline-block;
            background: #4f46e5;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Order!</h1>
            <p>Hi {{ $buyerName }}, we have received your purchase.</p>
        </div>

        <div class="content">
            <p>Your order for <strong>{{ $transaction->book->title ?? 'Book' }}</strong> has been confirmed. We are
                cleaning the cover and preparing it for dispatch!</p>

            <div class="order-summary">
                <div class="row">
                    <span>Order ID</span>
                    <span style="font-family: monospace;">{{ $transaction->transaction_id }}</span>
                </div>
                <div class="row">
                    <span>Item</span>
                    <span>{{ $transaction->book->title ?? 'Book' }} (Hardcover)</span>
                </div>
                <div class="row">
                    <span>Date</span>
                    <span>{{ $transaction->created_at->format('d M Y') }}</span>
                </div>
                <div class="row total-row">
                    <span>Total Paid</span>
                    <span>₹{{ number_format($transaction->amount, 2) }}</span>
                </div>
            </div>

            <div class="address-box">
                <h3 style="margin: 0 0 10px 0; color: #166534;">🚚 Shipping Address</h3>
                <p style="margin: 0;">
                    {{ $shippingDetails['address'] ?? '' }}<br>
                    {{ $shippingDetails['city'] ?? '' }}, {{ $shippingDetails['state'] ?? '' }} -
                    {{ $shippingDetails['pincode'] ?? '' }}<br>
                    Phone: {{ $shippingDetails['phone'] ?? 'N/A' }}
                </p>
            </div>

            <div style="text-align: center;">
                <p>If you have any questions, reply to this email.</p>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} PublicationMart. All rights reserved.<br>
            Secure Payment via PhonePe
        </div>
    </div>
</body>

</html>