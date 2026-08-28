import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { PRO_PLANS, PREMIUM_PLANS, FAQS } from './Welcome.data.jsx';

/**
 * PublicationMart — landing page.
 *
 * Direction: an independent publishing house, not a SaaS dashboard. The page
 * is set like printed matter — EB Garamond (the typeface of scholarly books),
 * uncoated paper stock, printer's ink, oxblood binding cloth as the accent.
 * Sections are marked with running heads in letterspaced small caps, the way
 * a book marks its pages, rather than the monospace labels that signal "tech".
 *
 * The audience is real: most of the catalogue is academic and technical work
 * by university faculty, frequently with four or five co-authors.
 *
 * Functionality preserved from the previous page:
 *   • Guest Smart Writer — usable WITHOUT an account
 *     (guest-writer.pricing, or dashboard when signed in)
 *   • Both pricing suites, all 8 plans, original prices and features
 *     - Saver / Optimizer  -> guest-writer.pricing
 *     - Silver / Gold / all Premium -> publishing-inquiry.create?plan=<name>
 *   • The full 15-question FAQ
 *   • "India's Next Gen AI-Powered Book Writing & Publishing Platform"
 */

const CSS = `
:root{
  --stock:#f0ece3;      /* uncoated book paper */
  --stock-2:#e7e1d4;
  --stock-3:#faf8f3;    /* title page */
  --ink:#17150f;        /* printer's ink */
  --ink-2:#4b443a;
  --ink-3:#7c7364;
  --rule:#d8d1c1;
  --cloth:#6e2530;      /* library binding cloth */
  --foil:#a07d3b;       /* aged gold foil */
  --ease:cubic-bezier(.16,1,.3,1);
}
/* While this page is mounted the document ground is paper, so no dark
   background shows through overscroll at the top or bottom of the page. */
html:has(.pm){background:#f0ece3}
.pm{background:var(--stock);color:var(--ink);font-family:'Figtree',ui-sans-serif,system-ui,sans-serif}
.pm-serif{font-family:'EB Garamond',Georgia,'Times New Roman',serif}
.pm-run{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
.pm-rule{height:1px;background:var(--rule)}
.pm a:focus-visible,.pm button:focus-visible{outline:2px solid var(--cloth);outline-offset:3px;border-radius:2px}
.pm ::selection{background:var(--cloth);color:var(--stock-3)}

/* paper grain — the whole page reads as uncoated stock */
.pm-grain{position:fixed;inset:0;pointer-events:none;z-index:80;opacity:.05;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")}

@keyframes pmRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pm-rise{animation:pmRise .7s var(--ease) both}

/* hero badge — bordered pill with the tricolour ribbon and a live pulse */
.pm-badge{background:var(--stock);border:1px solid var(--rule);box-shadow:0 1px 0 rgba(23,21,15,.05),inset 0 0 0 3px var(--stock-3)}
@keyframes pmPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}
.pm-pulse{animation:pmPulse 2.2s ease-in-out infinite}

/* the compositor sets the punchline, letter by letter */
.pm-typeline{display:block;min-height:1.12em}
.pm-caret{display:inline-block;width:3px;height:.9em;background:var(--cloth);vertical-align:-.08em;margin-left:4px;animation:pmBlink 1s steps(1) infinite}
@keyframes pmBlink{50%{opacity:0}}

/* scroll reveals — sections rise; hairline rules draw themselves */
.rv{opacity:0;transform:translateY(16px);transition:opacity .6s var(--ease) var(--d,0s),transform .6s var(--ease) var(--d,0s)}
.rv.in{opacity:1;transform:none}
.rvx{transform:scaleX(0);transform-origin:left;transition:transform .9s var(--ease) .1s}
.rvx.in{transform:scaleX(1)}

/* bookshelf — spines settle onto the shelf; hover pulls one out */
/* position:absolute, not relative — this rule loads after Tailwind and would
   otherwise beat its absolute utility, dropping the spines into normal flow
   so they cascade down the page instead of stacking on the shelf. */
.pm-spine{position:absolute;border-radius:2px 4px 4px 2px;box-shadow:0 16px 34px rgba(23,21,15,.20),0 2px 6px rgba(23,21,15,.12);transform:rotate(var(--rot,0deg));transition:transform .35s var(--ease),box-shadow .35s var(--ease)}
.pm-spine::after{content:"";position:absolute;left:0;top:0;bottom:0;width:9px;background:linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,.04))}
@keyframes pmShelf{from{opacity:0;transform:translateY(-34px) rotate(var(--rot,0deg))}to{opacity:1;transform:rotate(var(--rot,0deg))}}
.pm-spine-in{animation:pmShelf .7s var(--ease) backwards}
.pm-spine:hover,.pm-spine:focus-visible{transform:translateY(-14px) rotate(0deg);box-shadow:0 26px 44px rgba(23,21,15,.28),0 4px 10px rgba(23,21,15,.14);z-index:40!important}

/* underline that draws itself */
.pm-uline{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-position:0 100%;background-size:0% 1px;transition:background-size .35s var(--ease)}
.pm-uline:hover,.pm-uline:focus-visible{background-size:100% 1px}

/* plan cards — dealt in order when the suite changes; lift to hand */
@keyframes pmPlanIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pm-plan{animation:pmPlanIn .5s var(--ease) backwards;transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
.pm-plan:hover{transform:translateY(-5px);box-shadow:0 20px 38px rgba(23,21,15,.12)}

/* the plan the house recommends gets the cloth binding */
.pm-plan-featured{background:var(--cloth);color:var(--stock-3)}
.pm-plan-featured .pm-run{color:var(--foil)}

/* FAQ opens like a page turning, not a pop */
.pm-faq-a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s var(--ease)}
.pm-faq-a[data-open="true"]{grid-template-rows:1fr}
.pm-faq-a>div{overflow:hidden}

/* retailer names glide past; the reader's cursor stops the press */
.pm-marquee{overflow:hidden}
.pm-marquee-track{display:flex;width:max-content;animation:pmSlide 32s linear infinite}
.pm-marquee:hover .pm-marquee-track{animation-play-state:paused}
@keyframes pmSlide{to{transform:translateX(-50%)}}

/* the Published stamp thumps in */
.pm-stamp{display:inline-block;font-size:9px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;color:var(--cloth);border:1.5px solid var(--cloth);border-radius:3px;padding:3px 8px;transform:rotate(-6deg);opacity:0}
@keyframes pmThump{0%{opacity:0;transform:scale(2.4) rotate(-18deg)}70%{opacity:1;transform:scale(.94) rotate(-4deg)}100%{opacity:.92;transform:scale(1) rotate(-6deg)}}
.pm-stamp.in{animation:pmThump .45s var(--ease) both}

/* genre tiles print in reverse on hover */
.pm-genre{background:var(--stock-3);transition:background .25s,transform .25s var(--ease)}
.pm-genre h4,.pm-genre .pm-run{transition:color .25s}
.pm-genre:hover{background:var(--ink);transform:translateY(-2px)}
.pm-genre:hover h4{color:var(--stock-3)}
.pm-genre:hover .pm-run{color:var(--foil)}

/* gold foil catches the light */
.pm-foil{background:linear-gradient(100deg,#8a6a2f 0%,#a07d3b 38%,#e8cf8e 50%,#a07d3b 62%,#8a6a2f 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:pmShimmer 4.5s ease-in-out infinite}
@keyframes pmShimmer{0%,100%{background-position:0% 0}50%{background-position:100% 0}}

/* pressing a control acknowledges the hand */
.pm-press:active{transform:translateY(1px)}

/* ── the great book — a cloth-bound volume that opens itself ── */
.pm-scene{perspective:1700px;display:flex;align-items:center;justify-content:center;height:100%}
.pm-book{position:relative;width:min(300px,80%);aspect-ratio:3/4;transform-style:preserve-3d;transform:rotateX(var(--tiltx,0deg)) rotateY(var(--tilty,0deg));transition:transform .25s ease-out}
.pm-book-block{position:absolute;inset:0;background:var(--stock-3);border:1px solid var(--rule);border-radius:2px 5px 5px 2px;box-shadow:0 30px 60px rgba(23,21,15,.28),0 4px 12px rgba(23,21,15,.14)}
.pm-book-block::after{content:"";position:absolute;top:4px;bottom:4px;right:-6px;width:6px;border-radius:0 3px 3px 0;background:repeating-linear-gradient(to bottom,#efe9db 0 2px,#ddd5c2 2px 3px)}
.pm-leaf{position:absolute;inset:0;padding:32px 26px;display:flex;flex-direction:column;transform-origin:left center;animation:pmLeaf .8s var(--ease)}
@keyframes pmLeaf{from{transform:rotateY(-75deg);opacity:.15}to{transform:none;opacity:1}}
.pm-cover{position:absolute;inset:0;transform-origin:left center;transform-style:preserve-3d;transition:transform 1.6s cubic-bezier(.72,0,.24,1);z-index:5;pointer-events:none}
.pm-book.open .pm-cover{transform:rotateY(-105deg)}
.pm-cover-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:2px 5px 5px 2px}
.pm-cover-front{background:linear-gradient(155deg,#6e2530 0%,#5a1e28 55%,#4d1a22 100%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),0 10px 30px rgba(23,21,15,.25)}
.pm-cover-front::before{content:"";position:absolute;inset:13px;border:1px solid rgba(160,125,59,.55);border-radius:1px}
.pm-cover-front::after{content:"";position:absolute;inset:18px;border:1px solid rgba(160,125,59,.3)}
.pm-cover-inside{transform:rotateY(180deg);background:var(--stock-2);box-shadow:inset 0 0 24px rgba(23,21,15,.12)}
.pm-hinge{position:absolute;left:0;top:0;bottom:0;width:10px;background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0));z-index:6;border-radius:2px 0 0 2px;pointer-events:none}

/* bookmark ribbon marks how far the reader has come */
.pm-ribbon{position:fixed;top:0;right:16px;width:7px;height:0;background:var(--cloth);z-index:70;pointer-events:none;box-shadow:0 1px 4px rgba(23,21,15,.3)}
.pm-ribbon::after{content:"";position:absolute;bottom:-7px;left:0;border-left:3.5px solid var(--cloth);border-right:3.5px solid var(--cloth);border-bottom:7px solid transparent}

/* ink sweeps across a CTA under the hand */
.pm-cta{position:relative;overflow:hidden}
.pm-cta::before{content:"";position:absolute;inset:0;background:var(--cloth);transform:translateX(-101%);transition:transform .35s var(--ease);z-index:0}
.pm-cta:hover::before,.pm-cta:focus-visible::before{transform:none}
.pm-cta>span{position:relative;z-index:1}
.pm-cta-ghost{transition:color .3s}
.pm-cta-ghost:hover,.pm-cta-ghost:focus-visible{color:var(--stock-3)!important}

/* a reading lamp follows the cursor across the plan cards */
.pm-plan{position:relative;overflow:hidden}
.pm-plan::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .35s;pointer-events:none;background:radial-gradient(300px circle at var(--mx,50%) var(--my,50%),rgba(160,125,59,.14),transparent 65%)}
.pm-plan:hover::after{opacity:1}

/* choose-button arrow slides in (transform only — no layout animation) */
.pm-arr{display:inline-block;margin-left:.45em;opacity:0;transform:translateX(-6px);transition:opacity .3s var(--ease),transform .3s var(--ease)}
.pm-plan a:hover .pm-arr,.pm-plan a:focus-visible .pm-arr{opacity:1;transform:none}

/* ── editorial structures: lists and indexes, not grids of cards ── */

/* the catalogue list — entries hang off rules and slide on hover.
   The row's contents translate; the row box itself never moves, so the
   rules stay put and nothing triggers layout. */
.pm-entry{transition:background-color .3s}
.pm-entry>div{transition:transform .3s var(--ease)}
.pm-entry:hover{background:rgba(110,37,48,.045)}
.pm-entry:hover>div{transform:translateX(10px)}
.pm-entry-t{transition:color .25s}
.pm-entry:hover .pm-entry-t{color:var(--cloth)}
.pm-entry-arr{opacity:0;transform:translateX(-8px);transition:opacity .3s var(--ease),transform .3s var(--ease)}
.pm-entry:hover .pm-entry-arr{opacity:1;transform:none}

/* the author index — flows in columns like back matter */
.pm-index{column-width:230px;column-gap:44px;column-rule:1px solid var(--rule)}
.pm-index-entry{break-inside:avoid;padding:0 0 18px;margin:0 0 18px;border-bottom:1px solid var(--rule)}

/* the press schedule — stages threaded on one continuous rule */
.pm-stages{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:34px 26px;position:relative;padding-top:26px}
.pm-stages::before{content:"";position:absolute;top:5px;left:0;right:0;height:1px;background:var(--rule)}
.pm-stage{position:relative}
.pm-stage-dot{position:absolute;top:-26px;left:0;width:9px;height:9px;border-radius:50%;background:var(--stock-3);border:1px solid var(--foil);transform:translateY(1px);transition:background .3s,transform .3s var(--ease)}
.pm-stage:hover .pm-stage-dot{background:var(--foil);transform:translateY(1px) scale(1.35)}

/* the contents page — title, dotted leader, description */
.pm-contents{border-top:1px solid var(--rule)}
.pm-contents-row{display:grid;grid-template-columns:34px minmax(140px,auto) 1fr minmax(0,44%);align-items:baseline;gap:0 14px;padding:22px 0;border-bottom:1px solid var(--rule);transition:background-color .3s}
.pm-contents-row>*{transition:transform .3s var(--ease)}
.pm-contents-link:hover,.pm-contents-link:focus-visible{background:rgba(110,37,48,.045)}
.pm-contents-link:hover>*,.pm-contents-link:focus-visible>*{transform:translateX(12px)}
.pm-contents-t{transition:color .25s}
.pm-contents-link:hover .pm-contents-t{color:var(--cloth)}
.pm-contents-leader{align-self:center;height:1px;background-image:linear-gradient(90deg,var(--rule) 45%,transparent 0);background-size:6px 1px;background-repeat:repeat-x;min-width:24px}
.pm-arr-c{display:inline-block;transition:transform .3s var(--ease)}
.pm-contents-link:hover .pm-arr-c{transform:translateX(5px)}
@media(max-width:760px){
  .pm-contents-row{grid-template-columns:30px 1fr;gap:4px 12px}
  .pm-contents-leader{display:none}
  .pm-contents-d{grid-column:2}
}

/* the subject index — type at scale, rules between */
.pm-subjects{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0;border-top:1px solid var(--rule)}
.pm-subject{padding:20px 6px 18px;border-bottom:1px solid var(--rule);display:flex;flex-direction:column;gap:7px;transition:background-color .3s}
.pm-subject>*{transition:transform .3s var(--ease),color .25s}
.pm-subject:hover{background:rgba(110,37,48,.05)}
.pm-subject:hover>*{transform:translateX(12px)}
.pm-subject-n{transition:color .25s}
.pm-subject:hover .pm-subject-n{color:var(--cloth)}
.pm-subject-d{transition:color .25s}
.pm-subject:hover .pm-subject-d{color:var(--foil)}

/* long academic titles stay inside the page */
.pm-clamp4{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.pm-clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

@media (prefers-reduced-motion:reduce){
  .pm-rise,.pm-pulse,.pm-caret,.pm-spine-in,.pm-plan,.pm-marquee-track,.pm-foil,.pm-stamp.in,.pm-leaf{animation:none}
  .rv,.rvx{opacity:1;transform:none;transition:none}
  .pm-stamp{opacity:.92}
  .pm-cover{transition:none}
  .pm *{transition-duration:.01ms!important}
}
`;

