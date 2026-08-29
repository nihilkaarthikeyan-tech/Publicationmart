import { Head, Link } from '@inertiajs/react';

/**
 * The shell every policy page shares.
 *
 * These pages exist because the audit found the commerce terms were real but
 * buried inside Terms of Service, and the footer advertised a "Refund Policy"
 * that silently went to Terms. Each page restates one topic, in the same
 * words, at its own address — and links back to Terms so there is one
 * authoritative document rather than two that can drift apart.
 */

const SERIF = { fontFamily: "'EB Garamond', Georgia, serif" };

export const POLICY_CSS = `
.pm-pol h2{font-family:'EB Garamond',Georgia,serif;font-size:24px;line-height:1.25;color:#17150f;margin:38px 0 10px;font-weight:500}
.pm-pol h3{font-size:14px;letter-spacing:.02em;color:#6e2530;margin:22px 0 6px;font-weight:700}
.pm-pol p{font-size:16px;line-height:1.75;color:#4b443a;margin:0 0 14px;max-width:68ch}
.pm-pol ul{margin:0 0 16px;padding-left:22px;max-width:68ch}
.pm-pol li{font-size:16px;line-height:1.75;color:#4b443a;margin-bottom:9px}
.pm-pol li::marker{color:#a07d3b}
.pm-pol strong{color:#17150f;font-weight:600}
.pm-pol .rule{height:1px;background:#d8d1c1;margin:34px 0}
`;

export default function PolicyPage({
    title,
    metaTitle,
    metaDescription,
    standfirst,
    updated = '29 August 2026',
    children,
    related = [],
}) {
    return (
        <>
            <Head title={metaTitle || `${title} | PublicationMart`}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={`${title} | PublicationMart`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="website" />
            </Head>

            <style dangerouslySetInnerHTML={{ __html: POLICY_CSS }} />

            <div className="min-h-screen bg-parchment text-ink pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-6">

                    <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-umber mb-4">
                        PublicationMart · Policies
                    </p>

                    <h1 className="text-[clamp(2rem,5vw,2.9rem)] leading-[1.12] mb-5" style={SERIF}>
                        {title}
                    </h1>

                    {standfirst && (
                        <p className="text-[18px] leading-relaxed text-ink-soft max-w-[60ch] mb-6" style={SERIF}>
                            {standfirst}
                        </p>
                    )}

                    <p className="text-[13px] text-taupe">Last updated {updated}</p>

                    <div className="h-px bg-linen my-9" />

                    <div className="pm-pol">
                        {children}
                    </div>

                    <div className="h-px bg-linen mt-12 mb-8" />

                    <p className="text-[14px] leading-relaxed text-umber max-w-[62ch]">
                        This page restates part of our{' '}
                        <Link href={route('terms-and-conditions')} className="text-oxblood underline underline-offset-2">
                            Terms &amp; Conditions
                        </Link>
                        , which remain the full agreement between you and PublicationMart.
                        If anything here is unclear,{' '}
                        <Link href={route('contact')} className="text-oxblood underline underline-offset-2">
                            write to the desk
                        </Link>{' '}
                        and a person will answer.
                    </p>

                    {related.length > 0 && (
                        <div className="mt-10">
                            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-umber mb-4">
                                Related policies
                            </p>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                                {related.map((r) => (
                                    <li key={r.href}>
                                        <Link
                                            href={r.href}
                                            className="text-[15px] text-ink hover:text-oxblood underline underline-offset-4 decoration-linen hover:decoration-oxblood transition-colors"
                                            style={SERIF}
                                        >
                                            {r.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
