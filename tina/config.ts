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
              {
                type: "string",
                name: "badge",
                label: "Credentials Badge",
                description:
                  "Credentials or experience highlight displayed above the headline",
              },
              {
                type: "string",
                name: "headline",
                label: "Main Headline",
                description:
                  "Primary attention-grabbing headline for the hero section",
                required: true,
              },
              {
                type: "string",
                name: "subheading",
                label: "Subheading Copy",
                description:
                  "Secondary explanatory copy detailing your specialty, hair philosophy, and location",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "availabilityNotice",
                label: "Availability Notice Banner",
                description:
                  "Live scheduling and availability notice shown in the banner",
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
              {
                type: "string",
                name: "sectionTitle",
                label: "Section Title",
                description:
                  "Main section heading displayed above the service pricing cards",
              },
              {
                type: "string",
                name: "pricingNote",
                label: "Pricing Note / Comment",
                description:
                  "Policy comment regarding service pricing (e.g., Pricing is SF only – additional cost for out of town)",
              },
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
                  // High-Frequency Content Fields (Front & Center)
                  {
                    type: "string",
                    name: "name",
                    label: "Service Name",
                    description:
                      "Client-facing service title displayed on the public site and booking menu",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "price",
                    label: "Price Display (e.g. $175)",
                    description:
                      "Published starting rate or standard investment fee for this service",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "duration",
                    label: "Estimated Duration",
                    description:
                      "Standard appointment duration preset to maintain uniform formatting across services",
                    options: [
                      "30 mins",
                      "45 mins",
                      "60 mins",
                      "75 mins",
                      "90 mins",
                      "2 hours",
                      "2.5 hours",
                      "3 hours",
                      "3.5 hours",
                      "4 hours",
                      "Custom / Half-Day",
                    ],
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Short Description",
                    description:
                      "Overview of curl pattern suitability, styling methodology, and consultation details",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "deliverables",
                    label: "Included Features",
                    list: true,
                    description:
                      "Bullet points detailing consultations, treatments, or take-home coaching",
                  },
                  {
                    type: "object",
                    name: "examples",
                    label: "Photo Examples",
                    list: true,
                    ui: {
                      itemProps: (item: any) => ({
                        label: item?.styleLabel || "New Example Image",
                      }),
                    },
                    fields: [
                      {
                        type: "image",
                        name: "image",
                        label: "Photo",
                      },
                      {
                        type: "string",
                        name: "styleLabel",
                        label: "Style / Haircut Label",
                      },
                      {
                        type: "string",
                        name: "alt",
                        label: "Alt Text",
                      },
                    ],
                  },

                  // Low-Frequency Config Fields (Locked Slug & Cal.com Override)
                  {
                    type: "string",
                    name: "id",
                    label: "Service Slug ID (Locked)",
                    description:
                      "Permanent system identifier used for URL anchors & Cal.com integration. Hidden from routine edits to protect inbound booking links.",
                    required: true,
                    ui: {
                      component: "hidden",
                    },
                  },
                  {
                    type: "string",
                    name: "calSlug",
                    label: "Cal.com Scheduling Slug Override (Advanced)",
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
                description:
                  "Descriptive accessibility and OpenGraph alt text for the social share card",
              },
              {
                type: "object",
                name: "portfolioList",
                label: "Showcase Images Gallery",
                list: true,
                ui: {
                  itemProps: (item: any) => ({
                    label:
                      item?.title || item?.alt || item?.id || "Portfolio Item",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Style Title / Caption",
                    description:
                      "Human-readable title for this style (e.g. 'Vintage Victory Rolls')",
                  },
                  {
                    type: "string",
                    name: "id",
                    label: "Image ID (slug)",
                    description:
                      "System anchor identifier used for direct portfolio linking",
                    required: true,
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Photo",
                    description:
                      "High-resolution showcase photograph of hair style",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "alt",
                    label: "Alt Text Description",
                    description:
                      "Descriptive accessibility and image SEO text explaining the style and texture",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "tag",
                    label: "Style Category",
                    description:
                      "Specialty category classification for filtering and portfolio grouping",
                    options: [
                      "Curly Cut",
                      "Vintage Styling",
                      "Updos",
                      "Events & Production",
                    ],
                  },
                  {
                    type: "image",
                    name: "images",
                    label: "Additional Slideshow Photos",
                    list: true,
                    description:
                      "Add multiple photos to enable smooth auto-cycling slideshows on this portfolio item",
                  },
                ],
              },
            ],
          },
          // 3.5 FAQ SECTION
          {
            type: "object",
            name: "faq",
            label: "Frequently Asked Questions",
            fields: [
              {
                type: "string",
                name: "sectionTitle",
                label: "Section Title",
                description: "Main section heading for FAQs",
              },
              {
                type: "string",
                name: "sectionSubtitle",
                label: "Section Subtitle",
                description: "Subtitle shown under the title",
              },
              {
                type: "object",
                name: "faqList",
                label: "FAQs List",
                list: true,
                ui: {
                  itemProps: (item: any) => ({
                    label: item?.question || "FAQ Question",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "question",
                    label: "Question",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "answer",
                    label: "Answer",
                    required: true,
                    ui: { component: "textarea" },
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
                ui: {
                  itemProps: (item: any) => ({
                    label:
                      item?.label ||
                      item?.fieldName ||
                      item?.name ||
                      "Form Field",
                  }),
                } as any,
                templates: [
                  {
                    name: "inputField",
                    label: "Text / Contact Input",
                    ui: {
                      itemProps: (item: any) => ({
                        label: item?.label || "Text / Contact Input",
                      }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        description:
                          "Question or label prompt shown above the input",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "fieldType",
                        label: "Input Type",
                        description:
                          "Browser input validation type (text, email, tel, date, number)",
                        options: ["text", "email", "tel", "date", "number"],
                      },
                      {
                        type: "string",
                        name: "placeholder",
                        label: "Placeholder Hint",
                        description:
                          "Faint example hint text inside the empty input box",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                        description:
                          "Check if the client must provide this answer to submit",
                      },
                    ],
                  },
                  {
                    name: "selectField",
                    label: "Dropdown Select Menu",
                    ui: {
                      itemProps: (item: any) => ({
                        label: item?.label || "Dropdown Select Menu",
                      }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        description: "Dropdown menu title or question prompt",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "options",
                        label: "Dropdown Options",
                        list: true,
                        description:
                          "List of selectable menu choices for the client",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                        description:
                          "Check if the client must pick an option to submit",
                      },
                    ],
                  },
                  {
                    name: "textareaField",
                    label: "Multi-line Text Area",
                    ui: {
                      itemProps: (item: any) => ({
                        label: item?.label || "Multi-line Text Area",
                      }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Field Label",
                        description:
                          "Prompt for the multi-line paragraph text area",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "placeholder",
                        label: "Placeholder Hint",
                        description:
                          "Guiding placeholder example to help client describe their request",
                      },
                      {
                        type: "boolean",
                        name: "required",
                        label: "Required Field?",
                        description: "Check if this note is required to submit",
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
                    description:
                      "Call-to-action button label for form submission",
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
                description: "Official business or salon brand name",
                required: true,
              },
              {
                type: "string",
                name: "stylistName",
                label: "Stylist Name",
                description: "First name of the primary stylist",
                required: true,
              },
              {
                type: "string",
                name: "title",
                label: "Browser Title (SEO)",
                description:
                  "Primary SEO browser page title displayed on search engine results",
              },
              {
                type: "string",
                name: "description",
                label: "Meta Description (SEO)",
                description:
                  "Meta description snippet for search engines (approx. 150-160 characters)",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "keywords",
                label: "SEO Keywords",
                description:
                  "Target search phrases and keywords for local SEO indexing",
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
                description:
                  "Neighborhood and city text displayed in header and footer",
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
                    description: "City name for Schema.org LocalBusiness",
                  },
                  {
                    type: "string",
                    name: "region",
                    label: "State / Region",
                    description: "Two-letter state abbreviation (e.g. CA)",
                  },
                  {
                    type: "string",
                    name: "country",
                    label: "Country Code",
                    description: "Two-letter country code (e.g. US)",
                  },
                ],
              },
              {
                type: "object",
                name: "geo",
                label: "Geographic Coordinates",
                fields: [
                  {
                    type: "number",
                    name: "latitude",
                    label: "Latitude",
                    description: "Geographic latitude coordinate",
                  },
                  {
                    type: "number",
                    name: "longitude",
                    label: "Longitude",
                    description: "Geographic longitude coordinate",
                  },
                ],
              },
              {
                type: "string",
                name: "areaServed",
                label: "Areas Served",
                description:
                  "Cities and districts served for Schema.org area coverage",
                list: true,
              },
              {
                type: "string",
                name: "openingDays",
                label: "Opening Days",
                description:
                  "Days of the week with standard appointment availability",
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
                    description: "Opening time in 24-hour format (e.g. 09:00)",
                  },
                  {
                    type: "string",
                    name: "closes",
                    label: "Closing Time (HH:MM)",
                    description: "Closing time in 24-hour format (e.g. 18:00)",
                  },
                ],
              },
              {
                type: "string",
                name: "priceRange",
                label: "Price Range",
                description: "Price tier symbol for Schema.org (e.g. $ or $$)",
              },
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
