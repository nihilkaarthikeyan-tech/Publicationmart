import PolicyPage from './Components/PolicyPage';

export default function Cancellation() {
    return (
        <PolicyPage
            title="Cancellation Policy"
            metaTitle="Cancellation Policy | PublicationMart"
            metaDescription="How to cancel a publishing order or a book purchase with PublicationMart, and what happens at each stage of production."
            standfirst="You can stop a project at any point. What it costs depends on how much of it we have already made."
            related={[
                { name: 'Refund Policy', href: '/refund-policy' },
                { name: 'Return & Exchange Policy', href: '/return-policy' },
            ]}
        >
            <h2>Cancelling a publishing order</h2>
            <p>
                Publishing runs in stages, and a cancellation is judged against the stage
                your title has reached:
            </p>
            <ul>
                <li>
                    <strong>Before work begins</strong> — nothing has been designed,
                    formatted or registered. Cancel freely; a full or partial refund may
                    apply.
                </li>
                <li>
                    <strong>While work is in progress</strong> — a cover has been designed
                    or an ISBN assigned. You can still cancel, but a setup or processing
                    fee is typically deducted.
                </li>
                <li>
                    <strong>After publication</strong> — the book is live on distribution
                    channels or has gone to print. Production cannot be cancelled at this
                    point, and no refund is issued.
                </li>
            </ul>

            <h2>Withdrawing a published title</h2>
            <p>
                Cancelling a service is not the same as withdrawing a book. If your title
                is already published and you want it removed from distribution, that is
                handled under the withdrawal terms in our Terms &amp; Conditions — write
                to the desk and we will start it for you.
            </p>

            <h2>Cancelling a book purchase</h2>
            <p>
                For a book bought from the store, tell us as soon as possible. Once a
                physical order has been dispatched it is handled as a return rather than a
                cancellation.
            </p>

            <h2>How to cancel</h2>
            <p>
                Write to the desk with your order or transaction reference. We will
                confirm which stage your order has reached before anything is deducted, so
                you know the cost before you commit.
            </p>
        </PolicyPage>
    );
}
