import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import {
  SITE_CONFIG,
  SERVICES_CONTENT,
  generateSiteSchema,
} from "./src/config/site";

function adminRedirectPlugin(): Plugin {
  return {
    name: "admin-redirect-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url &&
          (req.url === "/admin" ||
            req.url === "/admin/" ||
            req.url.startsWith("/admin/index.html"))
        ) {
          const indexPath = path.resolve(__dirname, "public/admin/index.html");
          if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, "utf8");

            const monkeyPatch = `
  <script>
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        if (typeof input === 'string') {
          if (input.includes('localhost:4001/graphql')) {
            input = input.replace('http://localhost:4001/graphql', '/tina-graphql');
          } else if (input.includes('localhost:4001')) {
            input = input.replace('http://localhost:4001', '/tina-admin-backend');
          }
        }
        return originalFetch.call(this, input, init);
      };

      const OriginalWebSocket = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        if (typeof url === 'string' && url.includes('localhost:4001')) {
          const secure = window.location.protocol === 'https:';
          const newHost = window.location.host;
          url = url.replace('ws://localhost:4001', (secure ? 'wss://' : 'ws://') + newHost + '/tina-admin-backend');
          url = url.replace('http://localhost:4001', (secure ? 'https://' : 'http://') + newHost + '/tina-admin-backend');
        }
        return new OriginalWebSocket(url, protocols);
      };
      window.WebSocket.prototype = OriginalWebSocket.prototype;
    })();
  </script>
            `;

            html = html.replace(
              /http:\/\/localhost:4001/g,
              "/tina-admin-backend"
            );
            html = html.replace("<head>", "<head>" + monkeyPatch);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
            return;
          }
        }
        next();
      });
    },
  };
}

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

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "./" : "/",
    define: {
      "process.env.VITE_TINA_CLIENT_ID": JSON.stringify(process.env.VITE_TINA_CLIENT_ID || null),
      "process.env.TINA_TOKEN": JSON.stringify(process.env.TINA_TOKEN || null),
      "process.env.VITE_TINA_BRANCH": JSON.stringify(process.env.VITE_TINA_BRANCH || "main"),
    },
    plugins: [
      react(),
      tailwindcss(),
      dynamicSeoAndCdnPlugin(),
      adminRedirectPlugin(),
    ],
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
      port: 3000,
      host: "0.0.0.0",
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
      proxy: {
        "/tina-admin-backend": {
          target: "http://localhost:4001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tina-admin-backend/, ""),
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
