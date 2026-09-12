import React, { useEffect } from "react";
import { generateSiteSchema, SITE_CONFIG } from "../config/site";
import { SERVICES } from "../data/services";

/**
 * Component ensuring Schema.org JSON-LD is dynamically maintained in document head.
 * In production static builds, the schema is pre-rendered into index.html by the Vite plugin,
 * and this component ensures client-side hydration keeps it synchronized with runtime variables.
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
    const schemaData = generateSiteSchema(SITE_CONFIG, SERVICES);
    script.textContent = JSON.stringify(schemaData, null, 2);
  }, []);

  return null;
};
