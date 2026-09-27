import { defineConfig } from "tinacms";

// Your hosting provider will set these environment variables automatically in production
const branch =
  (typeof process !== "undefined"
    ? process.env?.VITE_TINA_BRANCH
    : undefined) ||
  import.meta.env?.VITE_TINA_BRANCH ||
  (typeof process !== "undefined" ? process.env?.CF_PAGES_BRANCH : undefined) ||
  (typeof process !== "undefined" ? process.env?.HEAD : undefined) ||
  "main";

const clientId =
  (typeof process !== "undefined"
    ? process.env?.VITE_TINA_CLIENT_ID
    : undefined) ||
  import.meta.env?.VITE_TINA_CLIENT_ID ||
  "87e12abe-90fc-43a9-9f88-48270c37724d"; // Default to configured project client ID

const token =
  (typeof process !== "undefined" ? process.env?.TINA_TOKEN : undefined) ||
  import.meta.env?.TINA_TOKEN || // Check for VITE_TINA_TOKEN as well
  null; // Obtain from o.tina.io

const searchToken =
  (typeof process !== "undefined"
    ? process.env?.TINA_SEARCH_TOKEN
    : undefined) ||
  import.meta.env?.TINA_SEARCH_TOKEN ||
  import.meta.env?.VITE_TINA_SEARCH_TOKEN ||
  null;

if (!clientId) {
  console.warn(
    "⚠️ [TinaCMS Warning] VITE_TINA_CLIENT_ID is not set or is null! Admin login will redirect with clientId=null. Please configure VITE_TINA_CLIENT_ID in your environment variables."
  );
} else {
  console.log("✅ [TinaCMS Info] VITE_TINA_CLIENT_ID loaded successfully.");
}

if (!token) {
  console.warn(
    "⚠️ [TinaCMS Warning] TINA_TOKEN is not set or is null! Content queries may fail in production. Please configure TINA_TOKEN in your environment variables."
  );
} else {
  console.log("✅ [TinaCMS Info] TINA_TOKEN loaded successfully.");
}

if (!searchToken) {
  console.warn(
    "⚠️ [TinaCMS Warning] TINA_SEARCH_TOKEN is not set or is null! Search indexing will be disabled. Set TINA_SEARCH_TOKEN to enable TinaCloud search."
  );
} else {
  console.log(
    "✅ [TinaCMS Info] TINA_SEARCH_TOKEN loaded successfully. Search indexing enabled."
  );
}

