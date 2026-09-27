import React, { useEffect } from "react";
import {
  generateSiteSchema,
  SITE_CONFIG,
  SERVICES_CONTENT,
  PORTFOLIO_CONTENT,
  type SiteConfig,
} from "../config/site";
import type {
  ServiceItem,
  SiteContent,
  PortfolioContent,
  PortfolioItem,
} from "../types/content";

interface SchemaOrgProps {
  siteConfig?: Partial<SiteContent> & Partial<SiteConfig>;
  services?: ServiceItem[];
  portfolio?: PortfolioContent | PortfolioItem[];
}

/**
 * Ensures Schema.org JSON-LD and OpenGraph tags match unified CMS configuration in real time.
 */
export const SchemaOrg: React.FC<SchemaOrgProps> = ({
  siteConfig,
  services = SERVICES_CONTENT,
  portfolio,
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
    const portfolioList: PortfolioItem[] = Array.isArray(portfolio)
      ? portfolio
      : portfolio?.portfolioList || PORTFOLIO_CONTENT;

    const schemaData = generateSiteSchema(
      mergedConfig,
      services,
      portfolioList
    );
    script.textContent = JSON.stringify(schemaData, null, 2);

    const ogImageRelative =
      (!Array.isArray(portfolio) && portfolio?.ogImage) || mergedConfig.ogImage;
    const ogImageSrc = ogImageRelative?.startsWith("http")
      ? ogImageRelative
      : `${(mergedConfig.canonicalUrl || SITE_CONFIG.canonicalUrl).replace(/\/+$/, "")}${ogImageRelative}`;

    if (ogImageSrc) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", ogImageSrc);
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) twImg.setAttribute("content", ogImageSrc);
    }

    const title = mergedConfig.title;
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute("content", title);
    }

    const description = mergedConfig.description;
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", description);
    }
  }, [siteConfig, services, portfolio]);

  return null;
};
