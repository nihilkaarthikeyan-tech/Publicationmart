import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

/**
 * Cookie consent — the banner, and the preferences dialog behind it.
 *
 * The trackers themselves live in the blade shell (app.blade.php), which
 * exposes three globals: PM_CONSENT (config), pmReadConsent() and
 * pmApplyConsent(). This component only decides *what* the visitor chose and
 * writes it down; the shell decides how to act on it. That split matters —
 * analytics must be gated before React has even mounted, so the gate cannot
 * live in React.
 *
 * Mounted globally from app.jsx rather than from Layout, because full-screen
 * pages (auth, the studios) set layout = null and would otherwise never show
 * the banner.
 */

const CSS = `
.pm-cc-bar{position:fixed;left:0;right:0;bottom:0;z-index:120;background:#faf8f3;border-top:1px solid #d8d1c1;box-shadow:0 -8px 28px rgba(23,21,15,.10);padding:18px 20px}
.pm-cc-in{max-width:1100px;margin:0 auto;display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.pm-cc-copy{flex:1 1 340px;min-width:0}
.pm-cc-h{font-family:'EB Garamond',Georgia,serif;font-size:19px;line-height:1.3;color:#17150f;margin:0 0 5px}
.pm-cc-p{font-size:13.5px;line-height:1.6;color:#4b443a;margin:0;max-width:68ch}
.pm-cc-p a{color:#6e2530;text-decoration:underline;text-underline-offset:2px}
.pm-cc-acts{display:flex;gap:9px;flex-wrap:wrap;align-items:center;flex:0 0 auto}
.pm-cc-btn{font-family:inherit;font-size:13px;font-weight:700;padding:11px 20px;border-radius:3px;cursor:pointer;border:1px solid transparent;transition:background-color .2s,border-color .2s,color .2s;white-space:nowrap}
.pm-cc-primary{background:#6e2530;color:#faf8f3;border-color:#6e2530}
.pm-cc-primary:hover{background:#5a1e27;border-color:#5a1e27}
.pm-cc-ghost{background:transparent;color:#17150f;border-color:#d8d1c1}
.pm-cc-ghost:hover{border-color:#6e2530;color:#6e2530}
.pm-cc-link{background:none;border:0;padding:11px 4px;font-size:13px;font-weight:600;color:#635c4e;cursor:pointer;text-decoration:underline;text-underline-offset:3px;font-family:inherit}
.pm-cc-link:hover{color:#6e2530}
.pm-cc-btn:focus-visible,.pm-cc-link:focus-visible{outline:2px solid #17150f;outline-offset:2px}

.pm-cc-veil{position:fixed;inset:0;z-index:130;background:rgba(23,21,15,.45);display:flex;align-items:center;justify-content:center;padding:20px}
.pm-cc-panel{background:#faf8f3;border:1px solid #d8d1c1;border-radius:4px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 30px 70px rgba(23,21,15,.32)}
.pm-cc-pad{padding:26px 28px}
.pm-cc-title{font-family:'EB Garamond',Georgia,serif;font-size:25px;line-height:1.2;color:#17150f;margin:0 0 6px}
.pm-cc-lead{font-size:13.5px;line-height:1.6;color:#635c4e;margin:0 0 20px}
.pm-cc-row{display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-top:1px solid #d8d1c1}
.pm-cc-row-t{font-size:14.5px;font-weight:700;color:#17150f;margin:0 0 3px}
.pm-cc-row-d{font-size:13px;line-height:1.55;color:#635c4e;margin:0}
.pm-cc-row-x{font-size:11.5px;color:#7c7364;margin:5px 0 0;font-style:italic}
.pm-cc-sw{flex:0 0 auto;margin-top:2px}
.pm-cc-sw input{position:absolute;opacity:0;width:0;height:0}
.pm-cc-track{display:block;width:44px;height:25px;border-radius:999px;background:#d8d1c1;position:relative;cursor:pointer;transition:background-color .22s}
.pm-cc-track::after{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#faf8f3;transition:transform .22s;box-shadow:0 1px 3px rgba(23,21,15,.3)}
.pm-cc-sw input:checked+.pm-cc-track{background:#6e2530}
.pm-cc-sw input:checked+.pm-cc-track::after{transform:translateX(19px)}
.pm-cc-sw input:disabled+.pm-cc-track{background:#a49b8b;cursor:not-allowed;opacity:.75}
.pm-cc-sw input:focus-visible+.pm-cc-track{outline:2px solid #17150f;outline-offset:2px}
.pm-cc-foot{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;padding:18px 28px;border-top:1px solid #d8d1c1;background:#f0ece3}
.pm-cc-note{font-size:12px;color:#7c7364;margin:16px 0 0;line-height:1.55}
@media (max-width:640px){
  .pm-cc-acts{width:100%}
  .pm-cc-acts .pm-cc-btn{flex:1 1 auto;text-align:center}
  .pm-cc-foot{justify-content:stretch}
  .pm-cc-foot .pm-cc-btn{flex:1 1 auto;text-align:center}
}
@media (prefers-reduced-motion:reduce){.pm-cc-track,.pm-cc-track::after,.pm-cc-btn{transition:none}}
`;

