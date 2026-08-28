# PublicationMart — routes, pages & design system

The map of the whole application: every route, the controller it hits, the
page it renders, and the rules that keep the design consistent. Written
2026-08-28, after the 2.0 reorganisation.

## The one-paragraph mental model

Laravel serves **one blade shell** ([resources/views/app.blade.php](../resources/views/app.blade.php));
Inertia + React render every page inside it. Routes live in **five files
split by audience** (below). Every page automatically gets the global
`Layout` (navbar + footer) unless the page itself ends with
`TheirPage.layout = null;`. All colours come from **named tokens** in
[tailwind.config.js](../tailwind.config.js) — change the palette there and
the whole site follows.

## Route files (routes/)

| File | Audience | Middleware | URL space |
|---|---|---|---|
| `web.php` | Public visitors | none | `/`, `/about`, `/book-store`, `/studio`, `/smart-writer`, `/challenges`, `/payment/*`, … |
| `author.php` | Logged-in authors | `auth` (dashboard + support also `verified`) | `/dashboard`, `/books/*`, `/publish`, `/profile`, `/support/*`, `/professional/*` |
| `admin.php` | Admins | `auth` + `verified` + `admin` | `/admin/*` — everything, one group |
| `agent.php` | Support agents | `auth` + `support_agent` | `/agent/*` |
| `auth.php` | Login / register | guest / auth | `/login`, `/register`, `/forgot-password`, … |

`web.php` `require`s the other four at the bottom. **Route names are the
contract** — pages call `route('name')` — so a route may move between
files freely, but renaming one is a breaking change.

## Page map — public (web.php)

| URL | Name | Renders | Notes |
|---|---|---|---|
| `/` | `welcome` | `Welcome` | landing; featured books cached 30 min |
| `/about` | `about` | `About` | |
| `/contact` | `contact` | `Contact` | POST throttled 5/min |
| `/how-to-publish` | `how-to-publish` | `HowToPublish` | |
| `/royalties-calculator` | `royalties.calculator` | `RoyaltyCalculator` | |
| `/services` | `services` | `Services` | |
| `/services/cover-page-designer` | `services.cover-designer` | `Services/CoverPageDesigner` | |
| `/services/ebook-and-print-publishing` | `services.ebook-print` | `Services/EbookPrintPublishing` | |
| `/services/isbn-and-global-distribution` | `services.isbn-distribution` | `Services/IsbnDistribution` | |
| `/services/diy-formatting-tool` | `services.formatting-tool` | `Services/FormattingTool` | |
| `/careers` | `careers` | `Services/Careers` | |
| `/resources` | `resources` | `Resources` | |
| `/help-center` | `help-center` | `Resources` | reuses Resources |
| `/privacy-policy` | `privacy-policy` | `PrivacyPolicy` | |
| `/terms`, `/terms-and-conditions` | `terms` | `TermsOfService` | two URLs, one page |
| `/publishing-inquiry` | `publishing-inquiry.create` | `PublishingInquiry` | POST throttled |
| `/studio` | `blogs.index` | `Blogs/Index` | the public blog is branded "Studio" |
| `/studio/create` | `blogs.create` | `Blogs/Create` | |
| `/studio/{slug}` | `blogs.show` | `Blogs/Show` | + presale booking POSTs |
| `/challenges` | `challenges.index` | `Challenges/Index` | guests can enrol |
| `/challenges/{enrollment}/success` | `challenges.success` | `Challenges/Success` | |
| `/smart-writer` | `guest-writer.pricing` | `GuestSmartWriter/Pricing` | **full-screen** |
| `/smart-writer/payment` | `guest-writer.payment` | `GuestSmartWriter/GuestCheckout` | |
| `/smart-writer/studio/{token}` | `guest-writer.studio` | `GuestSmartWriter/Studio` | **full-screen** |
| `/smart-writer/success/{token}` | `guest-writer.success` | `GuestSmartWriter/Success` | **full-screen** |
| `/book-store` | `book-store.index` | `BookStore/Index` | slim 8-column payload, 24-card pages |
| `/book-store/{book}` | `book-store.show` | `BookStore/Show` | approved books only |
| `/cart/{book}` | `cart.show` | `BookStore/Cart` | checkout POST needs auth |
| `/payment/checkout/{book}` | `payment.checkout` | `Payment/Checkout` | |
| `/payment/success` / `failure` | `payment.success/.failure` | `Payment/Success` / `Payment/Failure` | `Payment/Pending` from PhonePe flow |
| `/payment/phonepe/*` | `payment.phonepe.*` | — | gateway redirect + S2S webhook, CSRF-exempt |
| `/sitemap.xml` | — | — | dynamic SEO sitemap |
| `/api/stock-images/search` | `api.stock-images.search` | — | Pexels proxy |
| `/api/coupons/verify` | `coupons.verify` | — | throttled against brute force |

