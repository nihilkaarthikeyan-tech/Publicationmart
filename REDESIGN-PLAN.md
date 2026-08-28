# PublicationMart 2.0 — Full Redesign Plan

**Goal:** redesign every page of the site to the new publishing-house direction
**without changing a single piece of behaviour.** Every route, link, button, form,
auth state and admin capability that exists today must exist, unchanged, after
the redesign. Design is the only thing that moves.

This document is the contract for that work. A page is "done" only when its
checklist in this file is fully ticked.

---

## 1. Ground rules (non-negotiable)

1. **All work happens on branch `2.0`.** `main` is the live site. The deploy
   script refuses any branch except `main`, so the live site cannot be touched
   by accident. Merge to `main` only at the final cutover (§8).
2. **Restyle, never rewrite.** The default move on every page is: change
   classNames, colours, typography, spacing — keep the JSX structure, props,
   state, handlers and routes exactly as they are. A structural rewrite is the
   exception and requires the full inventory step first (§5).
3. **Never remove a page from the shared layout.** `resources/js/app.jsx` has a
   `noLayoutPages` list. Taking a page out of the layout silently removes the
   Navbar, Footer **and global flash messages** (we broke this once on the
   landing page). The current list stays as it is.
4. **The logo is untouchable.** `public/images/logo_new.png` is used as-is.
   Because "Publication" in it is white on transparent, any bar containing the
   logo must be dark (`--ink #17150f`). No recreated/text logos.
5. **No logic edits ride along with design commits.** If a bug or improvement
   is spotted while restyling, it gets its own commit (or is noted here under
   §9) — never mixed into a restyle commit. That keeps every design commit
   trivially revertible.
6. **Extract content programmatically, never retype it.** Prices, feature
   lists, FAQ text etc. are copied out of the old source with a script (as done
   for `Welcome.data.jsx`) so nothing drifts. ₹1,49,999 must stay ₹1,49,999.
7. **Payment and AI flows: style only, with extra care.** Anything under
   `/payment/*`, `/cart/*`, `/smart-writer/*` pay/generate endpoints, and the
   AI studio touches money or paid API usage. On those pages we change
   presentation markup only — never form fields, hidden inputs, endpoints,
   tokens or throttle behaviour.

---

## 2. The design system (already established on the landing page)

Defined in `resources/js/Pages/Welcome.jsx` and the restyled
`Components/Navbar.jsx` / `Components/Footer.jsx`. Every page reuses these
tokens; no page invents new colours.

| Token | Value | Role |
|---|---|---|
| `--stock` | `#f0ece3` | page background (uncoated paper) |
| `--stock-2` | `#e7e1d4` | darker paper |
| `--stock-3` | `#faf8f3` | title page / cards |
| `--ink` | `#17150f` | text, dark bands (header/footer/CTA) |
| `--ink-2` | `#4b443a` | secondary text |
| `--ink-3` | `#7c7364` | muted text |
| `--rule` | `#d8d1c1` | hairlines / borders |
| `--cloth` | `#6e2530` | accent — oxblood binding cloth |
| `--foil` | `#a07d3b` | accent — aged gold foil |

Type: **EB Garamond** for display/serif, Figtree for UI text. Section headers
use "running head" small-caps labels with a hairline rule, not tech-style
monospace labels.

**To do before phase 2:** lift these tokens out of `Welcome.jsx` into one
shared place (e.g. `resources/css/app.css` or a `theme.css`) so every page
imports the same definitions instead of copy-pasting the CSS block.

Dashboard/admin caveat: dense data screens may keep functional UI conventions
(tables, status colours for success/error) — the tokens set the palette, they
don't forbid clarity.

---

## 3. Site inventory — what exists and must survive

**165 web routes** (`php artisan route:list` is the source of truth), ~60 page
components, 2 layouts (`Layout.jsx` with Navbar+Footer+flash, `GuestLayout`),
and the `noLayoutPages` set which own their chrome.

Shared components (restyling these changes every page at once — test wide):
`Navbar.jsx` (14 routes incl. auth + admin states), `Footer.jsx` (32 links),
`Modal`, `Dropdown`, `PrimaryButton`, `SecondaryButton`, `DangerButton`,
`TextInput`, `InputLabel`, `InputError`, `Checkbox`, `PremiumBackground`,
`AiWritingModal`, `PublishToStores`, `Editor/*`, `Preview/*`.

### Page groups (= redesign phases)

**Phase 0 — Landing page** *(in progress; debts listed in §9)*
- `Welcome.jsx` + `Welcome.data.jsx`