export default defineConfig({
  branch,
  clientId,
  token,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      // SINGLE UNIFIED PAGE SCHEMA (Single Source of Truth for the Single-Page Site)
      {
        name: "page",
        label: "Home Page",
        path: "src/content",
        match: { include: "page" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          // 1. HERO SECTION
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              { type: "string", name: "badge", label: "Credentials Badge" },
              {
                type: "string",
                name: "headline",
                label: "Main Headline",
                required: true,
              },
              {
                type: "string",
                name: "subheading",
                label: "Subheading Copy",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "availabilityNotice",
                label: "Availability Notice Banner",
                required: true,
                ui: { component: "textarea" },
              },
            ],
          },

          // 2. SERVICES & PRICING
          {
            type: "object",
            name: "services",
            label: "Services & Pricing",
            fields: [
              { type: "string", name: "sectionTitle", label: "Section Title" },
              {
                type: "object",
                name: "servicesList",
                label: "Service Offerings",
                list: true,
                ui: {
                  itemProps: (item: any) => ({
                    label: `${item?.name || "New Service"} (${item?.price || 0})`,
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "id",
                    label: "Service Slug ID",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "name",
                    label: "Service Name",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "price",
                    label: "Price Display (e.g. $175)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "duration",
                    label: "Estimated Duration",
                    description: "e.g., 2 hrs, 90 mins",
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Short Description",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "deliverables",
                    label: "Included Features",
                    list: true,
                    description:
                      "Bullet points detailing what is included in this service",
                  },
                  {
                    type: "string",
                    name: "calSlug",
                    label: "Cal.com Scheduling Slug Override",
                    description:
                      "Optional override slug for this specific service. Leave blank to use default Cal.com slug from Site Settings.",
                  },
                ],
              },
            ],
          },

          // 3. PORTFOLIO & MEDIA SHOWCASE
          {
            type: "object",
            name: "portfolio",
            label: "Portfolio & Media Showcase",
            fields: [
              {
                type: "image",
                name: "heroImage",
                label: "Hero Showcase Image (Preloaded)",
                description:
                  "Main hero image displayed on initial page load (optimized for LCP)",
              },
              {
                type: "image",
                name: "ogImage",
                label: "Social Share Image (OpenGraph / Twitter)",
                description:
                  "Image displayed when sharing links on social media / iMessage",
              },
              {
                type: "string",
                name: "ogImageAlt",
                label: "Social Share Image Alt Text",
              },
              {
                type: "object",
                name: "portfolioList",
                label: "Showcase Images Gallery",
                list: true,
                ui: {
                  itemProps: (item: any) => ({
                    label: item?.id || "Portfolio Item",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "id",
                    label: "Image ID (slug)",
                    required: true,
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Photo",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "alt",
                    label: "Alt Text Description",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "tag",
                    label: "Style Category",
                    options: [
                      "Curly Cut",
                      "Vintage Styling",
                      "Updos",
                      "Events & Production",
                    ],
                  },
                ],
              },
            ],
          },

          // 4. INQUIRY & MAILING LIST FORM
          {
            type: "object",
            name: "events",
            label: "Inquiry & Mailing List Form",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Form Section Title",
                description:
                  "Main section heading for inquiry & mailing list form",
              },
              {
                type: "string",
                name: "description",
                label: "Form Section Description",
                description:
                  "Header copy explaining inquiry or mailing list details",
                ui: { component: "textarea" },
              },
              {
                type: "boolean",
                name: "showForm",
                label: "Display Inquiry Form on Site?",
                description:
                  "Toggle off to completely remove the form from the public website",
              },
              {
                type: "object",
                name: "formFields",
                label: "Inquiry Form Fields",
                list: true,
                templates: [
                  {
                    name: "inputField",
                    label: "Text / Contact Input",
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "fieldType",
                        label: "Input Type",
                        options: ["text", "email", "tel", "date", "number"],
                      },
                      {
                        type: "string",
                        name: "placeholder",
                        label: "Placeholder Hint",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                      },
                    ],
                  },
                  {
                    name: "selectField",
                    label: "Dropdown Select Menu",
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "options",
                        label: "Dropdown Options",
                        list: true,
                        description: "Options the client can pick from",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                      },
                    ],
                  },
                  {
                    name: "textareaField",
                    label: "Multi-line Text Area",
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "placeholder",
                        label: "Placeholder Hint",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                      },
                    ],
                  },
                ],
              },
              {
                type: "object",
                name: "formOptions",
                label: "Inquiry Form Options",
                fields: [
                  {
                    type: "string",
                    name: "submitButtonText",
                    label: "Submit Button Text",
                  },
                ],
              },
            ],
          },

          // 5. SITE SETTINGS & SEO
          {
            type: "object",
            name: "site",
            label: "Site Settings & SEO",
            fields: [
              {
                type: "string",
                name: "studioName",
                label: "Studio Name",
                required: true,
              },
              {
                type: "string",
                name: "stylistName",
                label: "Stylist Name",
                required: true,
              },
              {
                type: "string",
                name: "title",
                label: "Browser Title (SEO)",
              },
              {
                type: "string",
                name: "description",
                label: "Meta Description (SEO)",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "keywords",
                label: "SEO Keywords",
                list: true,
              },
              {
                type: "string",
                name: "email",
                label: "Direct Email Address",
                description: "Used for public display and contact routing",
              },
              {
                type: "string",
                name: "phone",
                label: "Direct Phone Number",
                description: "Formats automatically on site links",
              },
              {
                type: "string",
                name: "instagramHandle",
                label: "Instagram Handle (@...)",
                description: "Enter handle only (e.g. hair.by.april_209)",
              },
              {
                type: "string",
                name: "locationDisplay",
                label: "Location Display Text",
              },
              {
                type: "string",
                name: "calUsername",
                label: "Cal.com Username",
                description:
                  "Your Cal.com scheduling username (e.g. ariel-anders)",
              },
              {
                type: "string",
                name: "calDefaultSlug",
                label: "Cal.com Default Event Slug",
                description:
                  "Default event booking slug used by the Hero and general booking buttons (e.g. april-demo)",
              },
              {
                type: "object",
                name: "address",
                label: "Physical / Service Address",
                fields: [
                  {
                    type: "string",
                    name: "locality",
                    label: "City / Locality",
                  },
                  { type: "string", name: "region", label: "State / Region" },
                  { type: "string", name: "country", label: "Country Code" },
                ],
              },
              {
                type: "object",
                name: "geo",
                label: "Geographic Coordinates",
                fields: [
                  { type: "number", name: "latitude", label: "Latitude" },
                  { type: "number", name: "longitude", label: "Longitude" },
                ],
              },
              {
                type: "string",
                name: "areaServed",
                label: "Areas Served",
                list: true,
              },
              {
                type: "string",
                name: "openingDays",
                label: "Opening Days",
                list: true,
              },
              {
                type: "object",
                name: "openingHours",
                label: "Opening Hours",
                fields: [
                  {
                    type: "string",
                    name: "opens",
                    label: "Opening Time (HH:MM)",
                  },
                  {
                    type: "string",
                    name: "closes",
                    label: "Closing Time (HH:MM)",
                  },
                ],
              },
              { type: "string", name: "priceRange", label: "Price Range" },
            ],
          },
        ],
      },
    ],
  },

  search: searchToken
    ? {
        tina: {
          indexerToken: searchToken,
          stopwordLanguages: ["eng"],
          fuzzyEnabled: true,
          fuzzyOptions: {
            maxDistance: 2,
            minSimilarity: 0.6,
            maxTermExpansions: 10,
            useTranspositions: true,
          },
        },
        indexBatchSize: 100,
        maxSearchIndexFieldLength: 100,
      }
    : undefined,
});
