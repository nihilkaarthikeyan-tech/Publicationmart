import PolicyPage from './Components/PolicyPage';

/* Grounded in commitments the site already publishes: the Terms' Smart Writer
   clauses and the two FAQ answers on misuse and AI drafts. Nothing stronger is
   claimed here than the house has already said in public. */
export default function AcceptableUse() {
    return (
        <PolicyPage
            title="Acceptable Use Policy"
            metaTitle="Acceptable Use Policy | PublicationMart"
            metaDescription="What may and may not be written, generated or published using PublicationMart, and what happens when the rules are broken."
            standfirst="We publish almost anything. The short list below is what we will not."
            related={[
                { name: 'Community Guidelines', href: '/community-guidelines' },
                { name: 'Terms & Conditions', href: '/terms-and-conditions' },
            ]}
        >
            <h2>What we will not publish</h2>
            <p>
                PublicationMart reserves the right to suspend or terminate accounts that
                generate <strong>illegal, harmful, defamatory, or copyright-infringing
                content</strong>. In practice that means we will not carry work that:
            </p>
            <ul>
                <li>Breaks the law, or helps someone else break it.</li>
                <li>Copies another author&rsquo;s work without the right to do so.</li>
                <li>Defames a real person or organisation.</li>
                <li>Sets out to harass, threaten, or incite harm against people.</li>
            </ul>

            <h2>Your work is your responsibility</h2>
            <p>
                We are a press, not a censor. We do not read every manuscript for factual
                accuracy, and publishing a title is not an endorsement of its argument.
                The author remains responsible for what their book says.
            </p>

            <h2>Writing with the Smart Writer</h2>
            <p>
                AI-generated content is provided as a <strong>draft</strong>. Authors are
                fully responsible for reviewing, editing, verifying originality, and
                ensuring legal compliance before publication. A machine draft that goes
                out unread is still your book, under your name.
            </p>
            <p>
                The tools are here to help you write your book. Using them to mass-produce
                titles you have not read, or to reproduce someone else&rsquo;s work, is
                misuse.
            </p>

            <h2>If the rules are broken</h2>
            <p>
                Depending on what has happened we may remove the title from distribution,
                suspend the account, or terminate it. Where the breach is a genuine
                misunderstanding we would far rather talk to you first.
            </p>

            <h2>Reporting something</h2>
            <p>
                If you believe a title published here infringes your copyright or breaks
                these rules, write to the desk with the title and what is wrong. A person
                reads every report.
            </p>
        </PolicyPage>
    );
}
