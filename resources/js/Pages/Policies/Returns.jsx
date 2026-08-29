import PolicyPage from './Components/PolicyPage';

export default function Returns() {
    return (
        <PolicyPage
            title="Return & Exchange Policy"
            metaTitle="Return & Exchange Policy | PublicationMart"
            metaDescription="How to return or exchange a printed book bought from PublicationMart, including the return window and how refunds are credited."
            standfirst="If a book reaches you damaged, misprinted or wrong, we will put it right."
            related={[
                { name: 'Refund Policy', href: '/refund-policy' },
                { name: 'Shipping Policy', href: '/shipping-policy' },
                { name: 'Cancellation Policy', href: '/cancellation-policy' },
            ]}
        >
            <h2>The return window</h2>
            <p>
                If a return is required, it should be made within{' '}
                <strong>7 working days</strong>.
            </p>

            <h2>When a refund is approved</h2>
            <p>
                Where the company approves a refund it is credited to your{' '}
                <strong>original source account</strong>, and takes{' '}
                <strong>7 working days</strong> to arrive.
            </p>

            <h2>What we ask of you</h2>
            <ul>
                <li>Tell us within the return window, with your order reference.</li>
                <li>
                    Describe what is wrong. A photograph of a damaged or misprinted book
                    settles most cases immediately.
                </li>
                <li>Keep the book and its packaging until we have replied.</li>
            </ul>

            <h2>Digital editions</h2>
            <p>
                eBooks and audiobooks are delivered instantly and cannot be returned once
                downloaded. If a file is faulty or will not open, write to the desk and we
                will replace it.
            </p>

            <h2>Starting a return</h2>
            <p>
                Write to the desk with your order reference and what has gone wrong. A
                person reads every message, and we will tell you what happens next before
                you send anything back.
            </p>
        </PolicyPage>
    );
}