const CLOTHS = [
    'linear-gradient(155deg,#2f4f45,#20362d)',
    'linear-gradient(155deg,#6e2530,#4d1a22)',
    'linear-gradient(155deg,#2b3a56,#1c2739)',
    'linear-gradient(155deg,#7a6224,#584618)',
];

const RETAILERS = ['Amazon Kindle', 'Apple Books', 'Google Play', 'Barnes & Noble', 'Kobo', 'IngramSpark'];

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** One observer for every scroll-triggered element (.rv rise, .rvx rule draw, .pm-stamp thump). */
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.rv, .rvx, .pm-stamp');
        if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
            els.forEach((el) => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            }),
            { threshold: 0.12 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

/** Counts from 0 to value when scrolled into view. */
function CountUp({ value }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const target = Number(value) || 0;
        const done = () => { el.textContent = target.toLocaleString('en-IN'); };
        if (prefersReducedMotion() || !('IntersectionObserver' in window)) { done(); return; }
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            io.disconnect();
            const t0 = performance.now();
            const tick = (t) => {
                const p = Math.min((t - t0) / 1300, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.6 });
        io.observe(el);
        return () => io.disconnect();
    }, [value]);
    return <span ref={ref}>0</span>;
}

/**
 * The hero punchline, set by a compositor: typed letter by letter, then
 * recast as the other things a manuscript can become. Static under
 * reduced motion, and always announced to screen readers as one sentence.
 */
