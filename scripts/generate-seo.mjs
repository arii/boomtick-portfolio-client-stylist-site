import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sitePath = path.join(rootDir, "src/content/site.json");
const heroPath = path.join(rootDir, "src/content/hero.json");
const servicesPath = path.join(rootDir, "src/content/services.json");

if (
  !fs.existsSync(sitePath) ||
  !fs.existsSync(heroPath) ||
  !fs.existsSync(servicesPath)
) {
  console.error("❌ Missing required CMS content files in src/content/");
  process.exit(1);
}

const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const hero = JSON.parse(fs.readFileSync(heroPath, "utf8"));
const servicesRaw = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
const services = Array.isArray(servicesRaw) ? servicesRaw : (servicesRaw.servicesList || []);

const siteUrl = (
  process.env.VITE_SITE_URL ||
  process.env.CF_PAGES_URL ||
  "https://hairbyapril.pages.dev"
).replace(/\/+$/, "");
const canonicalUrl = `${siteUrl}/`;
const today = new Date().toISOString().split("T")[0];

console.log(
  "⚙️  Generating SEO, Schema.org, sitemap.xml, robots.txt, and llms.txt from CMS config..."
);
console.log(`   Canonical Base URL: ${canonicalUrl}`);

// 1. Generate Sitemap XML
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

fs.writeFileSync(
  path.join(rootDir, "public/sitemap.xml"),
  sitemapContent,
  "utf8"
);

// 2. Generate Robots TXT
const robotsContent = `User-agent: *
Allow: /

# Explicit allowances for LLM / AI Search Indexers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${canonicalUrl}sitemap.xml
`;

fs.writeFileSync(
  path.join(rootDir, "public/robots.txt"),
  robotsContent,
  "utf8"
);

const instaHandle = (site.instagramHandle || "hair.by.april_209").replace(/^@/, "");
const instagramUrl = `https://www.instagram.com/${instaHandle}/`;

// 3. Generate llms.txt
const servicesList = services
  .map(
    (s) =>
      `- **${s.name}** — ${s.price} (${s.duration || "90 mins"})\n  - ${s.description}`
  )
  .join("\n");

const llmsContent = `# ${site.studioName}

> ${site.description}

## Overview
- **Stylist:** ${site.stylistName}
- **Experience:** ${hero.badge}
- **Service Area:** ${site.locationDisplay} (${hero.availabilityNotice})
- **Website:** ${canonicalUrl}

## Contact Information
- **Email:** ${site.email}
- **Phone / SMS:** ${site.phone}
- **Instagram:** ${instagramUrl} (@${instaHandle})

## Services & Pricing
${servicesList}
- **Weddings, Productions & Events** — Custom Quote
  - On-location hair styling for bridal parties, commercial shoots, vintage events, and theatrical productions.

## How to Book
- **Direct Appointments:** Book individual appointments online directly on the website via Cal.com.
- **Events & Collaborations:** Submit event specifics via the on-site inquiry form, or email ${site.email} / text ${site.phone}.
`;

fs.writeFileSync(path.join(rootDir, "public/llms.txt"), llmsContent, "utf8");
fs.writeFileSync(path.join(rootDir, "llms.txt"), llmsContent, "utf8");

// 4. Generate dynamic Schema.org HairSalon JSON-LD
const serviceImages = {
  "curly-cut-finish": `${siteUrl}/assets/portfolio-2.webp`,
  "vintage-set-updo": `${siteUrl}/assets/portfolio-1.webp`,
};

const serviceOffers = services.map((s) => ({
  "@type": "Offer",
  itemOffered: {
    "@type": "Service",
    name: s.name,
    description: s.description,
    ...(serviceImages[s.id] ? { image: serviceImages[s.id] } : {}),
  },
  price: (s.price || "").replace(/[^0-9]/g, "") || "150",
  priceCurrency: "USD",
}));

serviceOffers.push({
  "@type": "Offer",
  itemOffered: {
    "@type": "Service",
    name: "On-Location Events & Collaborations",
    description:
      "Weddings, bridal parties, editorial shoots, swing dance camps, and retro pageants across the Bay Area.",
    image: `${siteUrl}/assets/portfolio-3.webp`,
  },
  priceSpecification: {
    "@type": "PriceSpecification",
    priceCurrency: "USD",
    description: "Custom Quote",
  },
});

