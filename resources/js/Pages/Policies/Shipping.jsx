import PolicyPage from './Components/PolicyPage';

export default function Shipping() {
    return (
        <PolicyPage
            title="Shipping Policy"
            metaTitle="Shipping Policy | PublicationMart"
            metaDescription="How PublicationMart ships printed books and author copies, and how long delivery takes."
            standfirst="Printed books are made to order, then sent to the address you give us at checkout."
            related={[
                { name: 'Return & Exchange Policy', href: '/return-policy' },
                { name: 'Refund Policy', href: '/refund-policy' },
            ]}
        >
            <h2>Delivery time</h2>
            <p>
                All physical books are delivered within <strong>7 working days</strong>.
            </p>

            <h2>What we ship</h2>
            <ul>
                <li><strong>Store purchases</strong> — printed books bought from the book store.</li>
                <li><strong>Author copies</strong> — copies of your own title, ordered at author price.</li>
            </ul>
            <p>eBooks and audiobooks are delivered digitally and are not shipped.</p>

            <h2>Your delivery address</h2>
            <p>
                We ship to the address entered at checkout. Please check it before you
                pay — once a book has been dispatched we cannot redirect it, and a parcel
                returned to us because of an incorrect address is handled under the Return
                &amp; Exchange Policy.
            </p>

            <h2>If a book arrives damaged</h2>
            <p>
                Printed books occasionally suffer in transit. If yours arrives damaged or
                misprinted, tell us within the return window and we will put it right.
            </p>

            <h2>Tracking your order</h2>
            <p>
                Write to the desk with your order reference and we will tell you where
                your book is.
            </p>
        </PolicyPage>
    );
}
