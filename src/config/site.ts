/**
 * Unified Site & Business Configuration
 *
 * Single source of truth for SEO metadata, business contact info,
 * canonical URLs, scheduling details, and dynamic Schema.org generation.
 */

import pageData from "../content/page.json";
import type {
  SiteContent,
  HeroContent,
  EventsContent,
  ServiceItem,
  PortfolioItem,
  PageContent,
  FAQContent,
} from "../types/content";

const rawPage = pageData as PageContent;

const SITE_CONTENT: SiteContent = rawPage.site;
export const HERO_CONTENT: HeroContent = rawPage.hero;
export const EVENTS_CONTENT: EventsContent = rawPage.events;
export const SERVICES_CONTENT: ServiceItem[] = rawPage.services.servicesList;
export const PORTFOLIO_CONTENT: PortfolioItem[] =
  rawPage.portfolio.portfolioList;

/**
 * Resolve deployment canonical URL for Cloudflare Pages and local dev.
 */
function resolveSiteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (typeof process !== "undefined" && process.env) {
    if (
      process.env.VITE_SITE_URL &&
      !process.env.VITE_SITE_URL.includes("localhost")
    ) {
      return process.env.VITE_SITE_URL;
    }
    if (process.env.CF_PAGES_URL) {
      const cf = process.env.CF_PAGES_URL;
      return cf.startsWith("http") ? cf : `https://${cf}`;
    }
  }
  return "https://hairbyapril.pages.dev";
}

const DEFAULT_DEPLOYMENT_ID =
  "AKfycbzcKzeTp7qNkMgNk_MJkj9zjPpkkU3CI8QmJsTbIM6eY-SNEcr0V4lUVEE5xwRzdBD7Ag";

const deploymentId =
  (typeof process !== "undefined" && process.env && process.env.DEPLOYMENT_ID
    ? process.env.DEPLOYMENT_ID.trim()
    : "") ||
  (typeof import.meta !== "undefined" && import.meta.env
    ? (
        (import.meta.env.VITE_DEPLOYMENT_ID as string) ||
        (import.meta.env.DEPLOYMENT_ID as string) ||
        ""
      ).trim()
    : "") ||
  DEFAULT_DEPLOYMENT_ID;

const webhookUrl = deploymentId
  ? `https://script.google.com/macros/s/${deploymentId}/exec`
  : `https://script.google.com/macros/s/${DEFAULT_DEPLOYMENT_ID}/exec`;

