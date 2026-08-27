/**
 * Landing page content, lifted verbatim from the previous homepage so no
 * pricing, feature or FAQ wording is lost in the redesign.
 */

export const PRO_PLANS = [
                            {
                                name: 'Saver',
                                subtitle: 'For Self-Starters',
                                price: 2999,
                                popular: false,
                                features: ['Smart Writing Tool', 'A-Z Writing Assist', 'Auto Formatting', 'Global Distribution', 'Standard 6x9 Size']
                            },
                            {
                                name: 'Optimizer',
                                subtitle: 'Writer Advantage',
                                price: 3999,
                                popular: false,
                                features: ['Smart Writing Tool with Image Generator', 'A-Z Writing Assist', 'Auto Formatting', 'Global Distribution', 'Standard 6x9 Size']
                            },
                            {
                                name: 'Silver',
                                subtitle: 'Professional Publishing Starter',
                                price: 11999,
                                popular: true,
                                features: ['Expert Writing', 'ISBN Allocation', 'Cover Page Design', 'Interior Formatting (Basic)', 'Online Sales Board', 'Author Royalty 100%', 'Indian Online Distribution', 'Profit Payout  Monthly', 'Dedicated Publishing Manager', 'Guided Publishing']
                            },
                            {
                                name: 'Gold',
                                subtitle: 'Publishing + Starter Promotion',
                                price: 17999,
                                popular: false,
                                features: ['Everything in Silver Package', 'Hardcopies (B/W)  4 Nos', 'Social Media Posts & Banner (4 Nos)', 'Audio Publishing']
                            }
];

export const PREMIUM_PLANS = [
                            {
                                name: 'Diamond',
                                subtitle: 'Brand Visibility Package',
                                price: 39999,
                                popular: false,
                                features: ['Everything in Gold Package', 'Interior Formatting (Premium)', 'Hardcopies (B/W)  10 Nos', 'Social Media Posts & Banner (10 Nos)', 'Book Video Trailer', 'Author Website (Basic)  Free 1 Year', 'International Online Distribution', 'Amazon Sponsored Ads  2 Months', 'Blog Article on PM Website  1 No']
                            },
                            {
                                name: 'Platinum',
                                subtitle: 'Growth Acceleration Package',
                                price: 99999,
                                popular: false,
                                features: ['Everything in Diamond Package', 'Social Media Posts & Banner (25 Nos)', 'Amazon Sponsored Ads  4 Months', 'Blog Article on PM Website  2 Nos', '25 Books Giveaway Contest', 'Audio Song on Book', 'Author Interview', 'News Coverage 80+ Social Media Channels']
                            },
                            {
                                name: 'Prestige',
                                subtitle: 'Market Expansion Package',
                                price: 149999,
                                popular: true,
                                features: ['Everything in Platinum Package', 'Amazon Sponsored Ads  6 Months', 'News Coverage 100+ Channels + 1 News Channel', 'Book Fair Participation', 'Retail Distribution 15+ Stores', 'Book Influencer Marketing']
                            },
                            {
                                name: 'Signature',
                                subtitle: 'Elite Author Positioning',
                                price: 199999,
                                popular: false,
                                features: ['Everything in Prestige Package', 'Amazon Sponsored Ads  12 Months', 'News Coverage 100+ Channels + News Paper', 'Author Website (Premium)', 'Retail Distribution 40+ Stores', 'YouTube Ads Placement  1 Month', 'Blog Article on PM Website  4 Nos', 'Book Launching Ceremony']
                            }
];

export const FAQS = [
        {
            question: 'What is PublicationMart?',
            answer: 'PublicationMart is an AI-powered writing and publishing SAAS platform that helps authors create, format, and publish books in eBook and print formats. We provide tools, publishing support, and optional marketing services to simplify the self-publishing process.'
        },
        {
            question: 'Do I retain full ownership of my book?',
            answer: 'Yes. Authors retain 100% copyright ownership of their work. PublicationMart does not claim ownership of your manuscript or ideas.'
        },
        {
            question: 'Do I receive 100% royalty?',
            answer: 'Yes. Authors receive 100% of the royalty as per marketplace payout structures. PublicationMart does not take a percentage of your book sales unless otherwise stated in specific promotional agreements.'
        },
        {
            question: 'How does the Smart Writing Tool work?',
            answer: 'The Smart Writing Tool generates a structured outline within minutes based on your input. Once you approve the outline, it automatically generates a complete first draft. Authors must thoroughly review, edit, and fact-check the generated content before publishing.'
        },
        {
            question: 'Is AI-generated content safe to publish?',
            answer: 'AI-generated content is provided as a draft. Authors are fully responsible for reviewing, editing, verifying originality, and ensuring legal compliance before publication.'
        },
        {
            question: 'What formats can I publish in?',
            answer: (
                <div>
                    <p className="mb-2">You can publish your book in:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>eBook format</li>
                        <li>Paperback (Print-on-Demand)</li>
                    </ul>
                    <p className="mt-2">Availability may vary depending on your selected package.</p>
                </div>
            )
        },
        {
            question: 'What is Print-on-Demand?',
            answer: 'Print-on-Demand means your book is printed only when a customer places an order. This eliminates the need for bulk inventory and reduces upfront costs.'
        },
        {
            question: 'Do you guarantee book sales?',
            answer: 'No. We provide publishing infrastructure and optional marketing services, but book sales depend on factors such as content quality, audience demand, pricing, and marketing efforts.'
        },
        {
            question: 'How long does publishing take?',
            answer: 'Publishing timelines vary based on your package and manuscript readiness. On average, the process can take between 7\u201321 working days after final approval.'
        },
        {
            question: 'Do I need prior writing experience?',
            answer: 'No. Our Smart Writing Tool and guided publishing system are designed for both beginners and experienced authors.'
        },
        {
            question: 'Can I upload my own manuscript?',
            answer: 'Yes. You may upload your completed manuscript for formatting and publishing support.'
        },
        {
            question: 'What marketing support do you provide?',
            answer: (
                <div>
                    <p className="mb-2">Depending on your package, we offer services such as:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Social media creatives</li>
                        <li>Amazon Ads management</li>
                        <li>Author interviews</li>
                        <li>PR coverage</li>
                        <li>Website creation</li>
                        <li>Book trailers</li>
                    </ul>
                    <p className="mt-2 text-sm italic">Marketing services are optional and package-dependent.</p>
                </div>
            )
        },
        {
            question: 'Can I update my book after publishing?',
            answer: 'Yes. Revisions can be made. However, update processes and additional charges (if applicable) may depend on your selected package.'
        },
        {
            question: 'What happens if I misuse the Smart Writing Tool?',
            answer: 'PublicationMart reserves the right to suspend or terminate accounts that generate illegal, harmful, defamatory, or copyright-infringing content.'
        },
        {
            question: 'How do I get started?',
            answer: 'Simply choose a suitable package and begin writing using our Smart Writing Tool, or upload your manuscript to begin the publishing process.'
        }
    ];
