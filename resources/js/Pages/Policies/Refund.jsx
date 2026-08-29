import PolicyPage from './Components/PolicyPage';

/* The refund clauses from Terms of Service, restated at their own address.
   Nothing here is invented: where the Terms are silent on an exact figure,
   this page stays silent too and sends the reader to the desk. */
export default function Refund() {
    return (
        <PolicyPage
            title="Refund Policy"
            metaTitle="Refund Policy | PublicationMart"
            metaDescription="When PublicationMart refunds a publishing order, what is returned at each stage, and how long the money takes to reach you."
            standfirst="What we refund depends on how far your book has travelled through the house. Once the press has run, it cannot be un-run."
            related={[
                { name: 'Cancellation Policy', href: '/cancellation-policy' },
                { name: 'Return & Exchange Policy', href: '/return-policy' },
                { name: 'Shipping Policy', href: '/shipping-policy' },
            ]}
        >
            <h2>Before any work has begun</h2>
            <p>
                If you cancel before any work — design or formatting — has started, you
                may be eligible for a <strong>full or partial refund</strong>.
            </p>

            <h2>Once work is in progress</h2>
            <p>
                Once work has started, for example a cover has been designed or an ISBN
                has been assigned, a <strong>setup fee or processing fee</strong> is
                typically deducted from any refund. This covers work already carried out
                on your title.
            </p>

            <h2>After publication</h2>
            <p>
                <strong>No refunds are issued</strong> once the book is live on
                distribution channels or has been sent for printing. At that point the
                title exists in the world and the cost of producing it has been spent.
            </p>

            <div className="rule" />

            <h2>How an approved refund is paid</h2>
            <p>
                Where a refund is approved by the company it is credited to your{' '}
                <strong>original source account</strong>, and takes{' '}
                <strong>7 working days</strong> to reach you.
            </p>

            <h2>Asking for a refund</h2>
            <p>
                Write to the desk with your order or transaction reference and tell us
                what has gone wrong. A person reads every request, and we will tell you
                which of the stages above applies to your order before anything is
                deducted.
            </p>
        </PolicyPage>
    );
}
