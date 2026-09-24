import fs from "fs";
import path from "path";

const distPath = path.resolve(process.cwd(), "dist");
const htmlPath = path.join(distPath, "index.html");
const robotsPath = path.join(distPath, "robots.txt");
const sitemapPath = path.join(distPath, "sitemap.xml");
const llmsPath = path.join(distPath, "llms.txt");

console.log("🔍 Running Static Pages Deployment, SEO & LCP Verification...\n");

let errors = 0;
let passes = 0;

function check(name, condition, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${name} ${details ? `(${details})` : ""}`);
    passes++;
  } else {
    console.error(`❌ [FAIL] ${name} ${details ? `(${details})` : ""}`);
    errors++;
  }
}

// 1. Dist check
check("Dist directory exists", fs.existsSync(distPath));
if (!fs.existsSync(htmlPath)) {
  console.error(
    '❌ dist/index.html does not exist. Run "npm run build" first.'
  );
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");

// 2. SEO & Dynamic Schema Checks
check("HTML has <title>", /<title>[\s\S]+?<\/title>/i.test(html));
const titleMatch = html.match(/<title>([\s\S]+?)<\/title>/i);
if (titleMatch) {
  const titleText = titleMatch[1].replace(/\s+/g, " ").trim();
  check(
    "Title length optimal (30-80 chars)",
    titleText.length >= 30 && titleText.length <= 80,
    `${titleText.length} chars`
  );
}

check(
  "Meta description exists",
  /<meta\s+name="description"\s+content="[^"]+"/i.test(html)
);
check(
  "Meta keywords exist",
  /<meta\s+name="keywords"\s+content="[^"]+"/i.test(html)
);
check(
  "Meta author exists",
  /<meta\s+name="author"\s+content="[^"]+"/i.test(html)
);

const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
check(
  "Canonical link exists and valid",
  Boolean(canonicalMatch && canonicalMatch[1].startsWith("http")),
  canonicalMatch ? canonicalMatch[1] : "missing"
);
const canonicalUrl = canonicalMatch ? canonicalMatch[1] : "";

const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
check(
  "OpenGraph URL matches canonical link",
  Boolean(ogUrlMatch && ogUrlMatch[1] === canonicalUrl),
  ogUrlMatch ? ogUrlMatch[1] : "missing"
);

check(
  "Robots meta tag exists",
  /<meta\s+name="robots"\s+content="[^"]*index[^"]*"/i.test(html)
);
check(
  "Geo location tags exist for local SEO",
  /<meta\s+name="geo\.region"\s+content="US-CA"/i.test(html) &&
    /<meta\s+name="geo\.placename"\s+content="San Francisco"/i.test(html)
);
check("Open Graph title exists", /<meta\s+property="og:title"/i.test(html));
check(
  "Open Graph description exists",
  /<meta\s+property="og:description"/i.test(html)
);
check("Open Graph image exists", /<meta\s+property="og:image"/i.test(html));
check("Open Graph locale exists", /<meta\s+property="og:locale"/i.test(html));
check("Twitter card meta exists", /<meta\s+name="twitter:card"/i.test(html));

// Dynamic Schema.org JSON-LD Verification
const schemaMatch = html.match(
  /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
);
check("Schema.org JSON-LD script tag exists", Boolean(schemaMatch));

if (schemaMatch) {
  try {
    const schemaObj = JSON.parse(schemaMatch[1]);
    check(
      "Schema.org JSON-LD is valid JSON",
      typeof schemaObj === "object" && schemaObj !== null
    );
    check("Schema.org type is HairSalon", schemaObj["@type"] === "HairSalon");
    check(
      "Schema.org URL matches canonical URL",
      schemaObj.url === canonicalUrl,
      `Schema URL: ${schemaObj.url}`
    );
    check(
      "Schema.org contains valid name",
      Boolean(schemaObj.name && schemaObj.name.length > 2),
      schemaObj.name
    );
    check(
      "Schema.org hasOfferCatalog contains services",
      Boolean(
        schemaObj.hasOfferCatalog &&
        Array.isArray(schemaObj.hasOfferCatalog.itemListElement) &&
        schemaObj.hasOfferCatalog.itemListElement.length >= 2
      ),
      `${schemaObj.hasOfferCatalog?.itemListElement?.length || 0} offers`
    );
    check(
      "Schema.org geo coordinates configured",
      Boolean(
        schemaObj.geo &&
        schemaObj.geo["@type"] === "GeoCoordinates" &&
        schemaObj.geo.latitude &&
        schemaObj.geo.longitude
      )
    );
  } catch (err) {
    check("Schema.org JSON-LD parsing", false, err.message);
  }
}

// 3. Static Pages Asset Linking check (Relative or valid absolute paths)
check(
  "Static relative asset resolution configured",
  html.includes("./assets/") || html.includes("assets/")
);

// 4. LCP & Performance Preload check
check(
  "LCP Image Preload tag present",
  /<link\s+rel="preload"\s+as="image"\s+href="[^"]*(unsplash|portfolio-)[^"]*"\s+[^>]*fetchpriority="high"/i.test(
    html
  ) ||
    /<link\s+rel="preload"\s+as="image"\s+href="[^"]*(unsplash|portfolio-)[^"]*"/i.test(
      html
    )
);
check(
  "Google Fonts preconnects present",
  html.includes("preconnect") && html.includes("fonts.gstatic.com")
);

// 5. Static CDN Hosting Configuration check
const headersPath = path.join(distPath, "_headers");
const redirectsPath = path.join(distPath, "_redirects");
const notFoundPath = path.join(distPath, "404.html");

check("robots.txt present in dist", fs.existsSync(robotsPath));
check("sitemap.xml present in dist", fs.existsSync(sitemapPath));
check("llms.txt present in dist", fs.existsSync(llmsPath));
check("CDN _headers present in dist", fs.existsSync(headersPath));
check("CDN _redirects present in dist", fs.existsSync(redirectsPath));
check("CDN 404.html fallback present in dist", fs.existsSync(notFoundPath));

if (fs.existsSync(headersPath)) {
  const headersContent = fs.readFileSync(headersPath, "utf8");
  check(
    "CDN _headers configures immutable asset caching",
    headersContent.includes("max-age=31536000, immutable")
  );
  check(
    "CDN _headers configures immediate HTML revalidation",
    headersContent.includes("max-age=0, must-revalidate")
  );
  check(
    "CDN _headers configures security headers",
    headersContent.includes("X-Content-Type-Options") &&
      headersContent.includes("SAMEORIGIN")
  );
}

if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
  check(
    "sitemap.xml contains canonical URL",
    sitemapContent.includes(canonicalUrl)
  );
}

// 6. Lockfile Safety Check (prevents deployment version mismatches)
const bunLockPath = path.resolve(process.cwd(), "bun.lock");
const bunLockbPath = path.resolve(process.cwd(), "bun.lockb");
const yarnLockPath = path.resolve(process.cwd(), "yarn.lock");

check("No Bun lockfile in workspace root (prevents deployment failures)", !fs.existsSync(bunLockPath) && !fs.existsSync(bunLockbPath));
check("No Yarn lockfile in workspace root", !fs.existsSync(yarnLockPath));

console.log(`\n========================================`);
console.log(`Summary: ${passes} passed, ${errors} failed.`);
console.log(
  `Status: ${errors === 0 ? "✨ STATIC DEPLOYMENT VERIFICATION PASSED!" : "⚠️ SOME CHECKS FAILED"}`
);
console.log(`========================================\n`);

if (errors > 0) {
  process.exit(1);
}
