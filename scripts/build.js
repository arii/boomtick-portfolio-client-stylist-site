import { spawnSync } from "child_process";
import net from "net";
import fs from "fs";

function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      resolve(false);
    });
  });
}

function printElevatedError(stepName, errorDetails) {
  console.error("\n========================================================");
  console.error(`🚨 [BUILD FAILURE] Error occurred during: ${stepName}`);
  console.error("========================================================");
  console.error(errorDetails);
  console.error("========================================================\n");
}

async function run() {
  console.log("🚀 Initiating Production Build Pipeline...\n");

  // 1. Dynamic SEO & CMS Asset Generation
  console.log(
    "1️⃣ Generating dynamic SEO, sitemap, robots, and schemas from CMS config..."
  );
  const seoResult = spawnSync("node", ["scripts/generate-seo.mjs"], {
    stdio: "inherit",
    shell: true,
  });

  if (seoResult.status !== 0) {
    printElevatedError(
      "Dynamic SEO generation",
      "Failed to generate SEO assets from src/content/"
    );
    process.exit(seoResult.status ?? 1);
  }

  // 2. TinaCMS Build
  const hasEnv = process.env.VITE_TINA_CLIENT_ID && process.env.TINA_TOKEN;
  let runTinaBuild = true;

  console.log("\n2️⃣ Checking TinaCMS datalayer and schema status...");
  const busy = await isPortBusy(9000);
  const hasGeneratedAssets =
    fs.existsSync("public/admin/index.html") &&
    fs.existsSync("tina/__generated__/types.ts");

  if (busy && hasGeneratedAssets) {
    console.log(
      "Local datalayer active on port 9000 and compiled assets exist. Reusing compiled assets to prevent port conflict."
    );
    runTinaBuild = false;
  } else {
    if (hasEnv) {
      console.log("✅ [Build Info] Tina Cloud credentials found (VITE_TINA_CLIENT_ID & TINA_TOKEN present), compiling cloud build...");
    } else {
      console.warn("⚠️ [Build Warning] Tina Cloud credentials NOT fully found! Missing VITE_TINA_CLIENT_ID or TINA_TOKEN. Falling back to local TinaCMS build where clientId will be null.");
    }
  }

  if (runTinaBuild) {
    const tinaArgs = hasEnv
      ? ["build", "--skip-cloud-checks"]
      : ["build", "--local", "--skip-cloud-checks"];

    console.log(`Executing: npx tinacms ${tinaArgs.join(" ")}`);
    const tinaResult = spawnSync("npx", ["tinacms", ...tinaArgs], {
      stdio: "inherit",
      shell: true,
    });

    if (tinaResult.status !== 0) {
      printElevatedError(
        "TinaCMS Build",
        `tinacms build failed with code ${tinaResult.status}`
      );
      process.exit(tinaResult.status ?? 1);
    }
  }

  // 3. Vite Production Bundle
  console.log("\n3️⃣ Building Vite client bundle...");
  const viteResult = spawnSync("npx", ["vite", "build"], {
    stdio: "inherit",
    shell: true,
  });

  if (viteResult.status !== 0) {
    printElevatedError(
      "Vite Build",
      `vite build exited with status ${viteResult.status}`
    );
    process.exit(viteResult.status ?? 1);
  }

  // 4. Final Sync to Dist
  console.log("\n4️⃣ Synchronizing final SEO assets to dist/...");
  spawnSync("node", ["scripts/generate-seo.mjs"], {
    stdio: "inherit",
    shell: true,
  });

  console.log(
    "\n✨ [BUILD SUCCESS] All assets, schemas, and bundles compiled successfully!\n"
  );
  process.exit(0);
}

run().catch((err) => {
  printElevatedError("Fatal Pipeline Exception", err?.stack || String(err));
  process.exit(1);
});
