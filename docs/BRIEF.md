# Honorary Consulate of Timor-Leste (Auckland & North Island)
## Website rebuild brief — for ChatGPT Codex

**Current site:** https://www.consulatetimorleste.co.nz (Google Sites)
**Goal:** A simplified, stunning, highly professional diplomatic site with modern contact/enquiry features.

---

## 1. Review of the current site

### What's working
- **The writing is genuinely good.** The prose has warmth, specificity, and diplomatic register. It should survive the rebuild almost intact — this is the site's biggest asset and most rebuilds throw it away.
- **Strong narrative arc:** Nation → Language → Culture → Opportunity → Consul. That sequence earns the ask at the end.
- **The ASEAN timeline** (2002 → 2011 → Oct 2025) is a real sequence, so numbered/dated markers are justified here.
- **Coordinate pairs** (8.5°S 125.7°E Dili / 36.8°S 174.7°E Auckland) are a quiet, excellent motif — two points, one relationship. Keep and elevate this.

### What's holding it back
| Issue | Impact |
|---|---|
| Everything is one enormous scrolling page | No page can rank in search on its own; visitors can't link to "Consular Services" |
| Google Sites template chrome | "Report abuse", "Google Sites" footer badges read as amateur on a diplomatic site |
| Emoji as section iconography (🗺️ 👥 ✝️ 💵) | Reads casual; inconsistent rendering across platforms |
| No contact form at all | Only a raw `mailto:` to a **Gmail address** — the single biggest credibility gap |
| No enquiry routing | A Timorese national needing help and an investor land in the same undifferentiated inbox |
| Google-hosted image URLs (`lh3.googleusercontent.com`) | Slow, unoptimised, no alt text, fragile |
| No bilingual presence | Tetum and Portuguese are discussed at length but never *used* |
| No favicon / OG image / structured data | Poor link previews and search presentation |
| Anchor links exposed as raw IDs (`#h.xzxqlhdn0jzm`) | Ugly and unusable as shareable URLs |
| No privacy statement | Required once you collect enquiry data under the NZ Privacy Act 2020 |

### Content corrections to make during the rebuild
1. **"Labour Mobility (RES)"** → should be **RSE** (Recognised Seasonal Employer). Fix this — it's a government scheme name.
2. **"apointee"** → appointee.
3. **"Assisstance for Timorese Nationals"** → Assistance.
4. **"© 2026"** → confirm intended year.
5. **Verify and date every figure** before publishing: Petroleum Fund USD $18.9B, ASEAN GDP $3.8T, 680M consumers, 607km Dili–Darwin cable, Mt Ramelau 2,963m. Add "as at [date]" or a source line for the financial ones — a consulate is quoted, and stale numbers are a liability.
6. **Consider a dedicated domain email** (`consul@consulatetimorleste.co.nz`) rather than Gmail. This alone lifts perceived legitimacy more than any design change.
7. **Confirm insignia rights.** Use of the Timor-Leste coat of arms and the phrasing of "Honorary Consulate" should be cleared with the Embassy in Wellington before it goes live.

---

## 2. Information architecture

Break the single page into five routes. Every section already has enough substance to stand alone.

```
/                     Home — hero, the relationship, three doorways, contact CTA
/timor-leste          The Nation + Language & Identity + Culture
/opportunity          ASEAN chapter, sectors, investment case
/consular-services    Four services, jurisdiction, Wellington Embassy referral
/contact              Form, direct details, map, hours
/privacy              Privacy statement (NZ Privacy Act 2020)
```

Optional phase 2: `/notices` (announcements, national day, community events) — gives the site a reason to be revisited.

Global nav: **Timor-Leste · Opportunity · Consular Services · Contact**
Nav ends with Contact styled as a button. Nothing else competes with it.

---

## 3. Design direction

The brief is a diplomatic mission, so the floor is *gravitas*. The risk is that gravitas becomes generic. Ground every decision in Timorese material culture rather than in "government website" conventions.

### Palette — derived from natural tais dyes
Tais textiles are dyed with indigo, morinda root, and turmeric. That is the palette, and it happens to overlap the national flag without being a literal flag rip.

```
--ink        #12141C   near-black with a blue cast (indigo-dyed cotton in shadow)
--indigo     #1E3A5F   deep sea-indigo — primary surface for dark sections
--morinda    #A62C24   morinda-root red — accent, used sparingly and never as a gradient
--turmeric   #D9A441   ochre-yellow — highlight, rules, the star motif
--undyed     #F2EDE4   raw cotton — light background
--stone      #6B6560   secondary text and hairlines
```

