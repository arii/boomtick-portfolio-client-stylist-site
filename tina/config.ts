import { defineConfig } from "tinacms";

// Dynamic branch resolution
const branch =
  (typeof process !== "undefined" ? process.env?.VITE_TINA_BRANCH : undefined) ||
  (typeof process !== "undefined" ? process.env?.CF_PAGES_BRANCH : undefined) ||
  "main";

// TinaCloud Credentials (with local fallback)
const clientId =
  (typeof process !== "undefined" && process.env?.VITE_TINA_CLIENT_ID && process.env?.TINA_TOKEN)
    ? process.env.VITE_TINA_CLIENT_ID
    : "local-mode-client";

const token =
  (typeof process !== "undefined" && process.env?.VITE_TINA_CLIENT_ID && process.env?.TINA_TOKEN)
    ? process.env.TINA_TOKEN
    : "";

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
      // 1. SITE & SEO SETTINGS
      {
        name: "site",
        label: "Site Settings & SEO",
        path: "src/content",
        match: { include: "site" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          { type: "string", name: "studioName", label: "Studio Name", required: true },
          { type: "string", name: "stylistName", label: "Stylist Name", required: true },
          { type: "string", name: "browserTitle", label: "Browser Title (SEO)" },
          { type: "string", name: "metaDescription", label: "Meta Description", ui: { component: "textarea" } },
          { 
            type: "string", 
            name: "email", 
            label: "Direct Email Address", 
            description: "Used for public display and contact routing" 
          },
          { 
            type: "string", 
            name: "phone", 
            label: "Direct Phone Number", 
            description: "Formats automatically on site links" 
          },
          { 
            type: "string", 
            name: "instagramHandle", 
            label: "Instagram Handle (@...)",
            description: "Enter handle only (e.g. hair.by.april_209)" 
          },
          { type: "string", name: "locationDisplay", label: "Location Display Text" },
          { 
            type: "string", 
            name: "availabilityBanner", 
            label: "Global Availability Notice", 
            description: "Displays above the services and appointment buttons" 
          },
          { 
            type: "string", 
            name: "calUsername", 
            label: "Cal.com Username", 
            description: "Your Cal.com scheduling username (e.g. ariel-anders)" 
          },
          { 
            type: "string", 
            name: "calDefaultSlug", 
            label: "Cal.com Default Event Slug", 
            description: "Default event booking slug (e.g. april-demo)" 
          },
          { type: "string", name: "priceRange", label: "Price Range Indicator" },
          {
            type: "object",
            name: "address",
            label: "Local Business Address",
            fields: [
              { type: "string", name: "locality", label: "Locality / City" },
              { type: "string", name: "region", label: "Region / State" },
              { type: "string", name: "country", label: "Country Code" },
            ],
          },
          {
            type: "object",
            name: "geo",
            label: "Geographical Coordinates",
            fields: [
              { type: "number", name: "latitude", label: "Latitude" },
              { type: "number", name: "longitude", label: "Longitude" },
            ],
          },
          { type: "string", name: "areaServed", label: "Areas Served", list: true },
          { type: "string", name: "keywords", label: "SEO Keywords", list: true },
        ],
      },

      // 2. HERO SECTION
      {
        name: "hero",
        label: "Hero Section",
        path: "src/content",
        match: { include: "hero" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          { type: "string", name: "badge", label: "Credentials Badge" },
          { type: "string", name: "headline", label: "Main Headline", required: true },
          { type: "string", name: "subheading", label: "Subheading Copy", ui: { component: "textarea" } },
          { type: "string", name: "availabilityNotice", label: "Availability Notice Banner", required: true, ui: { component: "textarea" } },
          { type: "string", name: "calSlug", label: "Cal.com Booking Event Slug", description: "Specific Cal.com event slug for the Hero button (e.g. april-demo)" },
        ],
      },

      // 3. PORTFOLIO SHOWCASE
      {
        name: "portfolio",
        label: "Portfolio Showcase",
        path: "src/content",
        match: { include: "portfolio" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: "object",
            name: "portfolioList",
            label: "Showcase Images",
            list: true,
            ui: {
              itemProps: (item: any) => ({ label: item?.alt || item?.id || "Portfolio Item" }),
            },
            fields: [
              { type: "string", name: "id", label: "Image ID (slug)", required: true },
              { type: "image", name: "image", label: "Photo", required: true },
              { type: "string", name: "alt", label: "Alt Text Description", required: true },
              {
                type: "string",
                name: "tag",
                label: "Style Category",
                options: ["Curly Cut", "Vintage Styling", "Updos", "Events & Production"],
              },
            ],
          },
        ],
      },

      // 4. SERVICES & PRICING
      {
        name: "services",
        label: "Services & Pricing",
        path: "src/content",
        match: { include: "services" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          { type: "string", name: "sectionTitle", label: "Services Section Title" },
          {
            type: "object",
            name: "servicesList",
            label: "Service Offerings",
            list: true,
            ui: {
              itemProps: (item: any) => ({ label: `${item?.name || "Service"} (${item?.price || "TBD"})` }),
            },
            fields: [
              { type: "string", name: "id", label: "Service ID (slug)", required: true },
              { type: "string", name: "name", label: "Service Name", required: true },
              { type: "string", name: "price", label: "Price Display (e.g., $185)", required: true },
              { type: "string", name: "duration", label: "Duration (e.g., 90 mins)", required: true },
              { type: "string", name: "description", label: "Short Description", ui: { component: "textarea" } },
              { type: "string", name: "deliverables", label: "Key Deliverables / Inclusions", list: true },
              { type: "string", name: "calSlug", label: "Direct Cal.com Event Slug" },
            ],
          },
        ],
      },

      // 5. INQUIRY & MAILING LIST FORM
      {
        name: "events",
        label: "Inquiry & Mailing List Form",
        path: "src/content",
        match: { include: "events" },
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          { type: "string", name: "title", label: "Form Section Title" },
          { type: "string", name: "description", label: "Form Section Description", ui: { component: "textarea" } },
          { type: "boolean", name: "showForm", label: "Display Inquiry Form on Site?" },
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
                  { type: "string", name: "label", label: "Field Label", required: true },
                  {
                    type: "string",
                    name: "fieldType",
                    label: "Input Type",
                    options: ["text", "email", "tel", "date", "number"],
                  },
                  { type: "string", name: "placeholder", label: "Placeholder Hint" },
                  { type: "boolean", name: "required", label: "Required Field?" },
                ],
              },
              {
                name: "selectField",
                label: "Dropdown Select Menu",
                fields: [
                  { type: "string", name: "label", label: "Dropdown Label", required: true },
                  { type: "string", name: "options", label: "Select Options", list: true },
                  { type: "boolean", name: "required", label: "Required Field?" },
                ],
              },
              {
                name: "textareaField",
                label: "Multi-line Text Area",
                fields: [
                  { type: "string", name: "label", label: "Field Label", required: true },
                  { type: "string", name: "placeholder", label: "Placeholder Hint" },
                  { type: "boolean", name: "required", label: "Required Field?" },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "formOptions",
            label: "Form Options",
            fields: [
              { type: "string", name: "submitButtonText", label: "Submit Button Text" },
            ],
          },
        ],
      },
    ],
  },
});
