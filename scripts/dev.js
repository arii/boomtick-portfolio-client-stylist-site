import { spawn } from "child_process";

// Spawn tinacms dev -c "vite" and ignore any appended command line options like --host or --port
console.log(
  "Starting TinaCMS dev server via custom wrapper to prevent CLI argument collision..."
);

const child = spawn("npx", ["tinacms", "dev", "-c", "vite"], {
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