Do **not** produce: cream + high-contrast serif + terracotta accent, or black + neon accent. Those are the current AI-design defaults and a reviewer will recognise them instantly.

### Typography
Three roles, deliberately paired:

- **Display — `Newsreader`** (600/700, tight tracking, optical sizing on). Editorial serif with enough warmth to avoid feeling colonial-institutional, enough authority for a state mission. *Alternative if a harder edge is wanted:* `Instrument Serif`.
- **Body — `Public Sans`** (400/500). Open, plain, high legibility, government-adjacent without being sterile. Long paragraphs of the existing prose need to read easily on a phone.
- **Utility — `IBM Plex Mono`** (400, uppercase, wide tracking) for coordinates, dates, statistics, section eyebrows, and the Tetum/Portuguese glosses.

Type scale: 1.25 ratio on mobile, 1.333 on desktop. Body 17–18px. Display sizes should be genuinely large (clamp to 4.5rem+) — restraint everywhere else buys that.

### Signature element — the tais band
**This is the one memorable thing. Spend the boldness here and keep everything else quiet.**

Build a small SVG/CSS system of woven geometric bands based on real tais motifs (chevrons, diamonds, stepped lozenges — reference regional patterns; do not invent something that looks vaguely "tribal"). Each major section is separated by a horizontal band, and each section gets its *own* pattern. On the home page hero, one band draws itself left-to-right on load (respecting `prefers-reduced-motion`), like a shuttle passing through a loom.

This encodes something true: tais patterns are region-specific and carry identity. The structure *is* information, not decoration.

### The coordinate motif
Carry `8.5°S 125.7°E` / `36.8°S 174.7°E` through the site in the mono face — in the hero, in the footer, on the contact page. Two coordinates, 5,300km apart, one relationship. It's the whole thesis of an honorary consulate in six characters.

### Language presence
Since the site argues that Timor-Leste is linguistically unique, *demonstrate* it. Use Tetum as a quiet layer, not a full translation:
- Section eyebrows in Tetum with English beneath (`NASAUN` / The Nation)
- Form success message: "Obrigadu barak — your message has been received."
- Footer: "Repúblika Demokrátika Timor-Leste"

Phase 2 can add a real EN/TET toggle if the consulate can supply translations. Don't machine-translate a diplomatic site.

### Motion
One orchestrated page-load sequence on the home hero (band weaves, coordinates fade, headline rises). Scroll-triggered reveals limited to a subtle fade-and-rise, once per element, never repeating. Nothing parallaxing, nothing bouncing. Everything gated behind `prefers-reduced-motion: reduce`.

### Imagery
Replace all Google-hosted images. Source high-resolution photography of: Dili coastline, tais weaving in progress, Uma Lulik, Atauro reef, Mount Ramelau, coffee harvest. **Licensing must be cleared** — a consulate cannot use unlicensed images. Serve as AVIF/WebP with proper `alt` text describing content, not decoration.

---

## 4. Technical stack

**Recommended: Astro 5 + Tailwind CSS 4, deployed to Netlify or Cloudflare Pages.**

Rationale: the site is 95% static content. Astro ships zero JavaScript by default, which means a near-perfect Lighthouse score and fast loads on Timorese and rural NZ connections. Content lives in Markdown so the consul can edit copy without touching code.

```
Framework      Astro 5 (static output)
Styling        Tailwind CSS 4 + a small custom token layer
Content        Markdown/MDX in src/content/ with type-safe collections
Forms          Astro server endpoint → Resend API
Spam           Cloudflare Turnstile + honeypot field + IP rate limit
Email          Resend, sending from a verified consulatetimorleste.co.nz domain
Maps           Static map image with a "Open in Google Maps" link (no tracking iframe)
Analytics      Plausible or Fathom (cookieless — avoids a consent banner entirely)
Hosting        Netlify or Cloudflare Pages, custom domain, automatic HTTPS
Repo           GitHub, deploy previews on every PR
```

**Alternative if a CMS is needed later:** Next.js 15 (App Router) + Sanity or Payload. Only take on this weight if the consulate will genuinely publish notices regularly.

---

## 5. Contact & enquiry system — the core new feature

This is what the current site is missing entirely. Specification:

