# Hair Salon & Stylist Web Application

A high-performance, SEO-optimized, and fully configurable web application crafted for hairstylists, salons, and beauty studios. Built with **React 18+**, **TypeScript**, **Tailwind CSS**, and **Vite**, this project is engineered for easy future reuse and zero-friction deployment to any static CDN or edge platform.

---

## 📋 Table of Contents

1. [Architecture & Configurability](#-architecture--configurability)
2. [Environment Variables Reference](#-environment-variables-reference)
3. [Customizing Services & Portfolio](#-customizing-services--portfolio)
4. [Design System & Styling Tokens](#-design-system--styling-tokens)
5. [Connecting Inquiries to Google Sheets](#-connecting-inquiries-to-google-sheets)
6. [Deployment to Static Hosting / CDNs](#-deployment-to-static-hosting--cdns)
7. [Automated Verification & Audits](#-automated-verification--audits)

---

## ⚙️ Architecture & Configurability

The project features a **centralized configuration architecture** designed to be cloned and customized for any stylist or salon without modifying component code:

- **Single Source of Truth (`src/config/site.ts`)**: Consolidates all business identity, direct contact information, geographical coordinates, social links, and SEO metadata.
- **Dynamic SEO & Schema.org**: The Vite build pipeline (`vite.config.ts`) dynamically injects canonical tags, OpenGraph data, and a pre-rendered Schema.org `HairSalon` JSON-LD payload directly into the static HTML bundle.
- **Modular Data Collections**:
  - Services catalog: `src/data/services.ts`
  - Portfolio showcase images: `src/data/portfolio.ts`
  - Design tokens: `src/styles/tokens.ts`

---

## 🔑 Environment Variables Reference

To make deployment and branding incredibly clean, all visual styling, copy, contact numbers, hours, and descriptions are defined directly in code as a unified static config inside `src/config/site.ts`.

Only technical integrations, API endpoints, and platform-specific environment settings remain in your `.env` or hosting provider dashboards:

| Variable Name           | Default Value                    | Description                                                            |
| :---------------------- | :------------------------------- | :--------------------------------------------------------------------- |
| `VITE_SITE_URL`         | `https://hairbyapril.vercel.app` | Production root URL (used for canonical links, sitemap, and OpenGraph) |
| `VITE_CAL_USERNAME`     | `ariel-anders`                   | Cal.com username for embedded booking modal                            |
| `VITE_CAL_DEFAULT_SLUG` | `april-demo`                     | Default Cal.com event type slug                                        |
| `VITE_GOOGLE_SHEET_URL` | `""`                             | Google Apps Script webhook for form lead capture                       |

To deploy for a new client, duplicate `.env.example` to `.env` and customize these integration values. All content edits should be made directly in `src/config/site.ts`.

---

## 💇 Customizing Services & Portfolio

### 1. Updating the Service Catalog (`src/data/services.ts`)

Services are defined as typed objects in `SERVICES`. Each item supports custom deliverables, pricing, duration, and individual Cal.com booking slugs:

```typescript
export const SERVICES: Service[] = [
  {
    id: "curly-cut-finish",
    category: "curly",
    name: "Curly Hair Cut & Finish",
    price: "$175",
    duration: "90 mins",
    description: "Customized cutting and shaping for your curl pattern.",
    deliverables: [
      "Customized haircut & curl styling",
      "Cleansing & conditioning wash",
      "At-home routine guidance",
    ],
    calSlug: "curly-cut", // routes modal directly to this Cal.com event
  },
  // Add additional services here...
];
```

### 2. Updating Showcase Photos (`src/data/portfolio.ts`)

The style gallery loads photos from `SHOWCASE_IMAGES`. Replace image URLs and descriptions to showcase real client work:

```typescript
export const SHOWCASE_IMAGES: ShowcaseImage[] = [
  {
    id: "showcase-curly-cut",
    image: "/images/portfolio-curly.webp", // Local file or remote CDN URL
    alt: "Dry curly haircut and shape definition by April",
    tag: "Curly Cut",
  },
  // ...
];
```

---

## 🎨 Design System & Styling Tokens

The application strictly avoids arbitrary inline CSS by leveraging semantic design tokens in `src/styles/tokens.ts`:

- `TOKENS.button.primary`: Standard pill CTA button
- `TOKENS.button.navAction`: Polished header navigation action
- `TOKENS.card.base`: Standard surface card with responsive border radius
- `TOKENS.input.text`: Styled form inputs with focus rings
- `TOKENS.badge.credentials`: Subtle brand credential pill

To adjust the primary brand aesthetic (e.g. switching from rose to emerald or copper), modify the `@theme` block in `src/index.css` and the color tokens in `src/styles/tokens.ts`.

---

## 📊 Connecting Inquiries to Google Sheets

The **Inquiry Module** allows clients to request wedding parties and event styling. Submissions can be piped directly into a Google Sheet without setting up a database:

### Step 1: Create Your Google Sheet

Create a new Google Sheet and set the first row (A1 to G1) as:
`Timestamp`, `Name`, `Email`, `Phone`, `EventType`, `PartySize`, `DateLocation`, `Notes`

### Step 2: Add Google Apps Script

1. Navigate to **Extensions** > **Apps Script** in the spreadsheet menu.
2. Paste the following script into `Code.gs`:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.phone,
      data.eventType,
      data.partySize,
      data.dateLocation,
      data.notes,
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Deploy** > **New Deployment** > Select **Web app**.
4. Set **Execute as** to `Me`, and **Who has access** to `Anyone`.
5. Deploy and copy the Web App URL.

### Step 3: Set Environment Variable

Add the URL to your deployment environment:

```env
VITE_GOOGLE_SHEET_URL="https://script.google.com/macros/s/.../exec"
```

---

## 🚀 Deployment to Static Hosting / CDNs

This project is pre-configured for static single-page application (SPA) hosting across all major providers. Build output is generated in `dist/`.

### 1. Vercel

- Zero-config deployment.
- `vercel.json` is included at the root, configuring SPA rewrites, clean URLs, security headers, and static asset caching policies.
- Command: `vercel --prod` or link your GitHub repository.

### 2. Cloudflare Pages

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- Cloudflare Pages automatically honors `public/_headers` and `public/_redirects` included in this repository.

### 3. Netlify

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- The bundled `public/_redirects` ensures all client-side routes fallback cleanly to `index.html`.

### 4. GitHub Pages / AWS S3 / CloudFront

- The build produces `dist/404.html` (an automatic redirect script) ensuring deep links resolve properly on static servers without rewrite rules.

---

## 🧪 Automated Verification & Audits

Run the quality suites before committing or deploying:

```bash
# 1. Full static build (injects dynamic canonical URL, sitemap, and Schema.org)
npm run build

# 2. Run the 35-point SEO, LCP, and CDN configuration audit
npm run test:seo

# 3. Run ESLint and TypeScript checks
npm run lint

# 4. Run Knip unused dependency & export auditor
npm run audit:knip

# 5. Format all project files
npm run format
```
