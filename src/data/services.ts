import { SITE_CONFIG, ServiceItem } from "../config/site";

export interface Service extends ServiceItem {
  category: "curly" | "vintage" | "events";
  deliverables: string[];
  calSlug?: string;
  isCustomInquiry?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "curly-cut-finish",
    category: "curly",
    name: "Curly Hair Cut & Finish",
    price: "$175",
    duration: "90 mins",
    description:
      "Customized cutting, shaping, and styling tailored to your natural wave and curl pattern.",
    deliverables: [
      "Customized haircut & curl styling",
      "Cleansing & conditioning wash",
      "Natural curl styling & finish",
      "At-home routine guidance",
    ],
    calSlug: SITE_CONFIG.calDefaultSlug,
  },
  {
    id: "vintage-set-updo",
    category: "vintage",
    name: "Vintage Hair & Updos",
    price: "$145",
    duration: "90 mins",
    description:
      "Classic victory rolls, bumper bangs, waves, and pin-up styling built for longevity.",
    deliverables: [
      "Classic victory rolls, bumper bangs, or retro waves",
      "Secure pin placement built for all-day hold",
      "Vintage updo or brush-out",
      "Accessories & hair flower placement",
    ],
    calSlug: SITE_CONFIG.calDefaultSlug,
  },
];

export const CLIENT_BIO = {
  name: SITE_CONFIG.stylistName,
  credentials: SITE_CONFIG.credentials,
  location: SITE_CONFIG.locationDisplay,
  studioName: SITE_CONFIG.studioName,
  email: SITE_CONFIG.email,
  phone: SITE_CONFIG.phone,
  phoneDisplay: SITE_CONFIG.phoneDisplay,
  phoneTel: SITE_CONFIG.phoneTel,
  logisticsNotice: SITE_CONFIG.logisticsNotice,
  instagram: SITE_CONFIG.instagram,
  instagramUrl: SITE_CONFIG.instagramUrl,
  calUsername: SITE_CONFIG.calUsername,
  calDefaultSlug: SITE_CONFIG.calDefaultSlug,
  googleSheetUrl: SITE_CONFIG.googleSheetUrl,
  heroImage: SITE_CONFIG.heroPreloadImage,
  heroHeading: SITE_CONFIG.heroHeading,
  heroSubtext: SITE_CONFIG.heroSubtext,
};