const TYPED_WORDS = ['a real book.', 'a paperback.', 'an eBook.', 'an audiobook.', 'a bestseller.'];

function TypedLine() {
    const [text, setText] = useState(TYPED_WORDS[0]);
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
        if (prefersReducedMotion()) return;
        setAnimating(true);
        let wi = 0, ci = TYPED_WORDS[0].length, deleting = false, timer;
        const step = () => {
            const w = TYPED_WORDS[wi % TYPED_WORDS.length];
            let delay = deleting ? 45 : 95;
            if (!deleting && ci === w.length) { deleting = true; delay = 2400; }
            else if (deleting && ci === 0) { deleting = false; wi += 1; delay = 420; }
            else ci += deleting ? -1 : 1;
            setText(TYPED_WORDS[wi % TYPED_WORDS.length].slice(0, ci));
            timer = setTimeout(step, delay);
        };
        timer = setTimeout(step, 2600);
        return () => clearTimeout(timer);
    }, []);
    return (
        <em className="pm-typeline" style={{ color: 'var(--cloth)' }}>
            {text}
            {animating && <span className="pm-caret" aria-hidden="true" />}
        </em>
    );
}

function Spine({ id, title, i }) {
    const style = {
        background: CLOTHS[i % CLOTHS.length],
        left: `${i * 60}px`,
        top: `${[26, 12, 30, 18][i % 4]}px`,
        '--rot': `${[-6, 2, 8, -3][i % 4]}deg`,
        zIndex: 10 - i,
        animationDelay: `${0.15 + i * 0.12}s`,
    };
    const inner = (
        <>
            <div className="pm-serif text-[#f2ecdd] text-[12px] leading-snug px-4 pt-7 pr-3">{title}</div>
            <div className="absolute bottom-5 left-4 right-3 pt-2" style={{ borderTop: '1px solid rgba(242,236,221,.28)' }}>
                <span className="pm-run" style={{ color: 'rgba(242,236,221,.6)', fontSize: 9 }}>PublicationMart</span>
            </div>
        </>
    );
    const cls = 'pm-spine pm-spine-in absolute block w-[150px] h-[226px] overflow-hidden';
    return id ? (
        <Link href={`/book-store/${id}`} className={cls} style={style} aria-label={`${title} — view in the book store`}>
            {inner}
        </Link>
    ) : (
        <div className={cls} style={style}>{inner}</div>
    );
}

