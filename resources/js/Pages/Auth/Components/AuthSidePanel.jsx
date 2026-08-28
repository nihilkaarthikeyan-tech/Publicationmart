import { useEffect, useState } from 'react';

/**
 * The right-hand boards of the auth pages — designed, not photographed.
 *
 * Two different sides of the same house: the login board is a finished,
 * cloth-bound book (the returning author's shelf); the register board is
 * a fresh manuscript page still being typed (the new author's first page).
 * Pure CSS; no stock imagery.
 */
const PANEL_CSS = `
.pm-authboard{background:linear-gradient(160deg,#77293527 0%,transparent 40%),linear-gradient(155deg,#6e2530 0%,#5a1e27 55%,#4d1a22 100%)}
.pm-authboard::before{content:"";position:absolute;inset:22px;border:1px solid rgba(160,125,59,.55);pointer-events:none}
.pm-authboard::after{content:"";position:absolute;inset:30px;border:1px solid rgba(160,125,59,.28);pointer-events:none}
.pm-authgrain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")}
.pm-authfoil{background:linear-gradient(100deg,#8a6a2f 0%,#a07d3b 38%,#e8cf8e 50%,#a07d3b 62%,#8a6a2f 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:pmAuthShimmer 5s ease-in-out infinite}
@keyframes pmAuthShimmer{0%,100%{background-position:0% 0}50%{background-position:100% 0}}
.pm-authspine{border-radius:2px 3px 3px 2px;box-shadow:0 10px 20px rgba(0,0,0,.35);position:relative}
.pm-authspine::after{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(90deg,rgba(0,0,0,.35),transparent)}
.pm-authspine .band{position:absolute;left:4px;right:4px;height:1px;background:rgba(232,207,142,.55)}
@media (prefers-reduced-motion:reduce){.pm-authfoil{animation:none}}

/* ── the manuscript page (register) ── */
.pm-mspage{background:
  repeating-linear-gradient(to bottom,transparent 0 35px,rgba(23,21,15,.055) 35px 36px),
  linear-gradient(90deg,transparent 0 88px,rgba(110,37,48,.32) 88px 89px,transparent 89px),
  linear-gradient(160deg,#faf8f3,#f0ece3)}
.pm-mscaret{display:inline-block;width:3px;height:.85em;background:#6e2530;vertical-align:-.06em;margin-left:5px;animation:pmMsBlink 1s steps(1) infinite}
@keyframes pmMsBlink{50%{opacity:0}}
.pm-msstamp{display:inline-block;font-size:11px;letter-spacing:.26em;text-transform:uppercase;font-weight:800;color:#6e2530;border:2px solid #6e2530;border-radius:4px;padding:6px 14px;transform:rotate(-7deg);opacity:.85}
@media (prefers-reduced-motion:reduce){.pm-mscaret{animation:none}}
`;

const TYPE_TITLES = ['Untitled Manuscript', 'My First Monograph', 'The Book I Always Meant to Write'];

const SPINES = [
    { h: 150, w: 30, bg: 'linear-gradient(155deg,#2f4f45,#20362d)', r: '-1.5deg' },
    { h: 172, w: 26, bg: 'linear-gradient(155deg,#2b3a56,#1c2739)', r: '0.5deg' },
    { h: 160, w: 34, bg: 'linear-gradient(155deg,#7a6224,#584618)', r: '-0.8deg' },
    { h: 178, w: 28, bg: 'linear-gradient(155deg,#8c3541,#5a1e27)', r: '1.2deg' },
    { h: 156, w: 24, bg: 'linear-gradient(155deg,#efe9db,#d8d1c1)', r: '-0.5deg' },
    { h: 168, w: 31, bg: 'linear-gradient(155deg,#2f4f45,#20362d)', r: '0.8deg' },
];

/**
 * Register's board: a manuscript page still being typed. Ruled paper with a
 * red margin, a working title set by a live caret, a DRAFT stamp, and the
 * five stages of the press waiting at the foot.
 */
