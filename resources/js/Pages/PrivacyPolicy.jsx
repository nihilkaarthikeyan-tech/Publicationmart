import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#f0ece3] text-[#17150f] font-sans selection:bg-indigo-500/30">
            <Head title="Privacy Policy | PublicationMart">
                <meta name="description" content="Read PublicationMart's Privacy Policy. Learn how we collect, use, and protect your personal information on our self-publishing platform." />
            </Head>

            <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-10">Privacy Policy</h1>

                <div className="prose prose-invert prose-lg max-w-none text-[#635c4e]">
                    <p className="lead text-xl text-[#17150f]">Last updated: January 12, 2026</p>

                    <p>
                        At PublicationMart, accessible from https://publicationmart.com, one of our main priorities is the privacy of our visitors.
                        This Privacy Policy document contains types of information that is collected and recorded by PublicationMart and how we use it.
                    </p>

                    <h2 className="text-[#17150f] mt-10 mb-4 text-2xl font-bold">Log Files</h2>
                    <p>
                        PublicationMart follows a standard procedure of using log files. These files log visitors when they visit websites.
                        All hosting companies do this and a part of hosting services' analytics. The information collected by log files include
                        internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages,
                        and possibly the number of clicks. These are not linked to any information that is personally identifiable.
                    </p>

                    <h2 className="text-[#17150f] mt-10 mb-4 text-2xl font-bold">Privacy Policies</h2>
                    <p>
                        You may consult this list to find the Privacy Policy for each of the advertising partners of PublicationMart.
                    </p>
                    <p>
                        Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their
                        respective advertisements and links that appear on PublicationMart, which are sent directly to users' browser.
                        They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness
                        of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                    </p>

                    <h2 className="text-[#17150f] mt-10 mb-4 text-2xl font-bold">Third Party Privacy Policies</h2>
                    <p>
                        PublicationMart's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult
                        the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their
                        practices and instructions about how to opt-out of certain options.
                    </p>

                    <h2 className="text-[#17150f] mt-10 mb-4 text-2xl font-bold">Children's Information</h2>
                    <p>
                        Another part of our priority is adding protection for children while using the internet. We encourage parents and
                        guardians to observe, participate in, and/or monitor and guide their online activity.
                    </p>
                    <p>
                        PublicationMart does not knowingly collect any Personal Identifiable Information from children under the age of 13.
                        If you think that your child provided this kind of information on our website, we strongly encourage you to contact
                        us immediately and we will do our best efforts to promptly remove such information from our records.
                    </p>

                    <h2 className="text-[#17150f] mt-10 mb-4 text-2xl font-bold">Consent</h2>
                    <p>
                        By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
                    </p>
                </div>
            </div>

        </div>
    );
}

