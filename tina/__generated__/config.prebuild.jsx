// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.VITE_TINA_BRANCH || "main";
var clientId = process.env.VITE_TINA_CLIENT_ID || null;
var token = process.env.TINA_TOKEN || null;
var config_default = defineConfig({
  branch,
  clientId,
  token,
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "assets"
    }
  },
  // See https://tina.io/docs/schema/ for more info
  schema: {
    collections: [
      {
        name: "hero",
        label: "Hero Section",
        path: "src/content",
        format: "json",
        match: {
          include: "hero"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "badge",
            label: "Credentials Badge",
            required: true
          },
          {
            type: "string",
            name: "headline",
            label: "Main Headline",
            required: true
          },
          {
            type: "string",
            name: "subheading",
            label: "Subheading Copy",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "availabilityNotice",
            label: "Availability Notice Banner",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "instagramUrl",
            label: "Instagram URL Link",
            required: true
          }
        ]
      },
      {
        name: "events",
        label: "Events & Collaborations",
        path: "src/content",
        format: "json",
        match: {
          include: "events"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Section Title",
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description Copy",
            required: true,
            ui: {
              component: "textarea"
            }
          }
        ]
      },
      {
        name: "services",
        label: "Services",
        path: "src/content",
        format: "json",
        match: {
          include: "services"
        },
        fields: [
          {
            type: "object",
            name: "servicesList",
            label: "Services Catalog List",
            list: true,
            fields: [
              {
                type: "string",
                name: "id",
                label: "Service ID (slug)",
                required: true
              },
              {
                type: "string",
                name: "name",
                label: "Service Name",
                required: true
              },
              {
                type: "string",
                name: "price",
                label: "Price Display (e.g. $175)",
                required: true
              },
              {
                type: "string",
                name: "duration",
                label: "Duration Display (e.g. 90 mins)",
                required: true
              },
              {
                type: "string",
                name: "description",
                label: "Short Description",
                required: true
              },
              {
                type: "string",
                name: "deliverables",
                label: "Included Deliverables (List)",
                list: true
              },
              {
                type: "string",
                name: "calSlug",
                label: "Cal.com Scheduling Slug"
              }
            ]
          }
        ]
      },
      {
        name: "portfolio",
        label: "Portfolio Gallery",
        path: "src/content",
        format: "json",
        match: {
          include: "portfolio"
        },
        fields: [
          {
            type: "object",
            name: "portfolioList",
            label: "Showcase Images List",
            list: true,
            fields: [
              {
                type: "string",
                name: "id",
                label: "Image ID (slug)",
                required: true
              },
              {
                type: "string",
                name: "image",
                label: "Asset Source Path",
                required: true
              },
              {
                type: "string",
                name: "alt",
                label: "Alt Text description",
                required: true
              },
              {
                type: "string",
                name: "tag",
                label: "Style Category Tag"
              }
            ]
          }
        ]
      },
      {
        name: "site",
        label: "Site Settings & SEO",
        path: "src/content",
        format: "json",
        match: {
          include: "site"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "studioName",
            label: "Studio Name",
            required: true
          },
          {
            type: "string",
            name: "stylistName",
            label: "Stylist Name",
            required: true
          },
          {
            type: "string",
            name: "title",
            label: "Browser Title (SEO)",
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Meta Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "email",
            label: "Direct Email Address",
            required: true
          },
          {
            type: "string",
            name: "phone",
            label: "Direct Phone Number",
            required: true
          },
          {
            type: "string",
            name: "instagram",
            label: "Instagram Handle (@...)",
            required: true
          },
          {
            type: "string",
            name: "locationDisplay",
            label: "Location Display Text",
            required: true
          },
          {
            type: "string",
            name: "priceRange",
            label: "Price Range Indicator ($$)"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