export function ManuscriptSidePanel({ eyebrow, line, chips = [] }) {
    const [text, setText] = useState('');

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setText(TYPE_TITLES[0]);
            return;
        }
        let ti = 0, ci = 0, deleting = false, timer;
        const step = () => {
            const t = TYPE_TITLES[ti % TYPE_TITLES.length];
            let delay = deleting ? 40 : 105;
            if (!deleting && ci === t.length) { deleting = true; delay = 2600; }
            else if (deleting && ci === 0) { deleting = false; ti += 1; delay = 500; }
            else ci += deleting ? -1 : 1;
            setText(TYPE_TITLES[ti % TYPE_TITLES.length].slice(0, ci));
            timer = setTimeout(step, delay);
        };
        timer = setTimeout(step, 700);
        return () => clearTimeout(timer);
    }, []);

    const stages = [
        ['I', 'Write'], ['II', 'Format'], ['III', 'Design'], ['IV', 'Register'], ['V', 'Distribute'],
    ];

    return (
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden pm-mspage flex-col justify-between border-l border-linen">
            <style dangerouslySetInnerHTML={{ __html: PANEL_CSS }} />
            <div className="pm-authgrain" aria-hidden="true" />

            {/* The page being typed */}
            <div className="relative z-10 pl-[120px] pr-16 pt-24 max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[.26em] mb-3 text-oxblood">{eyebrow}</p>
                <p className="text-[12px] uppercase tracking-[.2em] font-semibold text-umber mb-10">Page 1 of many</p>

                <p className="text-[13px] uppercase tracking-[.18em] font-semibold text-umber mb-4">Working title</p>
                <h2
                    className="text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.15] text-ink min-h-[2.4em]"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    aria-label="Your working title, still being typed"
                >
                    {text}
                    <span className="pm-mscaret" aria-hidden="true" />
                </h2>

                <p className="mt-3 text-[19px] italic text-umber" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                    by you
                </p>

                <div className="mt-10"><span className="pm-msstamp">Draft · No. 1</span></div>

                <p className="mt-10 text-[15px] leading-relaxed text-ink-soft max-w-[44ch]">{line}</p>

                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-8">
                        {chips.map((chip) => (
                            <span
                                key={chip}
                                className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-[.2em] text-oxblood border border-oxblood/40 rounded-sm bg-paper"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* The press, waiting at the foot of the page */}
            <div className="relative z-10 pl-[120px] pr-16 pb-14">
                <div className="h-px bg-linen mb-6" />
                <ol className="flex flex-wrap gap-x-10 gap-y-3">
                    {stages.map(([n, t]) => (
                        <li key={n} className="flex items-baseline gap-2.5">
                            <span className="text-[17px] text-foil" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{n}</span>
                            <span className="text-[12px] uppercase tracking-[.16em] font-semibold text-umber">{t}</span>
                        </li>
                    ))}
                </ol>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.24em] text-taupe">
                    PublicationMart · Every stage handled by the house
                </p>
            </div>
        </div>
    );
}

export default function AuthSidePanel({ eyebrow, statement, emphasis, line, chips = [] }) {
    return (
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden pm-authboard flex-col justify-between">
            <style dangerouslySetInnerHTML={{ __html: PANEL_CSS }} />
            <div className="pm-authgrain" aria-hidden="true" />

            {/* The statement */}
            <div className="relative z-10 px-20 pt-28 max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[.26em] mb-8 pm-authfoil">{eyebrow}</p>
                <h2
                    className="text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.14] text-cream"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                    {statement}{' '}
                    <em className="pm-authfoil not-italic" style={{ fontStyle: 'italic' }}>{emphasis}</em>
                </h2>
                <p className="mt-7 text-[15px] leading-relaxed text-cream/65 max-w-[46ch]">{line}</p>

                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-10">
                        {chips.map((chip) => (
                            <span
                                key={chip}
                                className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-[.2em] text-foil-light border border-foil/50 rounded-sm"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* The shelf at the foot of the board */}
            <div className="relative z-10 px-20 pb-16">
                <span className="mb-3 inline-block text-[16px] text-foil" aria-hidden="true">❦</span>
                <div className="flex items-end gap-[7px]" aria-hidden="true">
                    {SPINES.map((s, i) => (
                        <div
                            key={i}
                            className="pm-authspine"
                            style={{ height: s.h, width: s.w, background: s.bg, transform: `rotate(${s.r})` }}
                        >
                            <span className="band" style={{ top: 18 }} />
                            <span className="band" style={{ bottom: 22 }} />
                        </div>
                    ))}
                </div>
                <div
                    className="h-[9px] rounded-[2px] mt-0"
                    style={{ background: 'linear-gradient(180deg,#3d151d,#2a0e12)', boxShadow: '0 8px 16px rgba(0,0,0,.35)' }}
                    aria-hidden="true"
                />
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.24em] text-cream/40">
                    PublicationMart · An independent publishing house
                </p>
            </div>
        </div>
    );
}