/**
 * The Great Book — a large cloth-bound volume. Its cover swings open when the
 * reader scrolls to it, and real books from the catalogue turn inside it as
 * pages. The whole volume tilts gently toward the cursor.
 */
function GreatBook({ books }) {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const bookRef = useRef(null);

    useEffect(() => {
        const el = bookRef.current;
        if (!el) return;
        if (prefersReducedMotion() || !('IntersectionObserver' in window)) { setOpen(true); return; }
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTimeout(() => setOpen(true), 450); io.disconnect(); }
        }, { threshold: 0.45 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (!open || books.length < 2 || prefersReducedMotion()) return;
        const iv = setInterval(() => setPage((p) => (p + 1) % books.length), 4200);
        return () => clearInterval(iv);
    }, [open, books.length]);

    const tilt = (e) => {
        if (prefersReducedMotion()) return;
        const el = bookRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tiltx', `${((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2)}deg`);
        el.style.setProperty('--tilty', `${(((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2)}deg`);
    };
    const untilt = () => {
        const el = bookRef.current;
        if (el) { el.style.setProperty('--tiltx', '0deg'); el.style.setProperty('--tilty', '0deg'); }
    };

    const b = books[page % Math.max(books.length, 1)];
    return (
        <div className="pm-scene" onMouseMove={tilt} onMouseLeave={untilt}>
            <div ref={bookRef} className={`pm-book ${open ? 'open' : ''}`}>
                <div className="pm-book-block">
                    {b && (
                        <div key={b.id} className="pm-leaf">
                            <span className="pm-run" style={{ color: 'var(--cloth)' }}>Now on the press</span>
                            <h3 className="pm-serif text-[20px] leading-snug mt-4 mb-4 pm-clamp4">
                                <Link href={`/book-store/${b.id}`} className="pm-uline">{b.title}</Link>
                            </h3>
                            <div className="pm-rule mb-4" />
                            <p className="text-[12.5px] leading-relaxed pm-clamp3" style={{ color: 'var(--ink-3)' }}>{b.author_name}</p>
                            <div className="flex-1" />
                            <span className="pm-stamp in self-start">Published</span>
                            <span className="pm-run mt-5" style={{ color: 'var(--foil)', fontSize: 9 }}>PublicationMart Press</span>
                        </div>
                    )}
                </div>
                <div className="pm-cover" aria-hidden="true">
                    <div className="pm-cover-face pm-cover-front">
                        <div className="h-full flex flex-col items-center justify-center text-center px-8">
                            <span className="pm-run pm-foil">PublicationMart</span>
                            <span className="pm-serif text-[30px] mt-4" style={{ color: 'var(--foil)' }}>The Catalogue</span>
                            <span className="mt-3" style={{ color: 'rgba(160,125,59,.8)', fontSize: 18 }}>❦</span>
                        </div>
                    </div>
                    <div className="pm-cover-face pm-cover-inside" />
                </div>
                <div className="pm-hinge" aria-hidden="true" />
            </div>
        </div>
    );
}

function RunningHead({ label, folio }) {
    return (
        <div className="flex items-baseline gap-6 mb-8">
            <span className="pm-run whitespace-nowrap rv">{label}</span>
            <div className="pm-rule flex-1 rvx" />
            {folio && <span className="pm-run rv" style={{ color: 'var(--foil)', '--d': '250ms' }}>{folio}</span>}
        </div>
    );
}

/**
 * A chapter of the page, set the way a book sets a page: the running head and
 * folio live in the outer margin and stay beside the reader while the chapter
 * scrolls past — which is what a printed running head does. It also breaks the
 * page out of the stack-of-full-width-bands rhythm that every template has.
 */
