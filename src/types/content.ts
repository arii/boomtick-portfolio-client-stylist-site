export interface HeroContent {
  badge: string;
  headline: string;
  subheading: string;
  availabilityNotice: string;
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
  title?: string;
  image: string;
  alt: string;
  tag: string;
  [key: string]: unknown;
}

export interface PortfolioContent {
  heroImage?: string;
  ogImage?: string;
  ogImageAlt?: string;
  portfolioList: PortfolioItem[];
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
  title: string;
  description: string;
  keywords: string[];
  email: string;
  phone: string;
  instagramHandle: string;
  locationDisplay: string;
  calUsername: string;
  calDefaultSlug: string;
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
  [key: string]: unknown;
}

export interface PageContent {
  hero: HeroContent;
  services: {
    sectionTitle?: string;
    pricingNote?: string;
    servicesList: ServiceItem[];
  };
  portfolio: PortfolioContent;
  events: EventsContent;
  site: SiteContent;
}
