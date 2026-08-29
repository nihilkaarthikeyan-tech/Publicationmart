import PolicyPage from './Components/PolicyPage';

/* Describes the Studio submission flow as it actually works today: an author
   submits, an administrator approves or rejects, and approved posts appear
   publicly. No approval criteria are invented beyond the Acceptable Use rules
   the house already publishes. */
export default function CommunityGuidelines() {
    return (
        <PolicyPage
            title="Community Guidelines"
            metaTitle="Community Guidelines | PublicationMart"
            metaDescription="What we publish in the PublicationMart Studio, how submissions are reviewed, and what to do if yours is not accepted."
            standfirst="The Studio is where our authors write for each other. These are the house rules for that room."
            related={[
                { name: 'Acceptable Use Policy', href: '/acceptable-use' },
                { name: 'Terms & Conditions', href: '/terms-and-conditions' },
            ]}
        >
            <h2>What the Studio is for</h2>
            <p>
                Writing about writing and publishing: what you learned making your book,
                what you wish you had known, notes on craft, and news of your titles.
                Readers come to it for the experience of other authors.
            </p>

            <h2>How a post reaches the Studio</h2>
            <p>
                You write and submit a post. An editor at the house reads it, and either
                publishes it or sends it back. Nothing appears publicly until a person has
                read it — which is why the Studio stays worth reading, and why publishing
                is not instant.
            </p>

            <h2>What we ask for</h2>
            <ul>
                <li>Write it yourself, and say so if you used AI to draft it.</li>
                <li>Credit anything you quote, and only quote what you may.</li>
                <li>Disagree with ideas rather than attacking people.</li>
                <li>Promote your own book freely — that is the point — but write something worth reading around it.</li>
            </ul>

            <h2>What will not be published</h2>
            <p>
                The same limits as everywhere else on the platform: nothing illegal,
                defamatory, harassing, or copied from someone else. Those are set out in
                the Acceptable Use Policy and apply here in full.
            </p>
            <p>
                Beyond that, an editor may decline a post simply because it is not a fit
                for the Studio. That is an editorial judgement, not an accusation.
            </p>

            <h2>If your post is not accepted</h2>
            <p>
                Write to the desk and ask. We will tell you why, and in most cases what
                would make it publishable. A rejected post can be revised and submitted
                again.
            </p>
        </PolicyPage>
    );
}
