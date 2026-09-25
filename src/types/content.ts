export interface HeroContent {
  badge: string;
  headline: string;
  subheading: string;
  availabilityNotice: string;
  calSlug?: string;
  instagramUrl?: string;
  [key: string]: unknown;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  deliverables: string[];
  calSlug?: string;
  [key: string]: unknown;
}

export interface PortfolioItem {
  id: string;
  image: string;
  alt: string;
  tag: string;
  [key: string]: unknown;
}

export interface FormFieldItem {
  _template?: "inputField" | "selectField" | "textareaField";
  label: string;
  fieldType?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  [key: string]: unknown;
}

export interface EventsContent {
  title: string;
  description: string;
  showForm?: boolean;
  formFields?: FormFieldItem[];
  formOptions?: {
    submitButtonText?: string;
  };
  [key: string]: unknown;
}

export interface SiteContent {
  studioName: string;
  stylistName: string;
  credentials: string;
  title: string;
  description: string;
  browserTitle?: string;
  metaDescription?: string;
  keywords: string[];
  email: string;
  phone: string;
  emailFallback?: string;
  phoneFallback?: string;
  instagramHandle: string;
  locationDisplay: string;
  logisticsNotice: string;
  availabilityBanner?: string;
  calUsername?: string;
  calDefaultSlug?: string;
  address: {
    locality: string;
    region: string;
    country: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  areaServed: string[];
  openingDays: string[];
  openingHours: {
    opens: string;
    closes: string;
  };
  priceRange: string;
  heroHeading: string;
  heroSubtext: string;
  ogImageRelative: string;
  ogImageFallbackRelative: string;
  ogImageAlt: string;
  ogImageWidth: number;
  ogImageHeight: number;
  heroPreloadImage: string;
  portfolioImagesRelative: string[];
  [key: string]: unknown;
}