function Chapter({ label, folio, id, ground, children, lead }) {
    return (
        <section id={id} style={ground}>
            <div className="max-w-[1180px] mx-auto px-6 py-24">
                <div className="grid md:grid-cols-[152px_minmax(0,1fr)] gap-x-16">
                    <div className="md:sticky md:top-28 self-start mb-10 md:mb-0">
                        <div className="pm-rule mb-4 rvx" />
                        <p className="pm-run rv">{label}</p>
                        {folio && (
                            <p className="pm-serif text-[24px] mt-2 rv" style={{ color: 'var(--foil)', '--d': '160ms' }}>
                                {folio}
                            </p>
                        )}
                    </div>
                    <div>
                        {lead && (
                            <h2 className="pm-serif text-[clamp(2rem,4.4vw,2.9rem)] leading-[1.12] max-w-[24ch] mb-14 rv">
                                {lead}
                            </h2>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

/** Plans that are a guided/managed service go to the enquiry form. */
const isManagedPlan = (name) =>
    ['silver', 'gold'].includes(String(name).toLowerCase());

function PlanCard({ plan, suite, guestHref, delay }) {
    const managed = suite === 'premium' || isManagedPlan(plan.name);
    const href = managed
        ? `${route('publishing-inquiry.create')}?plan=${String(plan.name).toLowerCase()}`
        : guestHref;

    return (
        <div
            className={`flex flex-col p-7 pm-plan ${plan.popular ? 'pm-plan-featured' : ''}`}
            style={{
                border: `1px solid ${plan.popular ? 'var(--cloth)' : 'var(--rule)'}`,
                background: plan.popular ? 'var(--cloth)' : 'var(--stock-3)',
                animationDelay: delay,
            }}
        >
            {plan.popular && (
                <span className="pm-run mb-4" style={{ color: 'var(--foil)' }}>
                    {suite === 'pro' ? 'Best Value' : 'Most Popular'}
                </span>
            )}

            <h3 className="pm-serif text-[26px] leading-none mb-1.5">{plan.name}</h3>
            <p className="text-[12.5px] mb-6" style={{ color: plan.popular ? 'rgba(240,236,227,.62)' : 'var(--ink-3)' }}>
                {plan.subtitle}
            </p>

            <p className="pm-serif text-[34px] leading-none mb-7">
                ₹{Number(plan.price).toLocaleString('en-IN')}
            </p>

            <div className="pm-rule mb-5" style={plan.popular ? { background: 'rgba(240,236,227,.18)' } : undefined} />

            <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                    <li
                        key={f}
                        className="text-[13.5px] leading-snug pl-4 relative"
                        style={{ color: plan.popular ? 'rgba(240,236,227,.85)' : 'var(--ink-2)' }}
                    >
                        <span className="absolute left-0 top-[7px] w-[5px] h-[5px] rounded-full"
                              style={{ background: plan.popular ? 'var(--foil)' : 'var(--cloth)' }} />
                        {f}
                    </li>
                ))}
            </ul>

            <Link
                href={href}
                className="pm-press block text-center text-[13.5px] font-semibold py-3 rounded-sm transition-opacity hover:opacity-85"
                style={
                    plan.popular
                        ? { background: 'var(--stock-3)', color: 'var(--cloth)' }
                        : { background: 'var(--cloth)', color: 'var(--stock-3)' }
                }
            >
                Choose {plan.name}<span className="pm-arr" aria-hidden="true">→</span>
            </Link>
        </div>
    );
}

export default function Welcome({ auth, featuredBooks = [], platformStats = { publishedBooks: 0, totalAuthors: 0 } }) {
    const [loaded, setLoaded] = useState(false);
    const [suite, setSuite] = useState('pro');
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => setLoaded(true), []);
    useReveal();

    // Bookmark ribbon: a cloth ribbon on the right edge grows as the reader
    // moves through the page, the way a bookmark marks progress in a book.
    useEffect(() => {
        const el = document.querySelector('.pm-ribbon');
        if (!el) return;
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                el.style.height = `${max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0}vh`;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
    }, []);

    // Reading lamp: a warm glow follows the cursor across the plan cards.
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const section = document.getElementById('pricing-section');
        if (!section) return;
        const move = (e) => {
            section.querySelectorAll('.pm-plan').forEach((card) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        };
        section.addEventListener('pointermove', move);
        return () => section.removeEventListener('pointermove', move);
    }, []);

    // The writing tool is open to visitors with no account — preserved exactly.
    const guestHref = auth?.user ? route('dashboard') : route('guest-writer.pricing');

    const spines = (featuredBooks || []).slice(0, 4);
    const shelf = (featuredBooks || []).slice(0, 6);
    const published = platformStats?.publishedBooks ?? 0;
    const authors = platformStats?.totalAuthors ?? 0;

    const plans = suite === 'pro' ? PRO_PLANS : PREMIUM_PLANS;

    const stages = [
        { n: 'I', t: 'Write', d: 'Draft in Smart Writer, or bring a manuscript you have already finished.' },
        { n: 'II', t: 'Format', d: 'Interior typesetting to print standards — margins, running heads, folios, contents.' },
        { n: 'III', t: 'Design', d: 'A cover built for the shelf and the thumbnail, because readers meet it as both.' },
        { n: 'IV', t: 'Register', d: 'Your ISBN is allocated and the title catalogued under your name as author.' },
        { n: 'V', t: 'Distribute', d: 'Listed with Amazon, Apple, Google and more than fifty stores worldwide.' },
    ];

    return (
        <div className="pm min-h-screen">
            <div className="pm-grain" aria-hidden="true" />
            <div className="pm-ribbon" aria-hidden="true" />
            <Head title="Self Publishing Platform for Authors in India – AI Book Writing & Publishing">
                {/* Primary Meta Tags */}
                <meta name="title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta name="description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta name="keywords" content="self-publishing, book publishing, publish book online, ebook publishing, print on demand, author platform, book distribution" />
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://publicationmart.com/" />
                <meta property="og:title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta property="og:description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta property="og:image" content="https://publicationmart.com/images/publicationmart-social-share.jpg" />
                <meta property="og:site_name" content="PublicationMart" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://publicationmart.com/" />
                <meta name="twitter:title" content="PublicationMart  Book Publishing & Author Services in India" />
                <meta name="twitter:description" content="PublicationMart helps authors publish books easily with professional editing, ISBN, printing, and distribution services across India." />
                <meta name="twitter:image" content="https://publicationmart.com/images/publicationmart-social-share.jpg" />
                {/* Structured Data for Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "PublicationMart",
                        "url": "https://publicationmart.com",
                        "logo": "https://publicationmart.com/images/logo_new.png",
                        "description": "Global self-publishing platform for independent authors",
                        "sameAs": [
                            "https://whatsapp.com/channel/0029VaDNAMO9MF983m4Y5s1y",
                            "https://www.facebook.com/people/RK-Publications/100094272053003/",
                            "https://www.instagram.com/publicationmart15?utm_source=qr&igsh=MWlubWJxN3hxMGxvdg==",
                            "https://www.youtube.com/@Rademics"
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "customer service",
                            "areaServed": "Worldwide"
                        }
                    })}
                </script>
            </Head>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* ── title page ───────────────────────────────── */}
            <section>
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.08fr_.92fr] gap-14 items-center">
                    <div className={loaded ? 'pm-rise' : 'opacity-0'}>
                        <div className="pm-badge inline-flex items-center gap-3 pl-4 pr-5 py-2.5 mb-8 rounded-full">
                            {/* tricolour bookmark ribbon */}
                            <span aria-hidden="true" className="flex flex-col w-[14px] h-[14px] rounded-[3px] overflow-hidden shrink-0"
                                  style={{ boxShadow: '0 0 0 1px rgba(23,21,15,.12)' }}>
                                <span style={{ background: '#FF9933', flex: 1 }} />
                                <span style={{ background: '#faf8f3', flex: 1 }} />
                                <span style={{ background: '#138808', flex: 1 }} />
                            </span>
                            <span className="pm-run" style={{ color: 'var(--cloth)', fontWeight: 800 }}>
                                India&rsquo;s Next Gen
                            </span>
                            <span aria-hidden="true" className="w-px self-stretch" style={{ background: 'var(--rule)' }} />
                            <span className="pm-run">AI-Powered Book Writing &amp; Publishing Platform</span>
                            <span aria-hidden="true" className="pm-pulse w-2 h-2 rounded-full shrink-0" style={{ background: '#138808' }} />
                        </div>

                        <h1
                            className="pm-serif font-medium leading-[1.04] tracking-tight text-[clamp(2.5rem,5.8vw,4rem)] mb-7"
                            aria-label="Your manuscript deserves to become a real book."
                        >
                            <span aria-hidden="true">
                                Your manuscript deserves to become <TypedLine />
                            </span>
                        </h1>

                        <p className="pm-serif text-[19px] leading-relaxed max-w-[47ch] mb-9" style={{ color: 'var(--ink-2)' }}>
                            Write with AI assistance, typeset to print standards, and publish
                            worldwide with your own ISBN. You keep the copyright, and 100% of
                            the royalty.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link href={guestHref} className="pm-press pm-cta text-[14px] font-semibold px-7 py-3.5 rounded-sm"
                                  style={{ background: 'var(--ink)', color: 'var(--stock-3)' }}>
                                <span>Start writing — no account needed</span>
                            </Link>
                            <Link href={route('book-store.index')} className="pm-press pm-cta pm-cta-ghost text-[14px] font-semibold px-7 py-3.5 rounded-sm"
                                  style={{ border: '1px solid var(--rule)', color: 'var(--ink)' }}>
                                <span>Browse the catalogue</span>
                            </Link>
                        </div>

                        <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
                            <p className="text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                                <strong style={{ color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}><CountUp value={published} /></strong> titles published
                                <span className="mx-3" style={{ color: 'var(--rule)' }}>·</span>
                                <strong style={{ color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}><CountUp value={authors} /></strong> authors joined
                                <span className="mx-3" style={{ color: 'var(--rule)' }}>·</span>
                                <strong style={{ color: 'var(--ink-2)' }}>100%</strong> author royalty
                                <span className="mx-3" style={{ color: 'var(--rule)' }}>·</span>
                                ISBN included
                            </p>
                            <p className="pm-run mt-4" style={{ fontSize: 10 }}>
                                Smart Writer&ensp;·&ensp;AI Image Generation&ensp;·&ensp;Smart Formatting&ensp;·&ensp;Global Publishing
                            </p>
                        </div>
                    </div>

                    <div className={`relative h-[290px] hidden md:block ${loaded ? 'pm-rise' : 'opacity-0'}`} style={{ animationDelay: '.12s' }}>
                        <div className="pm-stack absolute inset-0">
                            {(spines.length ? spines : [{ title: 'A book published with PublicationMart' }])
                                .map((b, i) => <Spine key={b.id ?? i} id={b.id} title={b.title} i={i} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── catalogue — the Great Book opens beside the list ── */}
            {shelf.length > 0 && (
                <Chapter label="From the catalogue" folio="I">
                    <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-16 items-start">
                        <div className="hidden lg:block h-[430px] rv">
                            <GreatBook books={shelf} />
                        </div>
                        <div>
                            {/* A publisher's list: titles hang off a rule, no boxes. */}
                            <ol>
                                {shelf.map((b, i) => (
                                    <li key={b.id} className="rv group" style={{ '--d': `${i * 60}ms`, borderTop: '1px solid var(--rule)' }}>
                                        <Link href={`/book-store/${b.id}`} className="block py-5 pm-entry">
                                            <div className="flex items-baseline gap-5">
                                                <span className="pm-serif text-[13px] w-7 shrink-0" style={{ color: 'var(--foil)' }}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="pm-serif text-[19px] leading-snug block pm-entry-t">{b.title}</span>
                                                    <span className="text-[13px] block mt-1" style={{ color: 'var(--ink-3)' }}>{b.author_name}</span>
                                                </span>
                                                <span className="pm-entry-arr pm-serif text-[17px] shrink-0" style={{ color: 'var(--cloth)' }} aria-hidden="true">→</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-10 rv" style={{ '--d': '300ms', borderTop: '1px solid var(--rule)', paddingTop: '1.5rem' }}>
                                <Link href={route('book-store.index')} className="pm-run pm-uline" style={{ color: 'var(--cloth)' }}>
                                    See every title →
                                </Link>
                            </div>
                        </div>
                    </div>
                </Chapter>
            )}

            {/* ── the authors — real people from the database ── */}
            {featuredBooks.length > 0 && (
                <Chapter
                    id="author-stories"
                    label="Our authors"
                    folio="II"
                    lead={<>Published this season.</>}
                >
                    {/* An author index, set in columns like the back matter of a
                        catalogue — names lead, titles follow in smaller type. */}
                    <div className="pm-index">
                        {featuredBooks.map((book, i) => (
                            <p key={book.id} className="pm-index-entry rv" style={{ '--d': `${Math.min(i * 45, 320)}ms` }}>
                                <span className="pm-serif text-[17.5px] leading-snug block">{book.author_name || 'Anonymous'}</span>
                                <span className="text-[13px] leading-snug block mt-0.5" style={{ color: 'var(--ink-3)' }}>{book.title}</span>
                            </p>
                        ))}
                    </div>
                    <p className="mt-12 text-[14px] rv" style={{ color: 'var(--ink-3)', '--d': '250ms' }}>
                        <span className="pm-stamp mr-3">Published</span>
                        and listed worldwide — every name above is a PublicationMart author.
                    </p>
                </Chapter>
            )}

            {/* ── how a book is made ───────────────────────── */}
            <Chapter
                label="How a book is made"
                folio="III"
                lead={<>Five stages, and we handle all of them.</>}
            >
                {/* Stages hang off a single continuous rule, like a press schedule. */}
                <ol className="pm-stages">
                    {stages.map((s, i) => (
                        <li key={s.n} className="rv pm-stage" style={{ '--d': `${i * 100}ms` }}>
                            <span className="pm-stage-dot" aria-hidden="true" />
                            <div className="pm-serif text-[24px] mb-2" style={{ color: 'var(--foil)' }}>{s.n}</div>
                            <h3 className="pm-serif text-[20px] mb-2">{s.t}</h3>
                            <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>{s.d}</p>
                        </li>
                    ))}
                </ol>
            </Chapter>

            {/* ── who we publish — the dark spread, mid-book ── */}
            <section style={{ background: 'var(--stock-2)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
                <div className="max-w-[1180px] mx-auto px-6 py-28">
                    <div className="grid md:grid-cols-[152px_minmax(0,1fr)] gap-x-16">
                        <div className="md:sticky md:top-28 self-start mb-10 md:mb-0">
                            <div className="pm-rule mb-4 rvx" />
                            <p className="pm-run rv">Who we publish</p>
                            <p className="pm-serif text-[24px] mt-2 rv" style={{ color: 'var(--foil)', '--d': '160ms' }}>IV</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-start">
                            <div className="rv">
                                <h2 className="pm-serif text-[clamp(2rem,4.4vw,3rem)] leading-[1.1] mb-7">
                                    Most of our authors <em style={{ color: 'var(--cloth)' }}>teach for a living.</em>
                                </h2>
                                <p className="pm-serif text-[18.5px] leading-relaxed mb-5" style={{ color: 'var(--ink-2)' }}>
                                    Textbooks, monographs and technical titles — often written by four
                                    or five colleagues at once. The process is built around that:
                                    multiple named authors, departmental affiliations, and
                                    citation-ready formatting.
                                </p>
                                <p className="pm-serif text-[18.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                                    No agent. No proposal. No waiting on a commissioning editor.
                                </p>
                                <ul className="space-y-5 mt-9">
                                    {[
                                        ['Global Coverage', 'Reach 50+ countries and thousands of retail channels.'],
                                        ['Full Control', 'You decide the price, the cover, and the distribution.'],
                                        ['Fast Results', 'Go from manuscript to store in as little as 24 hours.'],
                                    ].map(([t, d]) => (
                                        <li key={t} className="pl-5 relative">
                                            <span className="absolute left-0 top-[9px] w-[6px] h-[6px] rounded-full" style={{ background: 'var(--cloth)' }} />
                                            <h4 className="pm-serif text-[17px] leading-snug">{t}</h4>
                                            <p className="text-[13.5px]" style={{ color: 'var(--ink-3)' }}>{d}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* The terms, set as a colophon — hairlines, no boxes. */}
                            <dl className="rv" style={{ '--d': '150ms' }}>
                                {[
                                    ['Copyright', 'Stays entirely yours. We claim nothing.'],
                                    ['Royalty', 'You keep 100% as per marketplace payouts.'],
                                    ['Payouts', 'Transparent royalty reports, paid out monthly.'],
                                    ['ISBN', 'Allocated and registered to your title.'],
                                    ['Reach', 'Amazon, Apple, Google and 50+ stores.'],
                                    ['Formats', 'eBook, paperback, hardcover and audiobook.'],
                                ].map(([k, v]) => (
                                    <div key={k} className="grid grid-cols-[92px_minmax(0,1fr)] gap-6 py-4"
                                         style={{ borderTop: '1px solid var(--rule)' }}>
                                        <dt className="pm-run pt-1" style={{ color: 'var(--cloth)' }}>{k}</dt>
                                        <dd className="pm-serif text-[17px]" style={{ color: 'var(--ink-2)' }}>{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── the workshop — the tools, wired as before ── */}
            <Chapter
                id="tools-suite"
                label="The workshop"
                folio="V"
                lead={<>Every tool a book needs, under one roof.</>}
            >
                    <div className="pm-contents">
                        {[
                            {
                                title: 'Smart Writer',
                                desc: 'Distraction-free environment with intelligent suggestions to help you write faster and better.',
                                cta: 'Start Writing',
                                href: guestHref,
                            },
                            {
                                title: 'Instant Cover Design',
                                desc: 'Generate award-winning book covers in seconds. No design skills required.',
                                cta: 'Open the Studio',
                                href: route('login'),
                            },
                            {
                                title: 'Formatting Tool',
                                desc: 'Perfect layout for Kindle & Print. One-click export to PDF & EPUB.',
                                cta: 'Try Online',
                                href: route('login'),
                            },
                            {
                                title: 'Design Suite',
                                desc: 'Integrated design tools. Create stunning visuals without leaving.',
                                cta: 'Launch Canvas',
                                href: route('login'),
                            },
                            {
                                title: 'Real-Time Insights',
                                desc: 'Track your global sales, royalties, and reader engagement across all stores from a single, unified dashboard.',
                            },
                            {
                                title: 'Smart Formatting',
                                desc: 'Automatically convert your manuscript into eBook, Paperback, and Hardcover formats that meet global industry standards.',
                            },
                        ].map((tool, i) => {
                            /* A contents page: title on the left, description on the
                               right, joined by a dotted leader — the way a book lists
                               what is inside. Entries that lead somewhere are links. */
                            const body = (
                                <>
                                    <span className="pm-serif text-[13px] pm-contents-no" style={{ color: 'var(--foil)' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="pm-contents-t pm-serif text-[21px] leading-snug">{tool.title}</span>
                                    <span className="pm-contents-leader" aria-hidden="true" />
                                    <span className="pm-contents-d text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
                                        {tool.desc}
                                        {tool.href && (
                                            <span className="pm-run block mt-3" style={{ color: 'var(--cloth)' }}>
                                                {tool.cta}<span className="pm-arr-c" aria-hidden="true"> →</span>
                                            </span>
                                        )}
                                    </span>
                                </>
                            );
                            const style = { '--d': `${i * 70}ms` };
                            return tool.href ? (
                                <Link key={tool.title} href={tool.href} className="pm-contents-row pm-contents-link rv" style={style}>
                                    {body}
                                </Link>
                            ) : (
                                <div key={tool.title} className="pm-contents-row rv" style={style}>
                                    {body}
                                </div>
                            );
                        })}
                    </div>
            </Chapter>

            {/* ── plans ────────────────────────────────────── */}
            <Chapter
                id="pricing-section"
                label="Plans"
                folio="VI"
            >
                    <div className="flex flex-wrap items-end justify-between gap-6 mb-10 rv">
                        <h2 className="pm-serif text-[clamp(2rem,4.4vw,2.9rem)] leading-[1.12] max-w-[16ch]">
                            Publish it yourself, or let us do it.
                        </h2>

                        <div className="flex" style={{ border: '1px solid var(--rule)' }} role="tablist" aria-label="Plan suites">
                            {[
                                ['pro', 'Pro Suite'],
                                ['premium', 'Premium Suite'],
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    role="tab"
                                    aria-selected={suite === key}
                                    onClick={() => setSuite(key)}
                                    className="pm-press px-6 py-3 text-[12.5px] font-semibold transition-colors"
                                    style={
                                        suite === key
                                            ? { background: 'var(--ink)', color: 'var(--stock-3)' }
                                            : { background: 'transparent', color: 'var(--ink-3)' }
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {suite === 'premium' && (
                        <p className="pm-run mb-8" style={{ color: 'var(--cloth)' }}>
                            Full Publishing + Marketing &amp; Promotion Services
                        </p>
                    )}

                    <div key={suite} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.map((p, i) => (
                            <PlanCard key={p.name} plan={p} suite={suite} guestHref={guestHref} delay={`${i * 70}ms`} />
                        ))}
                    </div>

                    <p className="mt-9 text-[13.5px]" style={{ color: 'var(--ink-3)' }}>
                        Need something different?{' '}
                        <Link href={route('contact')} className="underline underline-offset-4" style={{ color: 'var(--cloth)' }}>
                            Tell us what you have in mind
                        </Link>
                        .
                    </p>
            </Chapter>

            {/* ── questions ────────────────────────────────── */}
            <Chapter id="faq" label="Questions" folio="VII" lead={<>Before you begin.</>}>
                <div className="max-w-[68ch]">
                    <div>
                        {FAQS.map((faq, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={faq.question} className="rv" style={{ borderTop: '1px solid var(--rule)', '--d': `${Math.min(i * 35, 350)}ms` }}>
                                    <button
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        aria-expanded={open}
                                        className="w-full text-left py-5 flex items-start gap-5"
                                    >
                                        <span className="pm-serif text-[18px] leading-snug flex-1">{faq.question}</span>
                                        <span
                                            className="pm-serif text-[20px] leading-none mt-0.5 shrink-0 transition-transform"
                                            style={{ color: 'var(--cloth)', transform: open ? 'rotate(45deg)' : 'none' }}
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    </button>
                                    <div className="pm-faq-a" data-open={open}>
                                        <div>
                                            <div className="pb-6 pr-10 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pm-rule" />
                    </div>
                </div>
            </Chapter>

            {/* ── where your book travels ──────────────────── */}
            <section>
                <div className="py-12 max-w-[1180px] mx-auto" style={{ borderTop: '1px solid var(--rule)' }}>
                    <p className="pm-run mb-8 text-center rv">Distribute your book globally</p>
                    <div className="pm-marquee" aria-label="Amazon Kindle, Apple Books, Google Play, Barnes and Noble, Kobo, IngramSpark">
                        <div className="pm-marquee-track">
                            {[0, 1].map((dup) => (
                                <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                                    {RETAILERS.map((r) => (
                                        <span key={r} className="pm-serif text-[22px] whitespace-nowrap px-8" style={{ color: 'var(--ink-2)' }}>
                                            {r}
                                            <span className="px-8" style={{ color: 'var(--rule)' }} aria-hidden="true">·</span>
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── every genre ──────────────────────────────── */}
            <Chapter
                id="genre-section"
                label="Every genre"
                folio="VIII"
                lead={<>From literary fiction to technical research.</>}
            >
                {/* A subject index — the list a publisher prints, not a grid of tiles. */}
                <ul className="pm-subjects">
                    {[
                        { name: 'Fiction', desc: 'Novels & Stories' },
                        { name: 'Research', desc: 'Academic Papers' },
                        { name: 'Business', desc: 'Growth & Strategy' },
                        { name: 'Fantasy', desc: 'World Building' },
                        { name: 'Self-Help', desc: 'Personal Growth' },
                        { name: 'Comics', desc: 'Graphic Novels' },
                        { name: 'Tech', desc: 'Guides & Manuals' },
                        { name: 'Poetry', desc: 'Verse & Rhyme' },
                    ].map((genre, i) => (
                        <li key={genre.name} className="pm-subject rv" style={{ '--d': `${(i % 4) * 55}ms` }}>
                            <span className="pm-serif text-[26px] leading-none pm-subject-n">{genre.name}</span>
                            <span className="pm-run pm-subject-d" style={{ fontSize: 10 }}>{genre.desc}</span>
                        </li>
                    ))}
                </ul>
            </Chapter>

            {/* ── closing ──────────────────────────────────── */}
            <section style={{ background: 'var(--stock-3)', borderTop: '1px solid var(--rule)' }}>
                <div className="max-w-6xl mx-auto px-6 py-24 text-center rv">
                    <p className="pm-run mb-7" style={{ color: 'var(--cloth)' }}>Begin</p>
                    <h2 className="pm-serif font-medium text-[clamp(2rem,5vw,3.2rem)] leading-tight max-w-[22ch] mx-auto mb-8">
                        The manuscript is the hard part. <em style={{ color: 'var(--cloth)' }}>You have already done it.</em>
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href={route('register')} className="pm-press inline-block text-[14px] font-semibold px-8 py-4 rounded-sm"
                              style={{ background: 'var(--cloth)', color: 'var(--stock-3)' }}>
                            Get Started for Free
                        </Link>
                        <Link href={guestHref} className="pm-press pm-cta pm-cta-ghost inline-block text-[14px] font-semibold px-8 py-4 rounded-sm"
                              style={{ border: '1px solid var(--rule)', color: 'var(--ink)' }}>
                            <span>Start writing — no account needed</span>
                        </Link>
                    </div>
                    <p className="mt-6 text-[13px]" style={{ color: 'var(--ink-3)' }}>
                        No credit card required · Publish in 24 hours · Keep 100% of your rights
                    </p>
                </div>
            </section>

        </div>
    );
}
