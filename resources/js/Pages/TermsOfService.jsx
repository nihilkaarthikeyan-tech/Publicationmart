import { Head } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0f0a1e] text-white font-sans selection:bg-indigo-500/30">
            <Head title="Terms and Conditions | PublicationMart">
                <meta name="description" content="Read PublicationMart's Terms and Conditions. Understand author rights, royalties, refund policies, distribution, and Smart Writing Tool usage terms." />
            </Head>

            <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-10">Terms and Conditions</h1>

                <div className="prose prose-invert prose-lg max-w-none text-gray-400">
                    <p className="lead text-xl text-white">Last updated: January 21, 2026</p>

                    {/* 1. Intellectual Property & Copyright */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">1. Intellectual Property & Copyright</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Ownership</h3>
                    <p>
                        The author retains 100% ownership and copyright of the manuscript. Publication Mart acts only as a
                        service provider and distributor.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Grant of Rights</h3>
                    <p>
                        By signing up, you grant Publication Mart a non-exclusive license to print, publish, and distribute
                        your book in the formats agreed upon (Paperback, Hardcover, eBook).
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Indemnity</h3>
                    <p>
                        The author is solely responsible for the content. You must guarantee that the work is original and
                        does not infringe on any third-party copyrights or contain defamatory material.
                    </p>

                    {/* 2. Royalties and Payments */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">2. Royalties and Payments</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Royalty Share</h3>
                    <p>
                        Authors typically receive 100% of the "Net Profit" (MRP minus production cost and distribution/retailer commissions).
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Payment Cycle</h3>
                    <p>
                        Royalties are usually calculated monthly and paid out once they reach a certain threshold (often ₹1,000)
                        or on a quarterly basis, depending on the specific agreement signed.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Pricing</h3>
                    <p>
                        The author usually has the right to set the MRP, but it must be above the minimum production cost
                        calculated by the publisher.
                    </p>

                    {/* 3. Services and Packages */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">3. Services and Packages</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Scope</h3>
                    <p>
                        Services (editing, formatting, cover design, ISBN) are provided based on the specific package purchased.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">ISBN</h3>
                    <p>
                        Publication Mart provides an ISBN under its own imprint unless the author provides their own.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Timeline</h3>
                    <p>
                        While we provide estimated timelines for publishing (usually 15–30 days), these are not strictly
                        guaranteed and depend on the author's speed in approving proofs.
                    </p>

                    {/* 4. Cancellation and Refunds */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">4. Cancellation and Refunds</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Pre-Work Refund</h3>
                    <p>
                        If you cancel before any work (design/formatting) has begun, you may be eligible for a full or partial refund.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">In-Progress Refund</h3>
                    <p>
                        Once work has started (e.g., a cover has been designed or the ISBN has been assigned), a "Setup Fee"
                        or "Processing Fee" is typically deducted from any refund.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Post-Publication</h3>
                    <p>
                        No refunds are issued once the book is live on distribution channels or sent for printing.
                    </p>

                    {/* 5. Distribution and Availability */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">5. Distribution and Availability</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Channels</h3>
                    <p>
                        We facilitate distribution through Amazon, Flipkart, and our own online store.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Availability</h3>
                    <p>
                        While we ensure the book is "listed," we do not guarantee constant stock on third-party sites like
                        Amazon/Flipkart, as those are subject to the marketplace's own availability algorithms.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Withdrawal</h3>
                    <p>
                        Authors can request to take their book down with written notice (usually 30 days).
                    </p>

                    {/* 6. Termination */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">6. Termination</h2>
                    <p>
                        Either the author or the publisher can terminate the agreement. Upon termination, Publication Mart
                        will stop printing new copies, though existing stock in the market may continue to be sold until depleted.
                    </p>

                    {/* 7. Governing Law */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">7. Governing Law</h2>
                    <p>
                        In the event of any legal dispute, claim, or controversy arising from our services, the courts in
                        Tamil Nadu, India shall have exclusive jurisdiction.
                    </p>

                    {/* 8. Shipping Policy */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">8. Shipping Policy</h2>
                    <p>
                        All physical books will be delivered within <strong className="text-white">7 working days</strong>.
                    </p>

                    {/* 9. Return and Refund Policy */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">9. Return and Refund Policy</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>If any return is required, it should be done within <strong className="text-white">7 working days</strong>.</li>
                        <li>If any refund is approved by the company, it will take <strong className="text-white">7 working days</strong> to credit to your original source account.</li>
                    </ul>

                    {/* 10. Smart Writing Tool Usage */}
                    <h2 className="text-white mt-10 mb-4 text-2xl font-bold">10. Smart Writing Tool Usage</h2>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Generated Content Disclaimer</h3>
                    <p>
                        The author is solely responsible for reviewing and editing all content generated through the Smart Writing Tool.
                        This includes fact-checking information, ensuring originality, avoiding plagiarism, verifying legal compliance
                        (including copyright, trademarks, and defamation laws), and ensuring the ethical and lawful use of the material.
                        PublicationMart shall not be liable for any claims, disputes, damages, or legal consequences arising from the use,
                        modification, or publication of AI-generated content.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Intellectual Property & Ownership</h3>
                    <p>
                        The author retains full ownership of the final edited manuscript created using the Smart Writing Tool.
                        PublicationMart does not claim ownership of the author’s original ideas, inputs, or completed manuscript.
                        The tool functions as a writing assistant, and all creative responsibility remains with the author.
                    </p>

                    <h3 className="text-indigo-400 mt-6 mb-2 text-lg font-semibold">Prohibited Use</h3>
                    <p>
                        The Smart Writing Tool may not be used to generate or publish illegal content, defamatory material, hate speech,
                        harmful or abusive content, copyright-infringing material, or any content that violates applicable laws or
                        marketplace guidelines. PublicationMart reserves the right to suspend or terminate accounts found to be misusing
                        the system or violating these terms.
                    </p>

                    {/* Contact Section */}
                    <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="text-white text-xl font-bold mb-4">Questions About Our Terms?</h3>
                        <p>
                            If you have any questions regarding these Terms and Conditions, please contact us at{' '}
                            <a href="mailto:support@publicationmart.com" className="text-indigo-400 hover:text-indigo-300 underline">
                                support@publicationmart.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}

