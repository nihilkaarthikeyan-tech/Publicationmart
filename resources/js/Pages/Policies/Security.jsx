import PolicyPage from './Components/PolicyPage';

/* States only measures that are actually in place: HTTPS enforcement, hashed
   passwords, CSRF protection, rate limiting, server-side pricing and gated
   analytics. No certifications or audit claims are made, because none exist. */
export default function Security() {
    return (
        <PolicyPage
            title="Security"
            metaTitle="Security | PublicationMart"
            metaDescription="How PublicationMart protects author accounts, manuscripts and payments — and how to report a vulnerability."
            standfirst="Your manuscript is often the only copy. Here is how it is looked after."
            related={[
                { name: 'Responsible Disclosure', href: '/responsible-disclosure' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
            ]}
        >
            <h2>How your account is protected</h2>
            <ul>
                <li>
                    <strong>Passwords are hashed</strong>, never stored in a form anyone
                    here can read — including us.
                </li>
                <li>
                    <strong>The whole site runs over HTTPS</strong>, which is enforced
                    rather than merely offered.
                </li>
                <li>
                    <strong>Forms are protected against forgery</strong>, so another site
                    cannot act on your behalf while you are signed in.
                </li>
                <li>
                    <strong>Sensitive actions are rate limited</strong> — sign-in, coupon
                    checks, contact and enquiry forms — to blunt automated guessing.
                </li>
            </ul>

            <h2>Payments</h2>
            <p>
                Card and UPI details are entered with the payment gateway, not with us. We
                never see or store them. Prices are calculated on our server from the
                title&rsquo;s own record, so an order cannot be re-priced from the browser.
            </p>

            <h2>Your manuscript</h2>
            <p>
                Uploaded manuscripts and cover files are stored on our servers and reached
                only through your account or by staff carrying out the work you have asked
                for. We do not sell them, and we do not train anything on them.
            </p>

            <h2>What we do not claim</h2>
            <p>
                We hold no security certification, and we have not been independently
                audited. We would rather tell you that plainly than imply otherwise. If
                that matters for your institution, write to the desk and we will answer
                specific questions honestly.
            </p>

            <h2>Found a problem?</h2>
            <p>
                Please tell us before you tell anyone else — see the Responsible
                Disclosure page for how, and what we promise in return.
            </p>
        </PolicyPage>
    );
}
