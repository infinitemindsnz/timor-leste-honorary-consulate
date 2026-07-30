import { z } from "zod";

export const enquiryTypes = [
  "timorese-assistance",
  "business-investment",
  "tourism-travel",
  "media-speaking",
  "general",
] as const;

export type EnquiryType = (typeof enquiryTypes)[number];

export const enquiryTypeDetails: Record<
  EnquiryType,
  { label: string; prefix: string }
> = {
  "timorese-assistance": {
    label: "Assistance for a Timorese national",
    prefix: "[Consular Assistance]",
  },
  "business-investment": {
    label: "Business, trade or investment",
    prefix: "[Investment]",
  },
  "tourism-travel": {
    label: "Tourism and travel to Timor-Leste",
    prefix: "[Tourism]",
  },
  "media-speaking": {
    label: "Media or speaking request",
    prefix: "[Media]",
  },
  general: {
    label: "General enquiry",
    prefix: "[General]",
  },
};

const optionalPhone = z
  .string()
  .trim()
  .max(40, "Enter a phone number with no more than 40 characters")
  .transform((value) => value || undefined);

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name so the Consulate knows who is writing")
    .max(120, "Enter a name with no more than 120 characters"),
  email: z
    .string()
    .trim()
    .email("Enter an email address so the Consulate can reply")
    .max(254, "Enter an email address with no more than 254 characters"),
  phone: optionalPhone,
  countryLocation: z
    .string()
    .trim()
    .min(2, "Enter your country or location")
    .max(120, "Enter a location with no more than 120 characters"),
  enquiryType: z.enum(enquiryTypes, {
    required_error: "Choose the type of enquiry so it reaches the right person",
    invalid_type_error:
      "Choose the type of enquiry so it reaches the right person",
  }),
  subject: z
    .string()
    .trim()
    .min(3, "Enter a short subject for your enquiry")
    .max(160, "Enter a subject with no more than 160 characters")
    .refine(
      (value) => !/[\r\n]/.test(value),
      "Enter the subject on a single line",
    ),
  message: z
    .string()
    .trim()
    .min(20, "Add a little more detail so the Consulate can help")
    .max(2000, "Shorten your message to 2,000 characters or fewer"),
  consent: z.union([z.literal("on"), z.literal("true")]).transform(() => true),
  website: z.string().max(0),
  formStartedAt: z.coerce.number().int().positive(),
  turnstileToken: z
    .string()
    .min(1, "Complete the security check")
    .max(2048, "The security check expired; refresh it and try again"),
});

export type Enquiry = z.infer<typeof enquirySchema>;

export function formDataToEnquiryInput(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    countryLocation: formData.get("countryLocation"),
    enquiryType: formData.get("enquiryType"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    consent: formData.get("consent"),
    website: formData.get("website") ?? "",
    formStartedAt: formData.get("formStartedAt"),
    turnstileToken: formData.get("cf-turnstile-response"),
  };
}

export function isPlausibleCompletion(formStartedAt: number, now = Date.now()) {
  const elapsed = now - formStartedAt;
  return elapsed >= 3_000 && elapsed <= 24 * 60 * 60 * 1_000;
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}
