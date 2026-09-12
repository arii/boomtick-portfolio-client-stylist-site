/**
 * Unified Site & Business Configuration
 *
 * Single source of truth for SEO metadata, business contact info,
 * canonical URLs, scheduling details, and dynamic Schema.org generation.
 */

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  description: string;
  duration?: string;
  deliverables?: string[];
}

/**
 * Helper to retrieve environment variables safely.
 */
function getEnvVar(key: string, fallback: string): string {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key]
  ) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
}

// ==========================================
// 1. INTEGRATIONS & DEPLOYMENT CONFIG (Env-Based)
// ==========================================
/**
 * Detects the active deployment URL dynamically from standard hosting environments:
 * - VITE_SITE_URL: User-defined custom production URL
 * - CF_PAGES_URL: Cloudflare Pages build/deployment URL
 * - CF_PAGES: Cloudflare Pages build indicator
 * - VERCEL_URL: Vercel deployment URL
 * - URL: Netlify site URL
 */
function resolveSiteUrl(): string {
  // If running in browser, check if hosted on Cloudflare Pages or custom domain
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    if (
      origin.includes("hairbyapril.pages.dev") ||
      origin.includes("hairbyapril.dev")
    ) {
      return origin;
    }
  }

  const customUrl = getEnvVar("VITE_SITE_URL", "");
  if (customUrl) return customUrl;

  const cfUrl = getEnvVar("CF_PAGES_URL", "");
  if (cfUrl) return cfUrl.startsWith("http") ? cfUrl : `https://${cfUrl}`;

  const cfPages = getEnvVar("CF_PAGES", "");
  if (cfPages === "1") {
    return "https://hairbyapril.pages.dev";
  }

  const vercelUrl = getEnvVar("VERCEL_URL", "");
  if (vercelUrl) return `https://${vercelUrl}`;

  const netlifyUrl = getEnvVar("URL", "");
  if (netlifyUrl) return netlifyUrl;

  return "https://hairbyapril.pages.dev";
}

const rawSiteUrl = resolveSiteUrl();
const cleanSiteUrl = rawSiteUrl.replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/`;

const calUsername = getEnvVar("VITE_CAL_USERNAME", "ariel-anders");
const calDefaultSlug = getEnvVar("VITE_CAL_DEFAULT_SLUG", "april-demo");

const rawGoogleSheetValue = getEnvVar("VITE_GOOGLE_SHEET_URL", "");
const googleAppDeploymentId = getEnvVar(
  "VITE_GOOGLE_APP_DEPLOYMENT_ID",
  "AKfycbzcKzeTp7qNkMgNk_MJkj9zjPpkkU3CI8QmJsTbIM6eY-SNEcr0V4lUVEE5xwRzdBD7Ag"
);

let googleSheetUrl = "";
if (googleAppDeploymentId) {
  googleSheetUrl = `https://script.google.com/macros/s/${googleAppDeploymentId}/exec`;
} else if (rawGoogleSheetValue) {
  if (
    rawGoogleSheetValue.startsWith("http://") ||
    rawGoogleSheetValue.startsWith("https://")
  ) {
    googleSheetUrl = rawGoogleSheetValue;
  } else {
    googleSheetUrl = `https://script.google.com/macros/s/${rawGoogleSheetValue}/exec`;
  }
}

// ==========================================
// 2. CONTACT SCHEMAS AUTO-GENERATOR
// ==========================================
const basePhone = getEnvVar("VITE_PHONE_NUMBER", ""); // Load from environment, default to not configured (empty string)
const cleanPhoneDigits = basePhone.replace(/[^0-9]/g, "");

const phoneDisplay =
  cleanPhoneDigits.length === 10
    ? `(${cleanPhoneDigits.slice(0, 3)}) ${cleanPhoneDigits.slice(3, 6)}-${cleanPhoneDigits.slice(6)}`
    : basePhone;

const phoneTel = cleanPhoneDigits ? `tel:${cleanPhoneDigits}` : "";

const telephoneSchema =
  cleanPhoneDigits.length === 10
    ? `+1-${cleanPhoneDigits.slice(0, 3)}-${cleanPhoneDigits.slice(3, 6)}-${cleanPhoneDigits.slice(6)}`
    : cleanPhoneDigits
    ? `+1-${cleanPhoneDigits}`
    : "";

const siteEmail = getEnvVar("VITE_EMAIL", ""); // Load from environment, default to not configured (empty string)

