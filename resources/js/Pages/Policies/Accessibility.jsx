import PolicyPage from './Components/PolicyPage';

/* Deliberately claims no conformance level. Everything listed under "What we
   have done" is verifiable in the code today; the target standard is a
   business commitment the house has not yet made, so this page states an
   intention and invites reports rather than asserting compliance. */
export default function Accessibility() {
    return (
        <PolicyPage
            title="Accessibility"
            metaTitle="Accessibility Statement | PublicationMart"
            metaDescription="How PublicationMart approaches accessibility, what the site already does, and how to tell us when something does not work for you."
            standfirst="A publishing house that is hard to read from would be a poor one. Here is where we actually stand."
            related={[{ name: 'Help Center', href: '/help-center' }]}
        >
            <h2>Where we stand</h2>
            <p>
                We are working toward the Web Content Accessibility Guidelines, and we are
                not going to claim a conformance level we have not independently tested.
                What follows is what the site does today, and what we know is still
                missing.
            </p>

            <h2>What the site already does</h2>
            <ul>
                <li>
                    <strong>Respects reduced motion.</strong> If your system asks for less
                    animation, the page-turns, the printing press on the front page and
                    every scroll effect stop moving.
                </li>
                <li>
                    <strong>Keyboard focus is visible.</strong> Links, buttons and form
                    fields show where you are as you tab through them.
                </li>
                <li>
                    <strong>Structured headings.</strong> Pages are marked up as real
                    headings and landmarks, so a screen reader can move through them by
                    structure rather than by guesswork.
                </li>
                <li>
                    <strong>Decorative things are hidden from assistive tech.</strong> The
                    ornaments, seals and marginal notes are marked as decoration, so they
                    are not read aloud.
                </li>
                <li>
                    <strong>Text over paper, not over pictures.</strong> The house palette
                    is ink on light stock, which keeps contrast high by design.
                </li>
            </ul>

            <h2>Where we know we fall short</h2>
            <p>
                Some of the older parts of the writing and design tools were built before
                we started paying proper attention, and they are harder to use by keyboard
                than the public pages. Books uploaded by authors — cover images and
                manuscript PDFs — are their authors&rsquo; work, and we cannot guarantee
                their accessibility.
            </p>

            <h2>Tell us when something does not work</h2>
            <p>
                This is the part that matters. If a page, a form or a tool is unusable for
                you, write to the desk and say what you were trying to do and what
                happened. Reports from readers are how this list gets shorter, and we
                treat them as bugs rather than suggestions.
            </p>
        </PolicyPage>
    );
}
