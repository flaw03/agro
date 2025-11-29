
import { execSync } from "node:child_process";
import fs from "node:fs";

const SPEC_PATH = "src/openapi/main.yml";
const TYPES_OUT = "src/types";
const GENERATED_TYPES_OUT = "src/generated/types";
const CLIENT_OUT = "src/generated/client";

function run(cmd) {
  console.log(`➡️  Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function ensureDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

async function generateTypes() {
  console.log("\n🚀 Generating TypeScript types only...\n");

  ensureDir(TYPES_OUT);

  console.log("📌 Generating TypeScript types...");
  run(`bunx openapi-typescript ${SPEC_PATH} -o ${TYPES_OUT}/index.ts`);

  console.log("\n✨ Types generation complete!\n");
}

async function generateAll() {
  console.log("\n🚀 Starting OpenAPI generation...\n");

  ensureDir(GENERATED_TYPES_OUT);
  ensureDir(CLIENT_OUT);

  console.log("📌 Generating TypeScript types...");
  run(`bunx openapi-typescript ${SPEC_PATH} -o ${GENERATED_TYPES_OUT}/index.ts`);

  console.log("📌 Generating API client (fetch)...");
  run(
    `bunx @openapitools/openapi-generator-cli generate -i ${SPEC_PATH} -g typescript-fetch -o ${CLIENT_OUT}`
  );

  console.log("\n✨ OpenAPI generation complete!\n");
}

const command = process.argv[2];

if (command === "types") {
  generateTypes().catch((err) => {
    console.error("❌ Error during types generation:");
    console.error(err);
    process.exit(1);
  });
} else {
  generateAll().catch((err) => {
    console.error("❌ Error during generation:");
    console.error(err);
    process.exit(1);
  });
}