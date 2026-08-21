@component('mail::message')
# Revision Requested for Your Book

Hello {{ $author_name }},

Thank you for submitting **{{ $title }}** for approval. Our team has reviewed your book and would like you to make some revisions before it can be published.

@component('mail::panel')
## Feedback from Admin
{{ $feedback }}
@endcomponent

## Next Steps
1. Log in to your PublicationMart dashboard
2. Go to your book "{{ $title }}"
3. Make the requested changes
4. Resubmit for approval

We appreciate your effort, and we're here to help make your book the best it can be!

@component('mail::button', ['url' => config('app.url') . '/dashboard'])
Go to Dashboard
@endcomponent

Best regards,  
**PublicationMart Team**

---

*If you have any questions, please contact us at {{ config('mail.from.address') }}*
@endcomponent