## Page map — author area (author.php)

| URL | Name | Renders | Notes |
|---|---|---|---|
| `/dashboard` | `dashboard` | `Dashboard` | |
| `/books` | `books.index` | `Books/Index` | the author's shelf |
| `/publish` | `books.create` | `Books/Create` | also `/books/{book}/edit` |
| `/books/{book}/design` | `books.design` | `Books/Design` | |
| `/books/{book}/cover-creator` | `books.cover-creator` | `Books/CoverCreator` | |
| `/books/{book}/details` | `books.details` | `Books/Details` | |
| `/books/{book}/review` | `books.review` | `Books/Review` | |
| `/books/{book}/preview` | `books.preview` | `Books/Preview` | |
| `/books/{book}/ai-studio` | `books.ai-studio` | `Books/AiBookStudio` | **full-screen**; + ~14 action routes |
| `…/ai-studio/pro-pricing` | `ai-studio.pro-pricing` | `Books/ProPricing` | **full-screen** |
| `…/ai-studio/premium-pricing` | `ai-studio.premium-pricing` | `Books/PremiumPricing` | **full-screen** |
| `…/ai-studio/payment/{plan}/{type}` | `ai-studio.payment` | `Books/PaymentGateway` | |
| `/books/{book}/format` | `books.format` | `Books/FormattingTool` | **full-screen**; + save/upload/export |
| `/books/{book}/hire-professional` | `professional.payment` | `Books/ProfessionalPayment` | + upload-first |
| `/professional/upload/{req}` | `professional.upload` | `Books/ProfessionalUpload` | |
| `/professional/success/{req}` | `professional.success` | `Professional/Success` | |
| `/payment/author-copies` | `payment.author_copies` | `Payment/AuthorCopiesCheckout` | |
| `/profile` | `profile.edit` | `Profile/Edit` | |
| `/support` | `support.index` | `Support/Index` | + create / show / reply / close |
| `/ai/generate` | `ai.generate` | — | generic AI helper, throttled 15/min |
| `/download-template` | `download.template` | — | .docx download |

## Page map — admin desk (admin.php, all under /admin, names admin.*)

| URL | Name | Renders |
|---|---|---|
| `/admin/dashboard` | `admin.dashboard` | `Admin/Dashboard` |
| `/admin/books` | `admin.books.index` | `Admin/Books/Index` |
| `/admin/books/create` | `admin.books.create` | `Admin/Books/Create` |
| `/admin/books/{book}` | `admin.books.show` | `Admin/BookDetails` |
| `/admin/books/{book}/design` | `admin.books.design` | `Admin/Books/Design` |
| `/admin/books/{book}/preview-manuscript` | `admin.books.preview-manuscript` | `Admin/ManuscriptPreview` |
| `/admin/approvals` | `admin.approvals.index` | `Admin/Approvals/Index` |
| `/admin/users` | `admin.users.index` | `Admin/Users/Index` |
| `/admin/users/{user}/dashboard` | `admin.users.dashboard` | `Admin/Users/Dashboard` |
| `/admin/admins` | `admin.admins.index` | `Admin/Admins/Index` |
| `/admin/coupons` | `admin.coupons.index` | `Admin/Coupons/Index` |
| `/admin/publishing-inquiries` | `admin.publishing-inquiries.index` | `Admin/PublishingInquiries` |
| `/admin/challenge-enrollments` | `admin.challenge-enrollments.index` | `Admin/ChallengeEnrollments` |
| `/admin/challenge-settings` | `admin.challenge-settings.index` | `Admin/ChallengeSettings` |
| `/admin/studio/submissions` | `admin.blogs.manage` | `Admin/Blogs/Index` |
| `/admin/studio/{blog}/presale-bookings` | `admin.blogs.presale-bookings` | `Admin/Blogs/PresaleDetails` |
| `/admin/presales` | `admin.presales.index` | `Admin/Presales/Index` |
| `/admin/professional-requests` | `admin.professional.index` | `Admin/ProfessionalRequests` |
| `/admin/professional-requests/{req}` | `admin.professional.show` | `Admin/ProfessionalRequestDetails` |
| `/admin/support` | `admin.support.index` | `Admin/Support/Index` |
| `/admin/support/{ticket}` | `admin.support.show` | `Admin/Support/Show` |
| `/admin/certificates` | `admin.certificates.index` | `Admin/Certificates/Index` |
| `/admin/update-database` | — | migrations + cache clear from the browser |

