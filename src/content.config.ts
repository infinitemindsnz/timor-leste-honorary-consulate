import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/sections" }),
  // Structure only: every section's copy lives in the governed record src/data/sections.yaml
  // (validated by src/data/schema.ts) and is merged in by ContentSections.astro.
  schema: z.object({
    page: z.enum(["timor-leste", "opportunity", "consular-services"]),
    order: z.number().int().positive(),
    pattern: z.enum([
      "chevron",
      "diamond",
      "stepped-lozenge",
      "zigzag",
      "morinda-stripe",
    ]),
    surface: z.enum(["undyed", "light", "indigo"]).default("undyed"),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/insights" }),
  schema: z.object({
    title: z.string(),
    dateLabel: z.string(),
    dateTime: z.string(),
    sortDate: z.coerce.date(),
    category: z.string(),
    author: z.string(),
    summary: z.string(),
    sourceUrl: z.string().url(),
    pdfPath: z.string(),
    pageCount: z.number().int().positive(),
    readingMinutes: z.number().int().positive(),
    heroImage: z.object({
      basePath: z.string(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string(),
      caption: z.string(),
    }),
    featured: z.boolean().default(false),
  }),
});

export const collections = { pages, sections, insights };
