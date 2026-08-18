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
  schema: z.object({
    page: z.enum(["timor-leste", "opportunity", "consular-services"]),
    order: z.number().int().positive(),
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string().optional(),
    pattern: z.enum([
      "chevron",
      "diamond",
      "stepped-lozenge",
      "zigzag",
      "morinda-stripe",
    ]),
    surface: z.enum(["undyed", "light", "indigo"]).default("undyed"),
    facts: z
      .array(
        z.object({
          icon: z.enum([
            "map",
            "users",
            "landmark",
            "coins",
            "waves",
            "handshake",
            "languages",
            "sprout",
            "graduation",
            "briefcase",
            "heart-handshake",
            "megaphone",
            "church",
          ]),
          title: z.string(),
          text: z.string(),
        }),
      )
      .optional(),
    timeline: z
      .array(
        z.object({
          date: z.string(),
          title: z.string(),
          text: z.string(),
        }),
      )
      .optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          asAt: z.string().optional(),
        }),
      )
      .optional(),
    services: z
      .array(
        z.object({
          icon: z.enum([
            "heart-handshake",
            "briefcase",
            "megaphone",
            "handshake",
          ]),
          title: z.string(),
          text: z.string(),
        }),
      )
      .optional(),
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
    featured: z.boolean().default(false),
  }),
});

export const collections = { pages, sections, insights };