**Phase 1 — Public static pages** (low risk, no forms except contact)
- `About.jsx`, `HowToPublish.jsx`, `RoyaltyCalculator.jsx`, `Services.jsx`,
  `Resources.jsx`, `PrivacyPolicy.jsx`, `TermsOfService.jsx`
- `Services/`: `CoverPageDesigner`, `EbookPrintPublishing`, `IsbnDistribution`,
  `FormattingTool`, `Careers`
- `Contact.jsx` — has a POST form (`contact.store`, throttled): style only.

**Phase 2 — Public interactive** (forms, OTP, captcha, enquiries)
- `PublishingInquiry.jsx` — receives `?plan=` from landing pricing; the plan
  preselect must keep working for all 6 plan values.
- `Blogs/` (`Index`, `Show`, `Create`) — includes presale booking with
  captcha + OTP endpoints. Style only.
- `Challenges/` (`Index`, `Success`) — enrollment form.
- `BookStore/` (`Index`, `Show`, `Cart`) — cart + coupon verify + checkout.

**Phase 3 — Auth pages** (own their chrome via `noLayoutPages`)
- `Auth/`: `Login`, `Register`, `ForgotPassword`, `ResetPassword`,
  `VerifyEmail`, `ConfirmPassword`. Keep every field name, error display and
  route. These are the front door — verify both states (fresh visit, error).

**Phase 4 — Guest Smart Writer funnel** (revenue path — extra care per §1.7)
- `GuestSmartWriter/`: `Pricing`, `GuestCheckout`, `Studio`, `Success`.
- Token-based flow (`/smart-writer/studio/{token}` …) must be tested
  end-to-end after restyling: outline → sections → write → export/download.

**Phase 5 — Author area (signed-in)**
- `Dashboard.jsx`, `Profile/Edit` + partials
- `Books/`: `Index`, `Create`, `Design`, `Details`, `Review`, `Preview`,
  `CoverCreator`, `FormattingTool`, `AiBookStudio`, `ProPricing`,
  `PremiumPricing`, `PaymentGateway`, `Professional*` (upload/payment)
- `Payment/`: `Checkout`, `Success`, `Failure`, `Pending`,
  `AuthorCopiesCheckout`
- `Support/`: `Index`, `Create`, `Show`

**Phase 6 — Admin + support agent** (last; least public, most functional)
- `Admin/*` (dashboard, books, approvals, users, admins, coupons, inquiries,
  challenge admin, presales, orders, certificates, support, blogs, manuscript
  preview) and `SupportAgent/*`.
- Admin screens are working tools: parity here means every table column,
  action button, status toggle and file upload/download still works.

Order rationale: public → funnel → private. Each phase reuses tokens from the
previous, so pages get faster; the riskiest (money, admin) come after the
process is proven.

---

## 4. The per-page workflow (do this for every page, in order)

1. **Inventory first (before touching code).**
   `git show <base>:<file>` the current page and record in the checklist (§5):
   every `Link`/`route()`/`href`, every `<form>`/`useForm`/`post()`, every
   button and handler, conditional branches (`auth.user`, admin, empty/error
   states), props received from the controller, `<Head>` SEO tags, anchors/ids
   other pages point at, and any state/animation behaviour worth keeping.
2. **Snapshot the "before".** Full-page screenshot + a DOM dump of link
   count/hrefs (browser console) saved for comparison.
3. **Restyle** per the ground rules. Structure changes only if the inventory
   is written down first.
4. **Build**: `npm run build` must pass clean.
5. **Verify against the inventory** — not against memory:
   - link/button count and every href identical (or difference justified below)
   - forms submit to identical endpoints with identical field names
   - all conditional states rendered (logged out / logged in / admin / empty)
   - `<Head>` tags preserved (title, meta, OG, structured data)
   - anchors used by Navbar/Footer still resolve
   - flash messages still render (trigger one)
   - mobile width (375px) and desktop both checked in the browser
6. **Commit one page per commit** to `2.0`, message stating what was verified.
7. **Tick the page off in §6** with the commit hash.

### Verification snippet (run in the browser console on old and new)

```js
({ links: document.querySelectorAll('a').length,
   buttons: document.querySelectorAll('button').length,
   forms: [...document.querySelectorAll('form')].map(f => f.action),
   hrefs: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).sort() })
```

Diff the two objects. Any difference must be explainable and intentional.

---

## 5. Per-page parity checklist (template — copy per page)

