<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: #4f46e5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }

        .content {
            padding: 20px;
            border: 1px solid #ddd;
            background: #fff;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .details-table th,
        .details-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }

        .details-table th {
            background: #f8f9fa;
        }

        .shipping-box {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border: 1px solid #bbf7d0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>New Order Received!</h2>
        </div>

        <div class="content">
            <p>Hello Admin,</p>
            <p>A new order has been successfully placed on PublicationMart.</p>

            <h3>Order Details</h3>
            <table class="details-table">
                <tr>
                    <th>Order ID</th>
                    <td>{{ $transaction->transaction_id }}</td>
                </tr>
                <tr>
                    <th>Book Title</th>
                    <td>{{ $transaction->book->title ?? 'Unknown Book' }}</td>
                </tr>
                <tr>
                    <th>Amount Paid</th>
                    <td>₹{{ number_format($transaction->amount, 2) }}</td>
                </tr>
                <tr>
                    <th>Payment Method</th>
                    <td>{{ ucfirst($transaction->payment_method ?? 'Online') }}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>{{ $transaction->created_at->format('d M Y, h:i A') }}</td>
                </tr>
            </table>

            <div class="shipping-box">
                <h3 style="margin-top:0; color: #166534;">📦 Dispatch Details</h3>
                <p><strong>Name:</strong> {{ $shippingDetails['full_name'] ?? 'N/A' }}</p>
                <p><strong>Email:</strong> {{ $shippingDetails['email'] ?? 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ $shippingDetails['phone'] ?? 'N/A' }}</p>
                <p><strong>Address:</strong><br>
                    {{ $shippingDetails['address'] ?? '' }}<br>
                    {{ $shippingDetails['city'] ?? '' }}, {{ $shippingDetails['state'] ?? '' }} -
                    {{ $shippingDetails['pincode'] ?? '' }}
                </p>
            </div>

            <p>Please proceed with the dispatch.</p>
        </div>
    </div>
</body>

</html>