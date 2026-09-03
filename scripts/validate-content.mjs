#!/usr/bin/env node
// Standalone gate for the governed content model. Same schema the Astro build uses
// (src/data/schema.ts), runnable without a full build.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { siteSchema } from "../src/data/schema.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "data", "site.yaml");
const result = siteSchema.safeParse(parse(readFileSync(file, "utf8")));
if (result.success) {
  console.log("ok   src/data/site.yaml");
} else {
  console.error("FAIL src/data/site.yaml");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}
