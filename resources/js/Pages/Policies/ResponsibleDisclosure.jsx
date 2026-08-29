import PolicyPage from './Components/PolicyPage';

/* Deliberately makes no response-time promise and offers no bounty: neither has
   been agreed by the house. It commits only to things we can honour today —
   that a report reaches a person, and that good-faith research is welcome. */
export default function ResponsibleDisclosure() {
    return (
        <PolicyPage
            title="Responsible Disclosure"
            metaTitle="Responsible Disclosure | PublicationMart"
            metaDescription="How to report a security vulnerability in PublicationMart, what we ask of researchers, and what we promise in return."
            standfirst="If you have found a way to break this site, we would much rather hear it from you than read about it later."
            related={[
                { name: 'Security', href: '/security' },
                { name: 'Acceptable Use Policy', href: '/acceptable-use' },
            ]}
        >
            <h2>How to report</h2>
            <p>
                Write to the desk through our contact page with{' '}
                <strong>&ldquo;Security&rdquo; as the subject</strong>. Tell us what you
                found, where, and the steps to reproduce it. A short proof is worth more
                than a long description.
            </p>

            <h2>What we ask of you</h2>
            <ul>
                <li>Give us a reasonable chance to fix it before publishing anything.</li>
                <li>
                    Use only accounts and data that are yours. Do not read, change or
                    delete another author&rsquo;s manuscript to prove a point — tell us
                    that you could have.
                </li>
                <li>
                    Do not degrade the service for others: no denial of service, no
                    spamming forms, no automated scanning that takes the site down.
                </li>
                <li>Do not use social engineering against our staff or our authors.</li>
            </ul>

            <h2>What we promise</h2>
            <ul>
                <li>Your report reaches a person, not a queue nobody reads.</li>
                <li>We will tell you what we found and whether we are fixing it.</li>
                <li>
                    If you followed the rules above, we will treat your research as help
                    rather than an attack, and we will not pursue you for it.
                </li>
                <li>We will credit you when a fix ships, if you would like us to.</li>
            </ul>

            <h2>What we are not offering</h2>
            <p>
                We do not run a paid bounty programme, and we are not going to promise a
                response time we have not staffed for. We would rather under-promise here
                and answer you properly.
            </p>

            <h2>Out of scope</h2>
            <p>
                Findings that only affect out-of-date browsers, reports produced entirely
                by an automated scanner with no demonstrated impact, and issues in
                third-party services we merely link to.
            </p>
        </PolicyPage>
    );
}
