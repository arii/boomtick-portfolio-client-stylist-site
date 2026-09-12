import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { SITE_CONFIG, generateSiteSchema } from "./src/config/site";
import { SERVICES } from "./src/data/services";

function dynamicSeoAndCdnPlugin(): Plugin {
  return {
    name: "dynamic-seo-and-cdn",
    transformIndexHtml(html: string) {
      const schemaJson = JSON.stringify(
        generateSiteSchema(SITE_CONFIG, SERVICES),
        null,
        2
      );

      let transformed = html;

      // 1. Dynamic Canonical URL
      transformed = transformed.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${SITE_CONFIG.canonicalUrl}" />`
      );

      // 2. Dynamic OpenGraph URL
      transformed = transformed.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${SITE_CONFIG.canonicalUrl}" />`
      );

      // 3. Dynamic OpenGraph Title & Site Name
      transformed = transformed.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${SITE_CONFIG.title}" />`
      );
      transformed = transformed.replace(
        /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:site_name" content="${SITE_CONFIG.studioName}" />`
      );

      // 4. Dynamic Meta Description & Author
      transformed = transformed.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${SITE_CONFIG.description}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="author"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="author" content="${SITE_CONFIG.studioName}" />`
      );

      // 5. Dynamic Schema.org JSON-LD injection
      transformed = transformed.replace(
        /<script\s+type="application\/ld\+json"\s+id="schema-org-jsonld">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json" id="schema-org-jsonld">\n${schemaJson}\n    </script>`
      );

      return transformed;
    },
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, "dist");
        if (fs.existsSync(distDir)) {
          // 1. Ensure sitemap.xml in dist uses dynamic canonical URL and current ISO date
          const today = new Date().toISOString().split("T")[0];
          const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_CONFIG.canonicalUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;
          fs.writeFileSync(
            path.join(distDir, "sitemap.xml"),
            sitemapContent,
            "utf8"
          );

          // 2. Ensure robots.txt in dist points to dynamic sitemap
          const robotsPath = path.join(distDir, "robots.txt");
          if (fs.existsSync(robotsPath)) {
            let robots = fs.readFileSync(robotsPath, "utf8");
            robots = robots.replace(
              /Sitemap:\s*https?:\/\/[^\s]+/i,
              `Sitemap: ${SITE_CONFIG.canonicalUrl}sitemap.xml`
            );
            fs.writeFileSync(robotsPath, robots, "utf8");
          }

          // 3. Ensure 404.html exists in dist for static CDN fallbacks (e.g. GitHub Pages / S3)
          const notFoundPath = path.join(distDir, "404.html");
          if (!fs.existsSync(notFoundPath)) {
            const public404 = path.resolve(__dirname, "public/404.html");
            if (fs.existsSync(public404)) {
              fs.copyFileSync(public404, notFoundPath);
            }
          }

          // 4. Dynamically generate llms.txt based on SITE_CONFIG and SERVICES
          const servicesList = SERVICES.map(
            (s) =>
              `- **${s.name}** — ${s.price} (${s.duration || "N/A"})\n  - ${s.description}`
          ).join("\n");

          const llmsContent = `# ${SITE_CONFIG.studioName}\n\n> ${SITE_CONFIG.description}\n\n## Overview\n- **Stylist:** ${SITE_CONFIG.stylistName}\n- **Experience:** ${SITE_CONFIG.credentials}\n- **Service Area:** ${SITE_CONFIG.locationDisplay} (${SITE_CONFIG.logisticsNotice})\n- **Website:** ${SITE_CONFIG.canonicalUrl}\n\n## Contact Information\n- **Email:** ${SITE_CONFIG.email}\n- **Phone / SMS:** ${SITE_CONFIG.phoneDisplay}\n- **Instagram:** ${SITE_CONFIG.instagramUrl} (${SITE_CONFIG.instagram})\n\n## Services & Pricing\n${servicesList}\n- **Weddings, Productions & Events** — Custom Quote\n  - On-location hair styling for bridal parties, commercial shoots, vintage events, and theatrical productions.\n\n## How to Book\n- **Direct Appointments:** Book individual appointments online directly on the website via Cal.com.\n- **Events & Collaborations:** Submit event specifics via the on-site inquiry form, or email ${SITE_CONFIG.email} / text ${SITE_CONFIG.phoneDisplay}.\n`;

          fs.writeFileSync(path.join(distDir, "llms.txt"), llmsContent, "utf8");
          fs.writeFileSync(
            path.resolve(__dirname, "public/llms.txt"),
            llmsContent,
            "utf8"
          );
          fs.writeFileSync(
            path.resolve(__dirname, "llms.txt"),
            llmsContent,
            "utf8"
          );
        }
      } catch (err) {
        console.warn("CDN post-build sync notice:", err);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "./" : "/",
    plugins: [react(), tailwindcss(), dynamicSeoAndCdnPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      target: "es2020",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            motion: ["motion"],
            icons: ["lucide-react"],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