// ==========================================
// 3. BRAND & STATIC SITE CONTENT CONFIG
// ==========================================
export const SITE_CONFIG = {
  // Base URLs
  siteUrl: cleanSiteUrl,
  canonicalUrl,

  // Business Identity
  studioName: "Hair by April",
  stylistName: "April",
  credentials: "Licensed Professional • 15 Years of Experience",
  title: "Hair by April | Curly Cuts & Vintage Hair Stylist San Francisco",
  description:
    "Licensed professional specializing in curly hair cuts, vintage pin-up styling, and on-location events in San Francisco.",
  keywords: [
    "curly hair cuts San Francisco",
    "vintage hair stylist",
    "victory rolls",
    "pin-up hair SF",
    "natural curl specialist",
    "bridal hair SF",
    "retro hair styling San Francisco",
  ],

  // Contact Information
  email: siteEmail,
  phone: basePhone,
  phoneDisplay,
  phoneTel,
  telephoneSchema,

  // Social Channels
  instagram: "@hair.by.april_209",
  instagramUrl: "https://www.instagram.com/hair.by.april_209/",

  // Integrations & Scheduling (mapped from environmental variables)
  calUsername,
  calDefaultSlug,
  googleSheetUrl,

  // Location & Local SEO
  locationDisplay: "San Francisco, CA",
  logisticsNotice:
    "On-location hair stylist appointments in San Francisco. Main availability is Tuesdays.",
  address: {
    locality: "San Francisco",
    region: "CA",
    country: "US",
  },
  geo: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  areaServed: ["San Francisco", "San Francisco Bay Area"],
  openingDays: ["Tuesday"],
  openingHours: {
    opens: "09:00",
    closes: "18:00",
  },
  priceRange: "$$",

  // Hero Section Copy
  heroHeading: "Curly hair cuts & authentic vintage styling.",
  heroSubtext:
    "San Francisco stylist specializing in curly cuts and classic vintage hair, with custom on-location styling available for events and productions.",

  // Media Assets (Updated with April's styling illustrations)
  ogImage: `${cleanSiteUrl}/assets/portfolio-4.webp`,
  ogImageFallback: `${cleanSiteUrl}/assets/og-cover.jpg`,
  ogImageAlt:
    "Hair by April - Vintage Hair Styling & Curly Hair Specialist in San Francisco",
  ogImageWidth: 620,
  ogImageHeight: 758,
  heroPreloadImage: "/assets/portfolio-4.webp",
  portfolioImages: [
    `${cleanSiteUrl}/assets/portfolio-4.webp`,
    `${cleanSiteUrl}/assets/portfolio-1.webp`,
    `${cleanSiteUrl}/assets/portfolio-2.webp`,
    `${cleanSiteUrl}/assets/portfolio-3.webp`,
    `${cleanSiteUrl}/assets/portfolio-5.webp`,
  ],
};

export type SiteConfig = typeof SITE_CONFIG;

/**
 * Dynamically builds a Schema.org HairSalon / LocalBusiness JSON-LD structure
 * leveraging all unified configuration variables.
 */
export function generateSiteSchema(
  config: SiteConfig = SITE_CONFIG,
  services: ServiceItem[] = []
) {
  const baseUrl = config.canonicalUrl.replace(/\/+$/, "");

  // Ensure default catalog services if none passed
  const catalogServices =
    services.length > 0
      ? services
      : [
          {
            id: "curly-cut-finish",
            name: "Curly Hair Cut & Finish",
            price: "$175",
            description:
              "Customized cutting, shaping, and styling tailored to your natural wave and curl pattern.",
          },
          {
            id: "vintage-set-updo",
            name: "Vintage Hair & Updos",
            price: "$145",
            description:
              "Classic victory rolls, bumper bangs, waves, and pin-up styling built for longevity.",
          },
        ];

  const serviceImages: Record<string, string> = {
    "curly-cut-finish": `${baseUrl}/assets/portfolio-2.webp`,
    "vintage-set-updo": `${baseUrl}/assets/portfolio-1.webp`,
  };

  const itemListElement = catalogServices.map((service) => {
    const rawPrice = service.price.replace(/[^0-9]/g, "");
    return {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        ...(serviceImages[service.id] ? { image: serviceImages[service.id] } : {}),
      },
      price: rawPrice || "150",
      priceCurrency: "USD",
    };
  });

  // Include Custom Event inquiries option
  itemListElement.push({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "On-Location Events & Collaborations",
      description:
        "Weddings, bridal parties, editorial shoots, swing dance camps, and retro pageants across the Bay Area.",
      image: `${baseUrl}/assets/portfolio-3.webp`,
    },
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "USD",
      description: "Custom Quote",
    },
  } as unknown as (typeof itemListElement)[0]);

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: config.studioName,
    image: [
      `${baseUrl}/assets/portfolio-4.webp`,
      `${baseUrl}/assets/portfolio-1.webp`,
      `${baseUrl}/assets/portfolio-2.webp`,
      `${baseUrl}/assets/portfolio-3.webp`,
      `${baseUrl}/assets/portfolio-5.webp`,
    ],
    description: config.description,
    ...(config.telephoneSchema ? { telephone: config.telephoneSchema } : {}),
    ...(config.email ? { email: config.email } : {}),
    url: config.canonicalUrl,
    priceRange: config.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: config.address.locality,
      addressRegion: config.address.region,
      addressCountry: config.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: config.openingDays.length === 1 ? config.openingDays[0] : config.openingDays,
        opens: config.openingHours.opens,
        closes: config.openingHours.closes,
      },
    ],
    areaServed: {
      "@type": "AdministrativeArea",
      name: "San Francisco, CA",
    },
    sameAs: [config.instagramUrl],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Styling Services",
      itemListElement,
    },
  };
}
