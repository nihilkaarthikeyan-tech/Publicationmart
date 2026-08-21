Order Confirmation
==================

Hi {{ $buyerName }},

Thank you for your order! We have received your purchase for:

Item: {{ $transaction->book->title ?? 'Book' }} (Hardcover)
Order ID: {{ $transaction->transaction_id }}
Date: {{ $transaction->created_at->format('d M Y') }}
Total Paid: ₹{{ number_format($transaction->amount, 2) }}

------------------
Shipping Address:
{{ $shippingDetails['address'] ?? '' }}
{{ $shippingDetails['city'] ?? '' }}, {{ $shippingDetails['state'] ?? '' }} - {{ $shippingDetails['pincode'] ?? '' }}
Phone: {{ $shippingDetails['phone'] ?? 'N/A' }}
------------------

We are preparing your order for dispatch. If you have any questions, please reply to this email.

Regards,
PublicationMart Team