const cleanSiteUrl = resolveSiteUrl().replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/`;

const basePhone = SITE_CONTENT.phone;
const cleanPhoneDigits = basePhone.replace(/[^0-9]/g, "");

// ==========================================
// UNIFIED BRAND & SITE CONFIGURATION (SSOT)
// ==========================================
export const SITE_CONFIG = {
  // URLs & Domains
  siteUrl: cleanSiteUrl,
  canonicalUrl,

  // Business Identity
  studioName: SITE_CONTENT.studioName,
  stylistName: SITE_CONTENT.stylistName,
  credentials: HERO_CONTENT.badge,
  title: SITE_CONTENT.title,
  description: SITE_CONTENT.description,
  keywords: SITE_CONTENT.keywords,

  // Contact Info
  email: SITE_CONTENT.email,
  phone: basePhone,
  phoneDisplay: basePhone,
  phoneTel: `tel:${cleanPhoneDigits}`,
  telephoneSchema: `+1-${cleanPhoneDigits.slice(0, 3)}-${cleanPhoneDigits.slice(3, 6)}-${cleanPhoneDigits.slice(6)}`,

  // Social & Profiles
  instagram: `@${(SITE_CONTENT.instagramHandle || "").replace(/^@/, "")}`,
  instagramUrl: `https://www.instagram.com/${(SITE_CONTENT.instagramHandle || "").replace(/^@/, "")}/`,

  // Integrations & Logistics
  calUsername: SITE_CONTENT.calUsername || "ariel-anders",
  calDefaultSlug: SITE_CONTENT.calDefaultSlug || "april-demo",
  deploymentId,
  webhookUrl,
  locationDisplay: SITE_CONTENT.locationDisplay,
  logisticsNotice:
    HERO_CONTENT.availabilityNotice ||
    "On-location appointments in SF. Main availability is Mondays, Tuesdays, and Thursdays (other days by special arrangement).",

  // Address & Hours
  address: SITE_CONTENT.address,
  geo: SITE_CONTENT.geo,
  areaServed: SITE_CONTENT.areaServed,
  openingDays: SITE_CONTENT.openingDays,
  openingHours: SITE_CONTENT.openingHours,
  priceRange: SITE_CONTENT.priceRange,

  // Hero Copy
  heroHeading: HERO_CONTENT.headline,
  heroSubtext: HERO_CONTENT.subheading,

  // Media (Configured in Portfolio section)
  heroImage: rawPage.portfolio.heroImage || "/assets/portfolio-4.webp",
  heroPreloadImage: rawPage.portfolio.heroImage || "/assets/portfolio-4.webp",
  ogImage: `${cleanSiteUrl}${rawPage.portfolio.ogImage || "/assets/portfolio-4.webp"}`,
  ogImageAlt: rawPage.portfolio.ogImageAlt || SITE_CONTENT.title,
  ogImageWidth: 620,
  ogImageHeight: 758,
  portfolioImages: rawPage.portfolio.portfolioList.map(
    (p) => `${cleanSiteUrl}${p.image}`
  ),
};

export type SiteConfig = typeof SITE_CONFIG;

/**
 * Dynamically builds a Schema.org HairSalon / LocalBusiness JSON-LD structure.
 */