### Form fields
```
Name*                    text
Email*                   email, validated
Phone                    tel, optional
Country/Location         select, default New Zealand
Enquiry type*            radio — routes the message:
  · Assistance for a Timorese national
  · Business, trade or investment
  · Tourism and travel to Timor-Leste
  · Media or speaking request
  · General enquiry
Subject*                 text
Message*                 textarea, 2000 char limit with live counter
Consent*                 checkbox — "I consent to the Consulate storing
                         and using these details to respond to my enquiry."
                         Links to /privacy
```

### Behaviour
- **Progressive enhancement:** the form posts and works with JavaScript disabled. JS only adds inline validation and the async submit.
- **Inline validation** on blur, not on every keystroke. Error messages state what's wrong and how to fix it: "Enter an email address so the Consulate can reply" — not "Invalid input."
- **Enquiry-type routing:** each type maps to a subject-line prefix (`[Consular Assistance]`, `[Investment]`, etc.) so the inbox self-organises. Later, types can route to different recipients.
- **Auto-acknowledgement** sent to the enquirer immediately: confirms receipt, states an expected response window (e.g. 3–5 working days), and — critically — **redirects visa/passport enquiries to the Wellington Embassy** with its phone and email. This deflects the highest-volume wrong-address enquiries automatically.
- **Success state:** replace the form in place with a confirmation ("Obrigadu barak — your message has been received"), not a page redirect.
- **Failure state:** if the send fails, show the direct email address and phone number as a fallback. Never dead-end someone.
- **Spam defence:** Cloudflare Turnstile (invisible, no puzzle), a hidden honeypot field, a minimum time-on-form check, and per-IP rate limiting at the endpoint. Do not use reCAPTCHA — it's a Google tracker and hostile to screen readers.

### Also on the contact page
- **Urgent assistance callout** at the top: phone number, prominent, for Timorese nationals in difficulty. This should be the first thing on the page — someone in trouble should not have to scroll past an investment pitch.
- Direct email and phone as tappable `mailto:` / `tel:` links
- WhatsApp link (`wa.me/64210216888`) — widely used by both diaspora and regional business contacts
- Address: 97 Great South Road, Epsom, Auckland, with a static map image linking out
- Jurisdiction note: Auckland & North Island (north of Wellington)
- **Wellington Embassy block**, clearly separated: visas, passports, official consular documents → (04) 471 1971, embassy.timorleste.nz@gmail.com
- Availability note — set expectations honestly; this is a voluntary appointment

### Booking (optional, phase 2)
Embed Cal.com for "Request a meeting with the Consul" — 30-minute slots, self-service. Removes a full email round-trip for business enquiries.

---

## 6. Quality floor — non-negotiable

- **WCAG 2.1 AA.** Contrast ≥4.5:1 body / 3:1 large text. Visible keyboard focus rings on every interactive element. Skip-to-content link. Semantic landmarks. Form labels properly associated (not placeholder-as-label). Test with keyboard only and with VoiceOver. A diplomatic mission is held to a higher standard here, and NZ government guidance expects it.
- **Responsive** from 320px up. Test the long culture paragraphs on a small phone.
- **Performance:** Lighthouse ≥95 across the board. Images lazy-loaded below fold, sized, AVIF/WebP with fallback. Fonts self-hosted with `font-display: swap` and subset to Latin + Latin Extended (needed for Portuguese diacritics).
- **SEO:** unique title and meta description per page, canonical URLs, `sitemap.xml`, `robots.txt`, custom OG image per page, and JSON-LD `GovernmentOffice` schema with address, phone, and `areaServed`.
- **Security headers:** CSP, `X-Content-Type-Options`, `Referrer-Policy`, HSTS.
- **404 page** with real navigation, not a dead end.

---

## 7. Build phases

**Phase 1 — Foundation**
Scaffold Astro + Tailwind. Implement the design token layer (colours, type scale, spacing). Build the tais band SVG component system. Header, footer, layout shell. Deploy a blank shell to a preview URL to confirm the pipeline works.

**Phase 2 — Content**
Port all existing copy into Markdown content collections, applying the corrections in §1. Build the five routes. Placeholder images at correct aspect ratios.

**Phase 3 — Contact system**
Form component, server endpoint, Resend integration, Turnstile, auto-acknowledgement template, success/failure states, privacy page. Test end-to-end with a real inbox.

**Phase 4 — Polish**
Hero load sequence, scroll reveals, reduced-motion handling. Real photography swapped in. OG images. Structured data.