```
## <PageName>  (base commit: <hash>)
- [ ] Inventory recorded (links / forms / buttons / states / props / SEO / anchors)
- [ ] Before-screenshot + link dump saved
- [ ] Restyled, npm run build clean
- [ ] Href set identical (diffed, not eyeballed)
- [ ] Forms: same endpoints, same field names, errors still display
- [ ] Auth states verified: guest / user / admin (as applicable)
- [ ] <Head> SEO tags carried over
- [ ] Flash message renders
- [ ] 375px + desktop checked
- [ ] Committed: <hash>
```

---

## 6. Progress tracker

| Phase | Page | Status |
|---|---|---|
| 0 | Welcome (landing) | ✅ redesigned + full functional parity restored (§9 debts cleared) |
| 0 | Navbar (shared) | ✅ restyled, colours only — `5346c46` |
| 0 | Footer (shared) | ✅ restyled, colours only — `5346c46` |
| 1–6 | everything else | ⬜ not started |

---

## 7. Testing gates (beyond per-page checks)

- **After each phase:** click through the Navbar's 14 routes and the Footer's
  32 links as guest and as a signed-in user — no dead link, no unstyled page
  looking broken next to restyled ones is a blocker for merge (mixed old/new
  styling *during* 2.0 development is fine; it only matters at cutover).
- **Before cutover:** one full end-to-end pass of the money paths on staging:
  guest writer purchase flow, book-store cart → checkout, publishing inquiry
  with each `?plan=`, register → publish flow, admin approval.
- `php artisan route:list` diffed against the start of the project — must be
  identical (we never add/remove routes in this effort).

---

## 8. Cutover plan (when all phases are done)

1. Freeze `2.0`; run the full §7 pass on it.
2. Back up live (deploy script already keeps snapshots; confirm one exists).
3. Merge `2.0 → main` as a single merge commit (revertible in one step).
4. Deploy from `main` via `deploy.sh` as usual.
5. Immediately smoke-test live: landing, login, one plan link, one book page,
   sitemap.xml, a shared link preview (OG image).
6. If anything is wrong: `git revert -m 1 <merge>` and redeploy — minutes, not
   hours.

---

## 9. Known debts from the landing-page audit — CLEARED 2026-08-28

Found by diffing old `Welcome.jsx` (`56d5a27`) against the redesign; all
restored and verified in the browser:

1. ✅ **SEO head block** ported back verbatim (title, meta description,
   keywords, Open Graph, Twitter card, JSON-LD Organization schema).
2. ✅ **Register CTA restored** — closing section has "Get Started for Free"
   → `route('register')` plus the old microcopy line.
3. ✅ **`platformStats.totalAuthors` displayed again** in the title-page stat
   line ("authors joined").
4. ✅ **Cut content restored:** "The workshop" tools section (Smart Writing →
   guest flow, Cover Design / Formatting Tool / Design Suite → login, plus
   Insights and Smart Formatting cards), Payouts + Formats rows in the promise
   table, retailer names band (Kindle, Apple, Google Play, B&N, Kobo,
   IngramSpark), genre grid, trust-capabilities line, author success stories
   (all 10 `featuredBooks` authors from the database, initial avatar + book
   title + Published badge, as the old ticker showed), premium-tab note,
   "Built by Authors" bullets, exact hero badge wording. The "Join 12,500+
   Authors" claim was NOT restored — real `platformStats` numbers are shown
   instead (deliberate; the figure was unverifiable).
5. ✅ **Original wording restored:** "Pro Suite / Premium Suite" tabs,
   "Choose {plan}" buttons, "Best Value" / "Most Popular" badges.

**New debt discovered (pre-existing, not from the redesign):**
`resources/views/app.blade.php` hardcodes a `<title>` and Inertia adds its
own, so the page carries two `<title>` tags (browsers use the first — the
blade one — so per-page titles never show). Existed before 2.0; fix as its
own commit sometime during the rework.

---

## 10. Risk register

| Risk | Mitigation |
|---|---|
| Shared component restyle breaks many pages at once | Colours/typography only in shared components; grep for every usage before structural change; test as guest + user + admin |
| Silent loss via layout exclusion | `noLayoutPages` is frozen (§1.3) |
| Content drift (prices, FAQ text) | Programmatic extraction only (§1.6) |
| SEO regression at cutover | §9.1 + per-page `<Head>` checklist line + share-preview smoke test (§8.5) |
| Payment flow breakage | §1.7 style-only rule + §7 end-to-end money-path pass |
| Half-done state shipped | Deploy guard blocks `2.0`; cutover is a single revertible merge (§8) |
| "Looks done" ≠ done | A page is done only when its §5 checklist is ticked with evidence |
