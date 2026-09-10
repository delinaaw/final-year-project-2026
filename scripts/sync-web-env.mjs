import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, ".env");
const target = join(root, "apps", "web", ".env.local");

if (!existsSync(source)) {
  console.error("No .env at the repo root. Copy .env.example to .env first.");
  process.exit(1);
}

const lines = readFileSync(source, "utf8")
  .split("\n")
  .filter((line) => line.trim().startsWith("NEXT_PUBLIC_"));

if (lines.length === 0) {
  console.error("No NEXT_PUBLIC_ variables found in .env");
  process.exit(1);
}

writeFileSync(target, `${lines.join("\n")}\n`);
console.log(`Synced ${lines.length} NEXT_PUBLIC_ variables to apps/web/.env.local`);