**Phase 5 — Launch**
Accessibility audit (axe + manual keyboard pass). Lighthouse. Cross-browser and real-device check. Domain cutover with DNS TTL lowered in advance. Redirect map from old Google Sites anchor URLs to new routes. Verify email deliverability (SPF, DKIM, DMARC on the sending domain).

---

## 8. Prompts to give Codex

Run these in sequence, reviewing output between each. Don't paste them all at once.

**Prompt 1 — scaffold**
> Create a new Astro 5 project with Tailwind CSS 4 and TypeScript, static output, targeting Netlify. Set up `src/content/` collections for pages. Configure self-hosted Google Fonts (Newsreader, Public Sans, IBM Plex Mono) subset to Latin and Latin Extended. Create a `src/styles/tokens.css` defining these CSS custom properties: [paste the palette from §3], a 1.333 modular type scale with clamp(), and an 8px spacing scale. No components yet — just the foundation, with a working dev server.

**Prompt 2 — tais band system**
> Build an Astro component `<TaisBand />` that renders a horizontal woven-textile band as inline SVG. Props: `pattern` (one of five named geometric motifs — chevron, diamond, stepped-lozenge, zigzag, morinda-stripe), `colors` (array of token names), `height`, and `animate` (boolean). When `animate` is true, the band draws itself left to right over 1.2s using stroke-dashoffset, and is fully disabled under `prefers-reduced-motion: reduce`. Patterns must tile seamlessly at any width. Render all five to a demo page so I can review them.

**Prompt 3 — layout shell**
> Build the site header, footer, and base layout. Header: wordmark left ("Honorary Consulate of Timor-Leste" with "Auckland & North Island" as a smaller line beneath), nav right (Timor-Leste, Opportunity, Consular Services, Contact-as-button), full-screen slide-in menu below 768px with proper focus trapping and Escape-to-close. Footer: contact block, coordinate pair in the mono face, Wellington Embassy referral, privacy link, copyright. Include a skip-to-content link. Semantic landmarks throughout.

**Prompt 4 — home page**
> Build the home page. Hero: full-viewport, `--ink` background, the coordinate pair for Dili and Auckland in IBM Plex Mono uppercase widely tracked, display headline "Discover Timor-Leste" in Newsreader at clamp(3rem, 8vw, 6rem), one-line subhead, and an animated TaisBand beneath. Orchestrate a load sequence: band weaves in, then coordinates, then headline rises, total under 2s, fully disabled under reduced motion. Below the hero: a short relationship statement, three doorway cards linking to the main sections, and a closing contact CTA. Do not use gradients on text or buttons.

**Prompt 5 — content pages**
> Build /timor-leste, /opportunity, and /consular-services from the Markdown in src/content/. Each section separated by a distinct TaisBand pattern. Section eyebrows in Tetum with English beneath, in the mono face. Replace all emoji icons with a consistent 24px line-icon set. On /opportunity, render the ASEAN timeline (2002, 2011, Oct 2025) as a genuine horizontal timeline with dated markers, and the four statistics as large mono figures with small labels beneath. Statistics must include an "as at" date line.

**Prompt 6 — contact system**
> Build /contact and the enquiry pipeline. [Paste §5 in full.] Use an Astro server endpoint at `src/pages/api/enquiry.ts` calling the Resend API, with Zod validation, Cloudflare Turnstile server-side verification, a honeypot field, and per-IP rate limiting. Send two emails: the enquiry to the Consulate with a subject-line prefix based on enquiry type, and an auto-acknowledgement to the sender that includes the Wellington Embassy details for visa and passport matters. The form must work without JavaScript. Show me the endpoint code before wiring the UI.

**Prompt 7 — audit**
> Audit the whole site for WCAG 2.1 AA: colour contrast on every text/background pair, keyboard navigation order, visible focus indicators, form label associations, heading hierarchy, image alt text, and reduced-motion coverage. Then run Lighthouse on every route and fix anything below 95. List what you changed and why.

---

## 9. What to decide before starting

1. Domain email on `consulatetimorleste.co.nz` — set up, or stay on Gmail?
2. Photography — licensed source, or commission/source from the Embassy and Timor-Leste tourism authority?
3. Coat of arms usage — cleared with the Wellington Embassy?
4. Tetum copy — who supplies and checks it?
5. Response-time commitment for the auto-acknowledgement — 3 working days? 5?
6. Who maintains the site after launch, and do they need a CMS or is editing Markdown via GitHub acceptable?