Plus the action POSTs/PATCHes/DELETEs for each feature, named under the
same prefixes (approve, reject, toggle, update-status, …).

## Page map — support agents (agent.php) & auth (auth.php)

| URL | Name | Renders |
|---|---|---|
| `/agent/dashboard` | `agent.dashboard` | `SupportAgent/Dashboard` |
| `/agent/tickets/{ticket}` | `agent.tickets.show` | `SupportAgent/Show` |
| `/login`, `/register`, `/forgot-password`, `/reset-password/{token}`, `/verify-email`, `/confirm-password` | Breeze names | `Auth/*` — all **full-screen** |

## Frontend organisation (resources/js/)

```
app.jsx               — Inertia bootstrap; applies the global Layout
Layouts/
  Layout.jsx          — navbar + flash toasts + footer (the default shell)
  GuestLayout.jsx     — small centered-card shell (ConfirmPassword)
Components/           — shared UI (Navbar, Footer, Modal, buttons, Editor/…)
Pages/                — ONE folder per route audience/feature; ONLY real
                        pages live at glob-visible paths
  <Feature>/Components/  — components private to that feature
  <Feature>/Partials/    — form partials (Breeze convention, Profile)
  *.data.jsx             — data-only modules (e.g. Welcome.data.jsx)
```

**Rules — these three keep the app organised:**

1. **A file directly under `Pages/**` is a page** — something a controller
   renders. Anything a page merely imports lives in a `Components/` or
   `Partials/` subfolder beside it. `app.jsx` excludes those folders (and
   `*.data.jsx`) from page resolution, so a stray component can never be
   rendered as a route target.

2. **Layouts are declared by the page, not by a central list.** Every page
   gets `Layout` (navbar + footer) automatically. A full-screen page
   (auth screens, the studios, pricing takeovers) opts out by ending with
   `TheirPage.layout = null;`. Grep `layout = null` for the current list.

3. **Colours are tokens, not hexes.** The whole palette is named in
   `tailwind.config.js` → `theme.extend.colors`:

   | Token | Hex | Role |
   |---|---|---|
   | `parchment` | `#f0ece3` | page background |
   | `paper` | `#faf8f3` | cards, raised surfaces |
   | `vellum` | `#e7e1d4` | sunken surfaces, hover fills |
   | `cream` | `#f2ecdd` | light text on dark surfaces |
   | `linen` / `linen-deep` | `#d8d1c1` / `#cdc5b1` | borders |
   | `ink` / `ink-soft` | `#17150f` / `#4b443a` | primary / secondary text |
   | `umber` | `#635c4e` | muted text |
   | `taupe` / `taupe-light` | `#7c7364` / `#a49b8b` | faint / disabled text |
   | `oxblood` (+`-deep`, `-night`) | `#6e2530` … | primary accent (binding cloth) |
   | `foil` (+`-light`, `-deep`) | `#a07d3b` … | gold accent |
   | `night` | `#241f16` | intentional dark surfaces |

   Write `bg-parchment`, `text-ink`, `border-linen`, `bg-oxblood
   hover:bg-oxblood-deep` — never `bg-[#f0ece3]`. To restyle the site,
   edit the token block; every page follows. (The config also remaps
   Tailwind's `indigo/violet/purple/fuchsia/pink` ramps onto the house
   palette for legacy classes — leave that in place.)

## Changing things safely

- **Add a page**: create `Pages/<Feature>/<Name>.jsx` (tokens only, no
  hexes), add the route in the file matching its audience, render it from
  a controller. It gets the layout automatically; append
  `Name.layout = null;` if it's a full-screen experience.
- **Re-colour the site**: edit the token block in `tailwind.config.js`.
- **Check nothing broke after route changes**: `php artisan route:list`
  before and after — same 194 rows expected.
