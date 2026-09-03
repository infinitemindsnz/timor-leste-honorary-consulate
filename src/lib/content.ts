import { parse } from "yaml";
import siteYaml from "../data/site.yaml?raw";
import { siteSchema, type Site } from "../data/schema";

/**
 * Build-time content loader. The YAML is read through Vite's `?raw` import, so it is part of the
 * module graph: edits invalidate in dev, and a schema violation fails `astro build` instead of
 * shipping a page with a missing fact. Validation runs the first time a component imports this.
 */
function fail(file: string, error: unknown): never {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: Array<{ path: Array<string | number>; message: string }> })
      .issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`${file} failed validation:\n${issues}`);
  }
  throw error;
}

const parsedSite = siteSchema.safeParse(parse(siteYaml));
if (!parsedSite.success) fail("src/data/site.yaml", parsedSite.error);

export const site: Site = parsedSite.data;
