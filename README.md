# Hair by April – Stylist & Salon Web Application

A high-performance, SEO-optimized, and fully configurable web application crafted for hairstylists, salons, and beauty studios. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **TinaCMS**, and **Vite**, engineered for frictionless deployment to **Cloudflare Pages** and static edge CDNs.

---

## 📋 Table of Contents

1. [Architecture & Single Source of Truth](#-architecture--single-source-of-truth)
2. [Error Elevation & Resiliency](#-error-elevation--resiliency)
3. [Environment Variables Reference](#-environment-variables-reference)
4. [CMS Content Management (TinaCMS)](#-cms-content-management-tinacms)
5. [Automated SEO & Structured Data Generation](#-automated-seo--structured-data-generation)
6. [Design System & Styling Tokens](#-design-system--styling-tokens)
7. [Inquiry Lead Capture](#-inquiry-lead-capture)
8. [Cloudflare Pages Deployment Guide](#-cloudflare-pages-deployment-guide)
9. [Automated Verification & Audits](#-automated-verification--audits)

---

## ⚙️ Architecture & Single Source of Truth

The project features a **centralized configuration and content architecture** designed for easy client customization without modifying component code:

- **Single Source of Truth (`src/config/site.ts` & `src/content/`)**:
  All content is decoupled into structured JSON files under `src/content/`:
  - `site.json`: Business identity, contact details, geo coordinates, opening hours, address, and metadata.
  - `hero.json`: Credentials badge, primary headline, subheading, availability notice, and Instagram links.
  - `services.json`: Array of service offerings, durations, pricing, deliverables, and Cal.com slugs.
  - `portfolio.json`: Showcase gallery images, alt texts, and style category tags.
  - `events.json`: On-location collaborations, bridal party, and event styling descriptions.
- **Unified Config Module (`src/config/site.ts`)**:
  Exports typed configurations (`SITE_CONFIG`, `HERO_CONTENT`, `EVENTS_CONTENT`, `SERVICES_CONTENT`, `PORTFOLIO_CONTENT`) and dynamically constructs Schema.org `HairSalon` JSON-LD payloads without arbitrary fallbacks or multiple `||` chains.
- **Vite Performance Best Practices**:
  - Modal code-splitting via `React.lazy` (`BookingModal` and `AdminMockup`) to ensure a lean initial JavaScript bundle.
  - High-priority LCP preloading for the hero image (`fetchpriority="high"`, WebP format).
  - Modern typography preconnecting to Google Fonts with `font-display: swap`.

---

## 🛡️ Error Elevation & Resiliency

To prevent silent failures and ensure issues are immediately visible during development and production:

1. **React Error Boundary (`src/components/ErrorBoundary.tsx`)**:
   - Wraps the application root to capture render and lifecycle crashes.
   - Elevates clear error messages, expandable component hierarchy stacks, a one-click reload button, and a clipboard copy tool for rapid debugging.
2. **Global Error Notifier (`src/components/GlobalErrorNotifier.tsx`)**:
   - Listens to global `window.onerror` and `unhandledrejection` events for asynchronous script and network crashes.
   - Displays a visible, non-blocking toast banner with the exact error details.
3. **Form Error Elevation (`src/components/InquiryModule.tsx`)**:
   - If Google Sheets lead transmission encounters a network failure, the error is elevated directly in the UI with instant direct email and telephone fallbacks.
4. **Build Pipeline Diagnostics (`scripts/build.js`)**:
   - Validates each compilation step (dynamic SEO generation, TinaCMS compilation, and Vite bundle generation) and formats any failure with high-visibility terminal banners.

---

## 🔑 Environment Variables Reference

Visual styling, branding, contact info, hours, and descriptions are stored in `src/content/site.json`. Technical integrations and hosting settings remain in `.env`:

| Variable Name           | Default / Example                | Purpose                                                            |
| :---------------------- | :------------------------------- | :----------------------------------------------------------------- |
| `VITE_SITE_URL`         | `https://hairbyapril.pages.dev/` | Production root URL for canonical tags, XML sitemap, and OpenGraph |
| `VITE_GOOGLE_SHEET_URL` | `""`                             | Google Apps Script webhook URL for inquiry lead capture            |
| `VITE_TINA_CLIENT_ID`   | `""`                             | Tina Cloud Client ID (from [tina.io](https://tina.io))             |
| `TINA_TOKEN`            | `""`                             | Tina Cloud Content API Token                                       |
| `VITE_TINA_BRANCH`      | `"main"`                         | Git branch for TinaCMS cloud synchronization                       |

---

## 💇 CMS Content Management (TinaCMS)

This project integrates TinaCMS for full visual and headless content management:

- **Tina Dashboard**: Navigate to `/admin/index.html` to access the live Tina Cloud editor.
- **Collections**:
  - `hero`: Headline, credentials badge, availability notice, subheading, Instagram.
  - `services`: Complete list of services, prices, durations, and deliverables.
  - `portfolio`: Showcase gallery images, alt text, and tags.
  - `events`: Title and copy for collaborations.
  - `site`: Studio name, stylist name, browser title, meta description, contact email/phone, and address.
- **Sandbox Preview**: Add `?admin=true` or `#admin` to the site URL to preview content adjustments in real time with interactive controls.

---

## 🌐 Automated SEO & Structured Data Generation

SEO files are generated dynamically from the single source of truth during `npm run build` via `scripts/generate-seo.mjs`:

1. **`public/sitemap.xml` & `dist/sitemap.xml`**:
   Dynamically generated containing the active canonical domain and today's ISO date.
2. **`public/robots.txt` & `dist/robots.txt`**:
   Configures search engine crawlers and explicitly references the dynamic sitemap location.
3. **`public/llms.txt` & `dist/llms.txt`**:
   Provides an up-to-date Markdown digest of services, pricing, credentials, and booking instructions for AI search agents and LLM indexers.
4. **Schema.org Structured Data (`index.html`)**:
   Injects a full `HairSalon` LocalBusiness JSON-LD payload into the `<head>` with accurate service catalogs, coordinates, and contact details.

---

## 🎨 Design System & Styling Tokens

Styling utilizes Tailwind CSS v4 design tokens in `src/styles/tokens.ts`:

- `TOKENS.button.primary`: Primary high-emphasis CTA button.
- `TOKENS.button.navAction`: Polished header navigation action.
- `TOKENS.card.base`: Standard elevated surface with rounded corners.
- `TOKENS.card.service`: Dedicated service card styling.
- `TOKENS.badge.credentials`: Subtle brand credential pill.

---

## 📊 Inquiry Lead Capture

The **Inquiry Module** allows clients to submit event bookings and styling requests.

### Setup Instructions for Google Sheets:

1. Create a Google Sheet with columns: `Timestamp`, `Name`, `Email`, `Phone`, `EventType`, `PartySize`, `DateLocation`, `Notes`.
2. Go to **Extensions** > **Apps Script** and deploy a Web App with `doPost(e)` returning JSON.
3. Set the Web App access to **Anyone**.
4. Add the URL to `VITE_GOOGLE_SHEET_URL` in your Cloudflare Pages dashboard or `.env`.

---

## 🚀 Cloudflare Pages Deployment Guide

This project is tailored specifically for **Cloudflare Pages**.

### Static Assets & Routing:

- `public/_headers`: Pre-configured with 1-year immutable caching for `/assets/*`, immediate revalidation (`max-age=0, must-revalidate`) for HTML/XML/JSON manifests, and strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
- `public/_redirects`: Configures SPA routing (`/* /index.html 200`) and TinaCMS admin dashboard access (`/admin/* /admin/index.html 200`).
- `public/404.html`: Fallback redirect script for deep-linked direct visits.

### Deployment Method A: Cloudflare Dashboard (Git Integration)

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Configure build settings:
   - **Framework preset**: `None` or `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add Environment Variables:
   - `VITE_SITE_URL` = `https://hairbyapril.pages.dev` (or your custom domain)
   - `VITE_TINA_CLIENT_ID`, `TINA_TOKEN`, `VITE_TINA_BRANCH` (if connecting Tina Cloud)
5. Deploy!

### Deployment Method B: Wrangler CLI

```bash
# 1. Build the production application
npm run build

# 2. Deploy directly via Wrangler
npx wrangler pages deploy dist --project-name=hairbyapril
```

---

## 🧪 Automated Verification & Audits

Run the full audit suite to ensure code health, build integrity, and SEO compliance:

```bash
# Run the 35-point SEO, LCP, and CDN configuration audit
npm run test:seo

# Run Knip unused file, export, and dependency auditor
npm run knip

# Run ESLint and TypeScript compilation checks
npm run lint

# Run all quality audits together
npm run audit
```