const CATEGORIES = [
    {
        key: 'essential',
        title: 'Essential',
        desc: 'Keeps you signed in, remembers what is in your cart, and protects forms against forgery. The site cannot work without these.',
        detail: 'Session and security cookies set by PublicationMart.',
        locked: true,
    },
    {
        key: 'analytics',
        title: 'Analytics',
        desc: 'Tells us which pages people read and where they give up, so we can fix the parts that are not working.',
        detail: 'Google Analytics.',
    },
    {
        key: 'marketing',
        title: 'Marketing',
        desc: 'Measures whether our advertising reaches the right authors, and lets us show our books to people likely to want them.',
        detail: 'Meta (Facebook) Pixel.',
    },
];

export default function CookieConsent() {
    const [asked, setAsked] = useState(true);   // assume answered until we know
    const [open, setOpen] = useState(false);
    const [choice, setChoice] = useState({ analytics: false, marketing: false });
    const [saved, setSaved] = useState(false);
    const panelRef = useRef(null);
    const noticeOnly = typeof window !== 'undefined' && window.PM_CONSENT?.mode === 'notice';

    const write = useCallback((consent) => {
        const C = window.PM_CONSENT;
        const record = {
            ...consent,
            version: C?.version ?? 1,
            at: new Date().toISOString(),
        };
        try {
            window.localStorage.setItem(C.storageKey, JSON.stringify(record));
        } catch (e) {
            // Private browsing can refuse storage. The choice still applies to
            // this page view; we simply cannot remember it, so we ask again.
        }
        window.pmApplyConsent?.(record);
        setChoice({ analytics: !!consent.analytics, marketing: !!consent.marketing });
        setAsked(true);
        setOpen(false);
        setSaved(true);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.PM_CONSENT) return;
        const stored = window.pmReadConsent?.();
        if (stored) setChoice({ analytics: !!stored.analytics, marketing: !!stored.marketing });
        // In notice mode the trackers already ran; the bar informs rather than asks.
        setAsked(!!stored);

        // Footer (or anything else) can reopen the dialog at any time.
        window.pmOpenCookiePrefs = () => {
            const s = window.pmReadConsent?.();
            setChoice({ analytics: !!s?.analytics, marketing: !!s?.marketing });
            setSaved(false);
            setOpen(true);
        };
        return () => { delete window.pmOpenCookiePrefs; };
    }, []);

    // Escape closes the dialog, and focus starts inside it.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        panelRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const acceptAll = () => write({ analytics: true, marketing: true });
    const essentialOnly = () => write({ analytics: false, marketing: false });

    const showBar = !asked;

    if (!showBar && !open) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {showBar && (
                <div className="pm-cc-bar" role="region" aria-label="Cookie choices">
                    <div className="pm-cc-in">
                        <div className="pm-cc-copy">
                            <p className="pm-cc-h">Before you read on</p>
                            <p className="pm-cc-p">
                                {noticeOnly ? (
                                    <>
                                        We use cookies to keep the site working, to understand which pages
                                        are read, and to measure our advertising. You can change what you
                                        allow at any time.{' '}
                                    </>
                                ) : (
                                    <>
                                        Essential cookies keep you signed in and your cart intact. Beyond
                                        those, nothing runs until you say so — no analytics and no
                                        advertising measurement.{' '}
                                    </>
                                )}
                                <Link href="/privacy-policy">Read our privacy policy</Link>.
                            </p>
                        </div>
                        <div className="pm-cc-acts">
                            <button type="button" className="pm-cc-link" onClick={() => { setSaved(false); setOpen(true); }}>
                                Choose what to allow
                            </button>
                            <button type="button" className="pm-cc-btn pm-cc-ghost" onClick={essentialOnly}>
                                Essential only
                            </button>
                            <button type="button" className="pm-cc-btn pm-cc-primary" onClick={acceptAll}>
                                Accept all
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {open && (
                <div
                    className="pm-cc-veil"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                >
                    <div
                        className="pm-cc-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pm-cc-title"
                        tabIndex={-1}
                        ref={panelRef}
                    >
                        <div className="pm-cc-pad">
                            <h2 className="pm-cc-title" id="pm-cc-title">Cookie preferences</h2>
                            <p className="pm-cc-lead">
                                Turn each group on or off. Your choice is remembered on this device,
                                and you can come back to it whenever you like.
                            </p>

                            {CATEGORIES.map((c) => (
                                <div className="pm-cc-row" key={c.key}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="pm-cc-row-t">
                                            {c.title}
                                            {c.locked && (
                                                <span style={{ fontWeight: 600, color: '#7c7364', fontSize: 12 }}> · always on</span>
                                            )}
                                        </p>
                                        <p className="pm-cc-row-d">{c.desc}</p>
                                        <p className="pm-cc-row-x">{c.detail}</p>
                                    </div>
                                    <label className="pm-cc-sw">
                                        <input
                                            type="checkbox"
                                            checked={c.locked ? true : !!choice[c.key]}
                                            disabled={c.locked}
                                            aria-label={`${c.title} cookies`}
                                            onChange={(e) =>
                                                setChoice((p) => ({ ...p, [c.key]: e.target.checked }))
                                            }
                                        />
                                        <span className="pm-cc-track" />
                                    </label>
                                </div>
                            ))}

                            <p className="pm-cc-note">
                                Turning something off stops it from starting again. Anything already
                                running in this tab stops when you next load a page.
                            </p>
                        </div>

                        <div className="pm-cc-foot">
                            <button type="button" className="pm-cc-btn pm-cc-ghost" onClick={() => setOpen(false)}>
                                {saved ? 'Close' : 'Cancel'}
                            </button>
                            <button type="button" className="pm-cc-btn pm-cc-primary" onClick={() => write(choice)}>
                                Save my choices
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
