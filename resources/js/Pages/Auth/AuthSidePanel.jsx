/**
 * The right-hand board of the auth pages — designed, not photographed.
 *
 * A cloth-bound book board in the house oxblood: blind-tooled double gold
 * frame, a foil statement set in EB Garamond, and a small shelf of cloth
 * spines standing on a board at the foot. Pure CSS; no stock imagery.
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
`;

const SPINES = [
    { h: 150, w: 30, bg: 'linear-gradient(155deg,#2f4f45,#20362d)', r: '-1.5deg' },
    { h: 172, w: 26, bg: 'linear-gradient(155deg,#2b3a56,#1c2739)', r: '0.5deg' },
    { h: 160, w: 34, bg: 'linear-gradient(155deg,#7a6224,#584618)', r: '-0.8deg' },
    { h: 178, w: 28, bg: 'linear-gradient(155deg,#8c3541,#5a1e27)', r: '1.2deg' },
    { h: 156, w: 24, bg: 'linear-gradient(155deg,#efe9db,#d8d1c1)', r: '-0.5deg' },
    { h: 168, w: 31, bg: 'linear-gradient(155deg,#2f4f45,#20362d)', r: '0.8deg' },
];

export default function AuthSidePanel({ eyebrow, statement, emphasis, line, chips = [] }) {
    return (
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden pm-authboard flex-col justify-between">
            <style dangerouslySetInnerHTML={{ __html: PANEL_CSS }} />
            <div className="pm-authgrain" aria-hidden="true" />

            {/* The statement */}
            <div className="relative z-10 px-20 pt-28 max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[.26em] mb-8 pm-authfoil">{eyebrow}</p>
                <h2
                    className="text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.14] text-[#f2ecdd]"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                    {statement}{' '}
                    <em className="pm-authfoil not-italic" style={{ fontStyle: 'italic' }}>{emphasis}</em>
                </h2>
                <p className="mt-7 text-[15px] leading-relaxed text-[#f2ecdd]/65 max-w-[46ch]">{line}</p>

                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-10">
                        {chips.map((chip) => (
                            <span
                                key={chip}
                                className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-[.2em] text-[#e8cf8e] border border-[#a07d3b]/50 rounded-sm"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* The shelf at the foot of the board */}
            <div className="relative z-10 px-20 pb-16">
                <span className="mb-3 inline-block text-[16px] text-[#a07d3b]" aria-hidden="true">❦</span>
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
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.24em] text-[#f2ecdd]/40">
                    PublicationMart · An independent publishing house
                </p>
            </div>
        </div>
    );
}
