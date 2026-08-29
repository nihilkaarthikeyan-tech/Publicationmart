/**
 * The house icon set.
 *
 * Replaces the emoji that were being used as interface icons. Emoji were the
 * one element on the site we had no control over — Apple, Android and Windows
 * each draw their own, so a single glyph was a different picture on every
 * visitor's screen, in a palette that was never ours, and screen readers
 * announced them literally ("globe showing Europe-Africa") mid-sentence.
 *
 * Every icon here is drawn on the same 24 grid at the same stroke weight, in
 * `currentColor` — so it inherits oxblood on paper, foil on a dark panel, and
 * whatever a button's text colour happens to be, with no per-icon styling.
 *
 *   <Icon name="book" />                      default 20px, inherits colour
 *   <Icon name="globe" size={28} />
 *   <Icon name="download" className="text-oxblood" />
 *
 * Decorative by default: icons are hidden from assistive technology because
 * they sit beside a real text label. Pass `title` only when an icon stands
 * alone as the whole control, and it becomes an announced image instead.
 */

const P = {
    // ── books & documents ────────────────────────────────────────────────
    book: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v15H5.5A1.5 1.5 0 0 0 4 20.5z" /><path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19" /></>,
    bookOpen: <><path d="M12 6.5C10.6 5.5 8.9 5 7 5H3v13h4c1.9 0 3.6.5 5 1.5" /><path d="M12 6.5C13.4 5.5 15.1 5 17 5h4v13h-4c-1.9 0-3.6.5-5 1.5" /><path d="M12 6.5v13" /></>,
    library: <><path d="M4 20V6M8 20V6M12 20V8" /><path d="m15.5 7.5 3.6 1 2.4 9-3.6 1z" /><path d="M3 20h18" /></>,
    document: <><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" /><path d="M14 3v4h4M9 12h6M9 16h4" /></>,
    pages: <><path d="M8 2h7l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" /><path d="M15 2v5h4" /><path d="M5 6v14a1 1 0 0 0 1 1h9" /></>,
    manuscript: <><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 15.5h6M9 8.5h3" /></>,
    bookmark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />,
    newspaper: <><path d="M4 6h12v14H5a1 1 0 0 1-1-1z" /><path d="M16 9h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3" /><path d="M7 9.5h6M7 13h6M7 16h4" /></>,

    // ── writing & tools ──────────────────────────────────────────────────
    pen: <><path d="m15 4.5 4.5 4.5" /><path d="M17 2.5a2.1 2.1 0 0 1 3 3L8 17.5l-4.5 1.5L5 14.5z" /></>,
    penNib: <><path d="M11 4 20 13l-5.5 6.5a1.4 1.4 0 0 1-2 .1L4.4 11.5a1.4 1.4 0 0 1 .1-2z" /><path d="m12.5 12.5 6 6" /><circle cx="12" cy="12" r="1.3" /></>,
    palette: <><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-1 .8-1.7 1.8-1.7H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3z" /><circle cx="7.5" cy="11.5" r="1.1" /><circle cx="10.5" cy="7.5" r="1.1" /><circle cx="15" cy="8.5" r="1.1" /></>,
    wand: <><path d="m5 19 10-10" /><path d="M17.5 4.5 19 3M15 3l.6 1.8L17.4 5l-1.8.6L15 7.4l-.6-1.8L12.6 5l1.8-.6zM20 8l.4 1.2L21.6 9.6l-1.2.4L20 11.2l-.4-1.2L18.4 9.6l1.2-.4z" /></>,
    tools: <><path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6L21 13l-8 8-2-2 8-8-1.9-1.9a3.5 3.5 0 0 0-4.6-4.6z" /><path d="m8 8-4.5 4.5a2.1 2.1 0 0 0 3 3L11 11" /></>,
    ruler: <><rect x="2.5" y="8.5" width="19" height="7" rx="1" transform="rotate(-8 12 12)" /><path d="M7 9.5v2.2M10.5 9v2.2M14 8.5v2.2M17.5 8v2.2" /></>,
    printer: <><path d="M7 9V4h10v5" /><path d="M5 9h14a2 2 0 0 1 2 2v5h-4v4H7v-4H3v-5a2 2 0 0 1 2-2z" /><path d="M7 15h10" /></>,
    image: <><rect x="3" y="4.5" width="18" height="15" rx="1.5" /><circle cx="8.5" cy="9.5" r="1.4" /><path d="m3.5 17 5-5 4.5 4.5 3-3 4.5 4.5" /></>,
    microscope: <><path d="M9 4h3l1 6h-5z" /><path d="M11 10a6 6 0 0 1 4 10" /><path d="M6 20h13M8 20a5 5 0 0 1 3-8" /></>,
    feather: <><path d="M20 4c-6 0-11 3-11 9v4l-4 4" /><path d="M9 17h6a5 5 0 0 0 5-5V4" /><path d="M13 11h4M11 15h4" /></>,

    // ── commerce & value ─────────────────────────────────────────────────
    rupee: <><path d="M7 4h10M7 8.5h10" /><path d="M7 4c4.5 0 7 1.5 7 4.5S11.5 13 7 13l8 7" /></>,
    gem: <><path d="m6 3h12l3 5-9 13L3 8z" /><path d="M3 8h18M9.5 3 7 8l5 13 5-13-2.5-5" /></>,
    tag: <><path d="M3 12.5V4.5a1.5 1.5 0 0 1 1.5-1.5h8l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z" /><circle cx="7.5" cy="7.5" r="1.3" /></>,
    ticket: <><path d="M4 8.5V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 7V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-7z" /><path d="M13 5v14" /></>,
    gift: <><rect x="3.5" y="9" width="17" height="11" rx="1" /><path d="M2.5 9h19v3.5h-19zM12 9v11" /><path d="M12 9C10 9 7.5 8.4 7.5 6.4A2 2 0 0 1 12 6a2 2 0 0 1 4.5.4C16.5 8.4 14 9 12 9z" /></>,
    briefcase: <><rect x="3" y="7.5" width="18" height="12" rx="1.5" /><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" /><path d="M3 12.5h18" /></>,
    store: <><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" /><path d="M3 6.5 4.5 3.5h15L21 6.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M9.5 20v-5h5v5" /></>,
    truck: <><path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
    chart: <><path d="M4 20V4M4 20h16" /><path d="m7.5 15 3.5-4 3 2.5 5-6.5" /></>,

    // ── people & communication ───────────────────────────────────────────
    handshake: <><path d="m8.5 12.5 2.5 2.5 2-2 2.5 2.5" /><path d="M3 8.5 6.5 6l3 1.5h5L18 6l3 2.5v6l-2.5 2-3.5-3.5" /><path d="M3 8.5v6l2.5 2 3-3" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" /><path d="M16.5 5.5a3 3 0 0 1 0 5.6M17 14.2a4.5 4.5 0 0 1 4 4.5V20" /></>,
    phone: <path d="M6 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C10.4 18.4 5.6 13.6 4.5 5.1A1.5 1.5 0 0 1 6 3.5z" />,
    mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M10.5 5.5h3M12 18.2h.01" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>,
    support: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.7a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.1-2.5 3.6" /><path d="M12 17.5h.01" /></>,

    // ── status & feedback ────────────────────────────────────────────────
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12.2 2.8 2.8L16 9.5" /></>,
    cross: <path d="M6 6l12 12M18 6 6 18" />,
    crossCircle: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
    alert: <><path d="M12 4.5 21 19.5H3z" /><path d="M12 10v4M12 17h.01" /></>,
    lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
    key: <><circle cx="8" cy="14" r="4" /><path d="m10.8 11.2 8.2-8.2M16.5 5.5 19 8M14 8l2 2" /></>,
    shield: <><path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
    trophy: <><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z" /><path d="M7.5 5.5H5a2.5 2.5 0 0 0 2.5 4M16.5 5.5H19a2.5 2.5 0 0 1-2.5 4" /><path d="M12 14v3M8.5 20h7l-.7-3h-5.6z" /></>,
    star: <path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8z" />,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /><path d="m18.5 15 .6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6zM5.5 3.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L3.5 5.5l1.5-.5z" /></>,
    target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
    inbox: <><path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" /><path d="M5.5 4.5h13l2.5 9v5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-5z" /></>,

    // ── actions & navigation ─────────────────────────────────────────────
    upload: <><path d="M12 16V4M8 7.5 12 3.5l4 4" /><path d="M4 15v4a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-4" /></>,
    download: <><path d="M12 3.5v12M8 12l4 4 4-4" /><path d="M4 15v4a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-4" /></>,
    attachment: <path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8L9.6 17.4a1.8 1.8 0 0 1-2.5-2.5l7.8-7.8" />,
    clipboard: <><rect x="6" y="4.5" width="12" height="16" rx="1.5" /><path d="M9.5 4.5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z" /><path d="M9 11h6M9 15h4" /></>,
    calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3.5v4M16 3.5v4" /></>,
    rocket: <><path d="M12 2.5c3.5 2.5 5 6 5 9.5l-2.5 3h-5L7 12c0-3.5 1.5-7 5-9.5z" /><circle cx="12" cy="9.5" r="1.8" /><path d="M9.5 15 8 20l3-2 3 2-1.5-5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>,
    building: <><path d="M4 20V4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1V20" /><path d="M15 9h4a1 1 0 0 1 1 1v10M3 20h18" /><path d="M7.5 7.5h1M11 7.5h1M7.5 11h1M11 11h1M7.5 14.5h1M11 14.5h1" /></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h2.5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM20 14h-2.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1z" /></>,
    robot: <><rect x="4" y="7.5" width="16" height="12" rx="2" /><path d="M12 4.5v3M9 12.5h.01M15 12.5h.01M9.5 16h5" /><path d="M2.5 12v3M21.5 12v3" /></>,
    academic: <><path d="m12 4.5 9 4-9 4-9-4z" /><path d="M6.5 10v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5" /><path d="M21 8.5v5" /></>,
    package: <><path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z" /><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" /></>,
    scroll: <><path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M5 6a2 2 0 0 1 4 0v2H5z" /><path d="M9.5 10h6M9.5 13.5h6M9.5 17h3" /></>,
    colour: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" opacity=".18" /><path d="M12 3v18" /></>,
    zap: <path d="M13.5 2.5 5 13.5h6l-.5 8L19 10.5h-6z" />,
    pointLeft: <><path d="M20 12H6" /><path d="m11 7-5 5 5 5" /></>,
};

export default function Icon({ name, size = 20, className = '', title, strokeWidth = 1.5, ...rest }) {
    const path = P[name];
    if (!path) {
        if (import.meta.env?.DEV) console.warn(`Icon: no icon named "${name}"`);
        return null;
    }
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline-block shrink-0 ${className}`}
            role={title ? 'img' : undefined}
            aria-label={title || undefined}
            aria-hidden={title ? undefined : 'true'}
            focusable="false"
            {...rest}
        >
            {title && <title>{title}</title>}
            {path}
        </svg>
    );
}

/** Every icon name, for the odd place that needs to check one exists. */
export const ICON_NAMES = Object.keys(P);
