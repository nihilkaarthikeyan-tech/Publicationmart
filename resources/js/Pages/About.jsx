import React from 'react';
import { Head } from '@inertiajs/react';
import Icon from '@/Components/Icon';

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };

/* The house's own edition history, set the way a book records its printings. */
const EDITION_CSS = `
.pm-editions{border-top:1px solid #d8d1c1}
.pm-edition{display:grid;grid-template-columns:150px minmax(0,1fr);gap:0 28px;padding:22px 4px;border-bottom:1px solid #d8d1c1;transition:background-color .3s}
.pm-edition>*{transition:transform .3s cubic-bezier(.16,1,.3,1)}
.pm-edition:hover{background:rgba(110,37,48,.045)}
.pm-edition:hover>*{transform:translateX(10px)}
.pm-edition-n{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:17px;color:#a07d3b}
.pm-edition-t{font-family:'EB Garamond',Georgia,serif;font-size:19px;line-height:1.4;color:#17150f}
.pm-edition-d{font-size:14px;line-height:1.6;color:#635c4e;margin-top:5px}
.pm-edition-fig{font-variant-numeric:tabular-nums;color:#6e2530;font-weight:600}
@media(max-width:640px){.pm-edition{grid-template-columns:1fr;gap:6px}.pm-edition:hover>*{transform:none}}
`;

export default function About({ houseStats = {} }) {
    const titles = houseStats.titlesInStore ?? 0;
    const authors = houseStats.totalAuthors ?? 0;

    // The house's printings, in the order they happened. Numbers come from
    // the register, so this section cannot drift out of date.
    const editions = [
        {
            n: 'First edition',
            t: 'The press opens',
            d: 'A publishing house built for authors who were told to wait their turn — no agent, no proposal, no commissioning editor.',
        },
        {
            n: 'Second edition',
            t: 'The workshop is fitted out',
            d: 'Formatting, cover design, ISBN registration and global distribution brought under one roof, so a manuscript never has to leave the house.',
        },
        {
            n: 'Third edition',
            t: 'The AI Studio joins the workshop',
            d: 'Outline, draft and illustrate with assistance — the author still holds the pen, and still holds the copyright.',
        },
        {
            n: 'This edition',
            t: 'The catalogue as it stands',
            d: (
                <>
                    <span className="pm-edition-fig">{titles.toLocaleString('en-IN')}</span> titles on the shelves,{' '}
                    <span className="pm-edition-fig">{authors.toLocaleString('en-IN')}</span> authors on the register — and the press still running.
                </>
            ),
        },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-parchment text-ink font-sans selection:bg-oxblood selection:text-paper pt-24 pb-20">
            <style dangerouslySetInnerHTML={{ __html: EDITION_CSS }} />
            <Head title="About PublicationMart – India's AI-Powered Self-Publishing Platform">
                <meta name="description" content="Learn about PublicationMart, India's leading self-publishing platform. We empower authors with AI-powered tools, professional editing, ISBN, printing, and global distribution services." />
                <meta property="og:title" content="About PublicationMart – India's Self-Publishing Platform" />
                <meta property="og:description" content="Revolutionizing the publishing industry by bridging traditional craftsmanship with modern AI technology. Publish your book globally with PublicationMart." />
                <meta property="og:url" content="https://publicationmart.com/about" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://publicationmart.com/images/logo_new.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="About PublicationMart" />
                <meta name="twitter:description" content="India's AI-powered self-publishing platform for authors. 100% ownership, global distribution, professional tools." />
            </Head>

            <div className="max-w-7xl mx-auto px-6">

                {/* Hero Section */}
                <div className="text-center py-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        We Are <span className=" text-oxblood">PublicationMart</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-umber max-w-3xl mx-auto leading-relaxed">
                        Revolutionizing the publishing industry by bridging the gap between traditional craftsmanship and modern AI technology.
                    </p>
                </div>

                {/* Creative Grid / Bento Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    {/* Mission */}
                    <div className="bg-paper border border-linen rounded-3xl p-10 relative overflow-hidden group hover:border-taupe transition-colors">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-umber text-lg leading-relaxed">
                                To empower every author, researcher, and storyteller with the tools they need to share their voice with the world. We believe that great ideas shouldn't get lost in the complexities of publishing. Whether you're a first-time novelist or a seasoned academic, we provide the platform to launch your work globally.
                            </p>
                        </div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all"></div>
                    </div>

                    {/* Vision */}
                    <div className="bg-paper border border-linen rounded-3xl p-10 relative overflow-hidden group hover:border-taupe transition-colors">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">The Future of Writing</h2>
                            <p className="text-umber text-lg leading-relaxed">
                                We are pioneering <span className="text-ink">AI-Assisted Publishing</span>. Our new AI Studio helps authors outline, draft, and format their books in record time, without losing their unique creative touch. We are building an ecosystem where technology serves creativity, not replaces it.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all"></div>
                    </div>
                </div>

                {/* Plate VIII — the house's own edition history */}
                <section className="mb-24" aria-labelledby="editions-heading">
                    <div className="flex items-baseline gap-6 mb-10">
                        <h2 id="editions-heading" className="text-3xl font-bold whitespace-nowrap">Editions of this house</h2>
                        <span className="flex-1 h-px bg-linen" />
                        <span className="text-[11px] font-semibold uppercase tracking-[.22em] text-taupe hidden sm:inline">
                            As a book records its printings
                        </span>
                    </div>

                    <div className="pm-editions">
                        {editions.map((e) => (
                            <article key={e.n} className="pm-edition">
                                <div className="pm-edition-n">{e.n}</div>
                                <div>
                                    <h3 className="pm-edition-t" style={SERIF}>{e.t}</h3>
                                    <p className="pm-edition-d">{e.d}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Team / Culture Section */}
                <div className="text-center mb-24">
                    <h2 className="text-3xl font-bold mb-12">Driven by Passion, Powered by Tech</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { title: 'Global Distribution', icon: 'globe', desc: 'Fifty countries, thousands of channels.' },
                            { title: 'Smart Formatting', icon: 'ruler', desc: 'Print-standard interiors from your draft.' },
                            { title: 'Expert Support', icon: 'support', desc: 'A person at the desk, not a queue.' },
                            { title: 'Royalties Transparency', icon: 'rupee', desc: 'Monthly statements, and you keep 100%.' },
                        ].map((item) => (
                            <div key={item.title} className="bg-paper border border-linen rounded-2xl p-6 text-left hover:-translate-y-1 transition-transform duration-300">
                                <Icon name={item.icon} size={26} className="text-oxblood mb-4" />
                                <h3 className="font-bold text-ink">{item.title}</h3>
                                <p className="text-[13px] text-umber mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-20 text-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your journey?</h2>
                        <p className="text-cream/80 mb-8 max-w-xl mx-auto">
                            Join thousands of authors who have trusted PublicationMart.
                        </p>
                        <a href="/register" className="inline-block bg-paper text-oxblood font-bold py-4 px-10 rounded-full hover:bg-cream transition-colors shadow-xl">
                            Start Publishing Now
                        </a>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-overlay blur-xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-overlay blur-xl"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
