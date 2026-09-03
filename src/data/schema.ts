import { z } from "astro/zod";

/**
 * Strict schema for the governed content model (src/data/site.yaml).
 *
 * Every object is a `strictObject`: an unknown key is a build failure, not a silently ignored
 * field. The schema validates shape, presence and the two coupled-fact invariants the
 * publication contract relies on (a `tel:` href for the phone row, and an email row whose
 * mailto href names exactly its visible address). It deliberately does not normalise copy.
 */
// eslint-disable-next-line no-control-regex -- control characters are exactly what this guards against
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;

const line = z
  .string()
  .min(1)
  .refine((value) => value.trim() === value && !CONTROL.test(value), {
    message: "must be a single trimmed line without control characters",
  });

const contactRow = z.strictObject({ label: line, value: line, href: line });

const linkFact = z.strictObject({ display: line, href: line });

export const siteSchema = z.strictObject({
  brand: z.strictObject({
    name: line,
    shortName: line,
    region: line,
    areaServed: line,
  }),
  contact: z
    .strictObject({
      eyebrow: line,
      heading: line,
      intro: line,
      rows: z.tuple([contactRow, contactRow, contactRow]),
      visitNote: line,
      jurisdiction: z.strictObject({ eyebrow: line, heading: line, body: line }),
    })
    .superRefine((contact, ctx) => {
      const [phone, email] = contact.rows;
      if (phone.label !== "Mobile" || !/^tel:\+[1-9][0-9]{6,14}$/u.test(phone.href)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rows", 0],
          message: "rows[0] must be the Mobile row with an E.164 tel: href",
        });
      }
      if (email.label !== "Email" || email.href !== `mailto:${email.value}`) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rows", 1],
          message: "rows[1] must be the Email row whose href is mailto:<value>",
        });
      }
    }),
  address: z.strictObject({
    streetAddress: line,
    addressLocality: line,
    addressRegion: line,
    addressCountry: z.literal("NZ"),
    footerLine: line,
  }),
  embassy: z.strictObject({
    eyebrow: line,
    heading: line,
    body: line,
    referralBody: line,
    footerBody: line,
    phone: linkFact,
    email: linkFact,
  }),
  nav: z.strictObject({
    items: z.array(z.strictObject({ label: line, href: line })).min(1).max(8),
  }),
  hero: z.strictObject({
    eyebrow: line,
    headlineLines: z.array(line).min(1).max(4),
    lede: line,
    ctas: z.array(z.strictObject({ label: line, href: line })).min(1).max(3),
    imageCaption: line,
  }),
  doorways: z.strictObject({
    heading: line,
    items: z.array(z.strictObject({ titleLines: z.array(line).min(1).max(3), body: line, action: line, href: line })).min(1).max(4),
  }),
  chapters: z.strictObject({
    consularServices: z.strictObject({ eyebrow: line, heading: line, intro: line }),
  }),
  insights: z.strictObject({ eyebrow: line, heading: line }),
  footer: z.strictObject({
    eyebrow: line,
    title: line,
    region: line,
    contactHeading: line,
    embassyHeading: line,
    coordinates: z.array(line).min(1).max(4),
    copyrightHolder: line,
  }),
});

export type Site = z.infer<typeof siteSchema>;

const ICONS = ["map", "users", "landmark", "coins", "waves", "handshake", "languages", "sprout", "graduation", "briefcase", "heart-handshake", "megaphone", "church"] as const;

/** One governed section record (src/data/sections.yaml), keyed by the section's collection id. */
export const sectionSchema = z.strictObject({
  eyebrow: line,
  title: line,
  lede: line.optional(),
  facts: z.array(z.strictObject({ icon: z.enum(ICONS), title: line, text: line })).optional(),
  timeline: z.array(z.strictObject({ date: line, title: line, text: line })).optional(),
  stats: z.array(z.strictObject({ value: line, caption: line, asAt: line.optional() })).optional(),
  services: z.array(z.strictObject({ icon: z.enum(ICONS), title: line, text: line })).optional(),
  profileHeading: line.optional(),
  profile: z.array(z.strictObject({ term: line, detail: line })).optional(),
});

export const sectionsSchema = z.record(z.string().regex(/^[a-z0-9-]+$/), sectionSchema);

export type Section = z.infer<typeof sectionSchema>;
export type Sections = z.infer<typeof sectionsSchema>;
