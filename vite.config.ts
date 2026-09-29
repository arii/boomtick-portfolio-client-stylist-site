import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, loadEnv, Plugin } from "vite";
import {
  SITE_CONFIG,
  SERVICES_CONTENT,
  generateSiteSchema,
} from "./src/config/site";

function dynamicSeoAndCdnPlugin(): Plugin {
  return {
    name: "dynamic-seo-and-cdn",
    transformIndexHtml(html: string) {
      const schemaJson = JSON.stringify(
        generateSiteSchema(SITE_CONFIG, SERVICES_CONTENT),
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

      // 5. Dynamic OpenGraph and Twitter Media Images
      transformed = transformed.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:image" content="${SITE_CONFIG.ogImage}" />`
      );
      transformed = transformed.replace(
        /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:image:alt" content="${SITE_CONFIG.ogImageAlt}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:image" content="${SITE_CONFIG.ogImage}" />`
      );
      transformed = transformed.replace(
        /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:image:alt" content="${SITE_CONFIG.ogImageAlt}" />`
      );

      // 6. Dynamic High-Priority LCP Preload
      transformed = transformed.replace(
        /<link\s+rel="preload"\s+as="image"\s+href="[^"]*"[^>]*\/?>/i,
        `<link rel="preload" as="image" href="${SITE_CONFIG.heroPreloadImage}" type="image/webp" fetchpriority="high" />`
      );

      // 7. Dynamic Schema.org JSON-LD injection
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

          // 3. Ensure 404.html exists in dist for static CDN fallbacks
          const notFoundPath = path.join(distDir, "404.html");
          if (!fs.existsSync(notFoundPath)) {
            const public404 = path.resolve(__dirname, "public/404.html");
            if (fs.existsSync(public404)) {
              fs.copyFileSync(public404, notFoundPath);
            }
          }
        }
      } catch (err) {
        console.error(
          "🚨 [VITE BUILD HOOK ERROR] Failed during CDN post-build sync:",
          err
        );
        throw err;
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const deploymentId = process.env.DEPLOYMENT_ID || env.DEPLOYMENT_ID || "";
  const tinaClientId =
    process.env.VITE_TINA_CLIENT_ID || env.VITE_TINA_CLIENT_ID || "";
  const tinaToken = process.env.TINA_TOKEN || env.TINA_TOKEN || "";
  const tinaBranch =
    process.env.VITE_TINA_BRANCH || env.VITE_TINA_BRANCH || "main";

  if (command === "build") {
    if (deploymentId) {
      const masked =
        deploymentId.length > 8
          ? `${deploymentId.slice(0, 4)}...${deploymentId.slice(-4)}`
          : "***";
      console.log(
        `📦 [Vite Define] Injected DEPLOYMENT_ID (${masked}) into client bundle.`
      );
    } else {
      console.warn(
        "⚠️  [Vite Define] DEPLOYMENT_ID not found in env. Injected null into client bundle."
      );
    }
  }

  return {
    base: command === "build" ? "./" : "/",
    define: {
      "process.env.VITE_TINA_CLIENT_ID": JSON.stringify(tinaClientId || null),
      "process.env.TINA_TOKEN": JSON.stringify(tinaToken || null),
      "process.env.VITE_TINA_BRANCH": JSON.stringify(tinaBranch),
      "process.env.DEPLOYMENT_ID": JSON.stringify(deploymentId || null),
    },
    plugins: [react(), tailwindcss(), dynamicSeoAndCdnPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    optimizeDeps: {
      cacheDir: "node_modules/.vite-app",
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tinacms/bridge/metadata",
        "@tinacms/bridge/quick-edit-css",
        "@tinacms/bridge/tina-field",
        "tinacms/dist/client",
        "lucide-react",
      ],
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
            icons: ["lucide-react"],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr:
        process.env.DISABLE_HMR === "true"
          ? false
          : {
              port: 3000,
            },
      watch: process.env.DISABLE_HMR === "true" ? null : {},
      proxy: {
        "^/admin/(src|node_modules|@vite|@react-refresh|@id|@fs|assets)": {
          target: "http://localhost:4001",
          changeOrigin: true,
          ws: true,
        },
        "/tina-admin-backend": {
          target: "http://localhost:4001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tina-admin-backend/, "/admin"),
          ws: true,
        },
        "/tina-graphql": {
          target: "http://localhost:4001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tina-graphql/, "/graphql"),
        },
      },
    },
  };
});
