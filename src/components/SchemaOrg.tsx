import React, { useEffect } from "react";
import {
  generateSiteSchema,
  SITE_CONFIG,
  SERVICES_CONTENT,
} from "../config/site";

/**
 * Ensures Schema.org JSON-LD and OpenGraph tags match unified CMS configuration.
 */
export const SchemaOrg: React.FC = () => {
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
    const schemaData = generateSiteSchema(SITE_CONFIG, SERVICES_CONTENT);
    script.textContent = JSON.stringify(schemaData, null, 2);

    if (SITE_CONFIG.ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", SITE_CONFIG.ogImage);
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) twImg.setAttribute("content", SITE_CONFIG.ogImage);
    }
  }, []);

  return null;
};