const cleanPhoneDigits = (site.phone || "").replace(/[^0-9]/g, "");
const telephoneSchema = `+1-${cleanPhoneDigits.slice(0, 3)}-${cleanPhoneDigits.slice(3, 6)}-${cleanPhoneDigits.slice(6)}`;

const schemaOrgData = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: site.studioName,
  image: (site.portfolioImagesRelative || []).map((p) => `${siteUrl}${p}`),
  description: site.description,
  telephone: telephoneSchema,
  email: site.email,
  url: canonicalUrl,
  priceRange: site.priceRange,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.geo.latitude,
    longitude: site.geo.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: site.openingDays,
      opens: site.openingHours.opens,
      closes: site.openingHours.closes,
    },
  ],
  areaServed: {
    "@type": "AdministrativeArea",
    name: "San Francisco, CA",
  },
  sameAs: [`https://www.instagram.com/${(site.instagramHandle || site.instagram || "hair.by.april_209").replace("@", "")}/`],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Styling Services",
    itemListElement: serviceOffers,
  },
};

// 5. Update index.html dynamically to eliminate any hardcoded mismatches
const indexPath = path.join(rootDir, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(
  /<title>[\s\S]*?<\/title>/i,
  `<title>${site.title}</title>`
);
html = html.replace(
  /<meta\s+name="description"\s+content="[^"]*"/i,
  `<meta name="description" content="${site.description}"`
);
html = html.replace(
  /<meta\s+name="keywords"\s+content="[^"]*"/i,
  `<meta name="keywords" content="${site.keywords.join(", ")}"`
);
html = html.replace(
  /<meta\s+name="author"\s+content="[^"]*"/i,
  `<meta name="author" content="${site.studioName}"`
);
html = html.replace(
  /<link\s+rel="canonical"\s+href="[^"]*"/i,
  `<link rel="canonical" href="${canonicalUrl}"`
);
html = html.replace(
  /<meta\s+property="og:title"\s+content="[^"]*"/i,
  `<meta property="og:title" content="${site.title}"`
);
html = html.replace(
  /<meta\s+property="og:site_name"\s+content="[^"]*"/i,
  `<meta property="og:site_name" content="${site.studioName}"`
);
html = html.replace(
  /<meta\s+property="og:description"\s+content="[^"]*"/i,
  `<meta property="og:description" content="${site.description}"`
);
html = html.replace(
  /<meta\s+property="og:url"\s+content="[^"]*"/i,
  `<meta property="og:url" content="${canonicalUrl}"`
);
html = html.replace(
  /<meta\s+property="og:image"\s+content="[^"]*"/i,
  `<meta property="og:image" content="${siteUrl}${site.ogImageRelative}"`
);
html = html.replace(
  /<meta\s+property="og:image:alt"\s+content="[^"]*"/i,
  `<meta property="og:image:alt" content="${site.ogImageAlt}"`
);
html = html.replace(
  /<meta\s+name="twitter:title"\s+content="[^"]*"/i,
  `<meta name="twitter:title" content="${site.title}"`
);
html = html.replace(
  /<meta\s+name="twitter:description"\s+content="[^"]*"/i,
  `<meta name="twitter:description" content="${site.description}"`
);
html = html.replace(
  /<meta\s+name="twitter:image"\s+content="[^"]*"/i,
  `<meta name="twitter:image" content="${siteUrl}${site.ogImageRelative}"`
);
html = html.replace(
  /<meta\s+name="twitter:image:alt"\s+content="[^"]*"/i,
  `<meta name="twitter:image:alt" content="${site.ogImageAlt}"`
);
html = html.replace(
  /<script\s+type="application\/ld\+json"\s+id="schema-org-jsonld">[\s\S]*?<\/script>/i,
  `<script type="application/ld+json" id="schema-org-jsonld">\n${JSON.stringify(schemaOrgData, null, 2)}\n    </script>`
);

fs.writeFileSync(indexPath, html, "utf8");

// Also copy to dist if dist exists
const distDir = path.join(rootDir, "dist");
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapContent, "utf8");
  fs.writeFileSync(path.join(distDir, "robots.txt"), robotsContent, "utf8");
  fs.writeFileSync(path.join(distDir, "llms.txt"), llmsContent, "utf8");
}

console.log(
  "✅ Dynamic SEO files and schema.org successfully generated from CMS config!"
);
