/**
 * Unified Site & Business Configuration
 *
 * Single source of truth for SEO metadata, business contact info,
 * canonical URLs, scheduling details, and dynamic Schema.org generation.
 */

import siteContent from "../content/site.json";
import heroData from "../content/hero.json";
import eventsData from "../content/events.json";
import servicesData from "../content/services.json";
import portfolioData from "../content/portfolio.json";
import type {
  SiteContent,
  HeroContent,
  EventsContent,
  ServiceItem,
  PortfolioItem,
} from "../types/content";

const SITE_CONTENT: SiteContent = siteContent as SiteContent;
export const HERO_CONTENT: HeroContent = heroData as HeroContent;
export const EVENTS_CONTENT: EventsContent = eventsData as EventsContent;
export const SERVICES_CONTENT: ServiceItem[] = servicesData as ServiceItem[];
export const PORTFOLIO_CONTENT: PortfolioItem[] =
  portfolioData as PortfolioItem[];

/**
 * Resolve deployment canonical URL for Cloudflare Pages and local dev.
 */
function resolveSiteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (typeof process !== "undefined" && process.env) {
    if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL;
    if (process.env.CF_PAGES_URL) {
      const cf = process.env.CF_PAGES_URL;
      return cf.startsWith("http") ? cf : `https://${cf}`;
    }
  }
  return "https://hairbyapril.pages.dev";
}

const cleanSiteUrl = resolveSiteUrl().replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/`;

const basePhone = SITE_CONTENT.phone;
const cleanPhoneDigits = basePhone.replace(/[^0-9]/g, "");

// ==========================================
// UNIFIED BRAND & SITE CONFIGURATION
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
  instagram: SITE_CONTENT.instagram,
  instagramUrl: HERO_CONTENT.instagramUrl,

  // Integrations & Logistics
  calUsername: "ariel-anders",
  calDefaultSlug: "april-demo",
  googleSheetUrl:
    (typeof process !== "undefined" && process.env?.VITE_GOOGLE_SHEET_URL) ||
    "",
  locationDisplay: SITE_CONTENT.locationDisplay,
  logisticsNotice: HERO_CONTENT.availabilityNotice,

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

  // Media
  ogImage: `${cleanSiteUrl}${SITE_CONTENT.ogImageRelative}`,
  ogImageFallback: `${cleanSiteUrl}${SITE_CONTENT.ogImageFallbackRelative}`,
  ogImageAlt: SITE_CONTENT.ogImageAlt,
  ogImageWidth: SITE_CONTENT.ogImageWidth,
  ogImageHeight: SITE_CONTENT.ogImageHeight,
  heroPreloadImage: SITE_CONTENT.heroPreloadImage,
  portfolioImages: SITE_CONTENT.portfolioImagesRelative.map(
    (p) => `${cleanSiteUrl}${p}`
  ),
};

export type SiteConfig = typeof SITE_CONFIG;

/**
 * Dynamically builds a Schema.org HairSalon / LocalBusiness JSON-LD structure.
 */
export function generateSiteSchema(
  config: SiteConfig = SITE_CONFIG,
  services: ServiceItem[] = SERVICES_CONTENT
) {
  const baseUrl = config.canonicalUrl.replace(/\/+$/, "");

  const serviceImages: Record<string, string> = {
    "curly-cut-finish": `${baseUrl}/assets/portfolio-2.webp`,
    "vintage-set-updo": `${baseUrl}/assets/portfolio-1.webp`,
  };

  const itemListElement = services.map((service) => {
    const rawPrice = service.price.replace(/[^0-9]/g, "");
    return {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        ...(serviceImages[service.id]
          ? { image: serviceImages[service.id] }
          : {}),
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
    telephone: config.telephoneSchema,
    email: config.email,
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
        dayOfWeek:
          config.openingDays.length === 1
            ? config.openingDays[0]
            : config.openingDays,
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