export function generateSiteSchema(
  config: Partial<SiteContent> & Partial<SiteConfig> = SITE_CONFIG,
  services: ServiceItem[] = SERVICES_CONTENT,
  portfolioList: PortfolioItem[] = PORTFOLIO_CONTENT,
  faq?: FAQContent
) {
  const merged = {
    ...SITE_CONFIG,
    ...config,
    address: {
      ...SITE_CONFIG.address,
      ...(config.address || {}),
    },
    geo: {
      ...SITE_CONFIG.geo,
      ...(config.geo || {}),
    },
    openingHours: {
      ...SITE_CONFIG.openingHours,
      ...(config.openingHours || {}),
    },
    openingDays: config.openingDays || SITE_CONFIG.openingDays,
    areaServed: config.areaServed || SITE_CONFIG.areaServed,
  };

  const baseUrl = (merged.canonicalUrl || SITE_CONFIG.canonicalUrl).replace(
    /\/+$/,
    ""
  );

  const rawPhone = merged.phone || SITE_CONFIG.phone;
  const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, "");
  const telephoneSchema =
    cleanPhoneDigits.length >= 10
      ? `+1-${cleanPhoneDigits.slice(0, 3)}-${cleanPhoneDigits.slice(3, 6)}-${cleanPhoneDigits.slice(6)}`
      : SITE_CONFIG.telephoneSchema;

  const rawHandle = (merged.instagramHandle || merged.instagram || "").replace(
    /^@/,
    ""
  );
  const instagramUrl =
    merged.instagramUrl ||
    (rawHandle
      ? `https://www.instagram.com/${rawHandle}/`
      : SITE_CONFIG.instagramUrl);

  const serviceImages: Record<string, string> = {
    "curly-cut-finish": `${baseUrl}/assets/curly-cut-natural-texture.jpeg`,
    "vintage-set-updo": `${baseUrl}/assets/vintage-victory-rolls.jpeg`,
    "general-haircut": `${baseUrl}/assets/fine-hair-precision-cut.jpeg`,
  };

  const itemListElement = (services || SERVICES_CONTENT)
    .filter((service) => service && (service.name || service.id)) // Filter out empty placeholder cards safely
    .map((service) => {
      const name = service.name || "Bespoke Hair Service";
      const description = service.description || "Consultation and personalized custom styling tailored to your unique hair profile.";
      const rawPrice = service.price ? service.price.replace(/[^0-9]/g, "") : "";
      const sId = service.id || `service-${Math.random().toString(36).substring(2, 9)}`;

      return {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: name,
          description: description,
          ...(sId && serviceImages[sId]
            ? { image: serviceImages[sId] }
            : {}),
        },
        price: rawPrice || "100",
        priceCurrency: "USD",
      };
    });

  // Include Custom Event booking options
  itemListElement.push({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "On-Location Events & Collaborations",
      description:
        "Group events, editorial shoots, swing dance camps, and retro pageants across the Bay Area (travel fees apply outside SF).",
      image: `${baseUrl}/assets/portfolio-3.webp`,
    },
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "USD",
      description: "Custom Quote",
    },
  } as unknown as (typeof itemListElement)[0]);

  const schemaImages = (portfolioList || PORTFOLIO_CONTENT).map(
    (p) => `${baseUrl}${p.image}`
  );

  const hairSalonSchema = {
    "@type": "HairSalon",
    "@id": `${baseUrl}/#hairsalon`,
    name: merged.studioName || SITE_CONFIG.studioName,
    image:
      schemaImages.length > 0
        ? schemaImages
        : [
            `${baseUrl}/assets/portfolio-4.webp`,
            `${baseUrl}/assets/portfolio-1.webp`,
            `${baseUrl}/assets/portfolio-2.webp`,
            `${baseUrl}/assets/portfolio-3.webp`,
            `${baseUrl}/assets/portfolio-5.webp`,
          ],
    description: merged.description || SITE_CONFIG.description,
    telephone: telephoneSchema,
    email: merged.email || SITE_CONFIG.email,
    url: merged.canonicalUrl || SITE_CONFIG.canonicalUrl,
    priceRange: merged.priceRange || SITE_CONFIG.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: merged.address.locality,
      addressRegion: merged.address.region,
      addressCountry: merged.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: merged.geo.latitude,
      longitude: merged.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek:
          merged.openingDays.length === 1
            ? merged.openingDays[0]
            : merged.openingDays,
        opens: merged.openingHours.opens,
        closes: merged.openingHours.closes,
      },
    ],
    areaServed: {
      "@type": "AdministrativeArea",
      name: Array.isArray(merged.areaServed)
        ? merged.areaServed.join(", ")
        : merged.locationDisplay || "San Francisco, CA",
    },
    sameAs: [instagramUrl],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Styling Services",
      itemListElement,
    },
  };

  const faqListToUse = faq?.faqList && faq.faqList.length > 0 ? faq.faqList : [
    {
      question: "Is service pricing restricted to San Francisco only?",
      answer: "Yes, all published menu rates are for appointments within San Francisco proper. A travel and logistics surcharge is added for out-of-town on-location styling throughout the greater San Francisco Bay Area.",
    },
    {
      question: "What exactly is a concierge hair stylist?",
      answer: "A concierge stylist brings professional, high-end salon expertise directly to you. April provides bespoke on-location hair styling, vintage updos, and cuts at your private home, hotel, commercial photo set, or event venue for ultimate convenience and zero travel stress.",
    },
    {
      question: "What are vintage victory rolls and retro Hollywood waves?",
      answer: "These are iconic, authentic mid-century hair styling techniques. Victory rolls are meticulously rolled, sculpted, and structurally set curls pinned high on the crown. S-waves (or classic Hollywood waves) are continuous, high-gloss, polished waves that create a continuous ribbon-like ripple down the hair, popular in 1940s and 50s fashion.",
    },
  ];

  const faqPageSchema = {
    "@type": "FAQPage",
    "@id": `${baseUrl}/#faq`,
    mainEntity: faqListToUse.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [hairSalonSchema, faqPageSchema],
  };
}
