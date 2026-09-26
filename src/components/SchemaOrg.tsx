import React, { useEffect } from "react";
import {
  generateSiteSchema,
  SITE_CONFIG,
  SERVICES_CONTENT,
  type SiteConfig,
} from "../config/site";
import type { ServiceItem, SiteContent } from "../types/content";

interface SchemaOrgProps {
  siteConfig?: Partial<SiteContent> & Partial<SiteConfig>;
  services?: ServiceItem[];
}

/**
 * Ensures Schema.org JSON-LD and OpenGraph tags match unified CMS configuration in real time.
 */
export const SchemaOrg: React.FC<SchemaOrgProps> = ({
  siteConfig,
  services = SERVICES_CONTENT,
}) => {
  useEffect(() => {
    let script = document.getElementById(
      "schema-org-jsonld"
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "schema-org-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    const mergedConfig = { ...SITE_CONFIG, ...siteConfig };
    const schemaData = generateSiteSchema(mergedConfig, services);
    script.textContent = JSON.stringify(schemaData, null, 2);

    const ogImageSrc =
      mergedConfig.ogImage ||
      (mergedConfig.ogImageRelative
        ? `${(mergedConfig.canonicalUrl || SITE_CONFIG.canonicalUrl).replace(/\/+$/, "")}${mergedConfig.ogImageRelative}`
        : SITE_CONFIG.ogImage);

    if (ogImageSrc) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", ogImageSrc);
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) twImg.setAttribute("content", ogImageSrc);
    }

    const title = mergedConfig.browserTitle || mergedConfig.title;
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute("content", title);
    }

    const description =
      mergedConfig.metaDescription || mergedConfig.description;
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", description);
    }
  }, [siteConfig, services]);

  return null;
};
