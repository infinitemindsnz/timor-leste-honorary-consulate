import assert from "node:assert/strict";
import test from "node:test";
import {
  enquirySchema,
  enquiryTypeDetails,
  escapeHtml,
  isPlausibleCompletion,
} from "../src/lib/enquiry.ts";

const validEnquiry = {
  name: "Maria Soares",
  email: "maria@example.com",
  phone: "",
  countryLocation: "New Zealand",
  enquiryType: "timorese-assistance",
  subject: "Community support",
  message: "I would like guidance about support available in Auckland.",
  consent: "on",
  website: "",
  formStartedAt: Date.now() - 10_000,
  turnstileToken: "test-token",
};

test("accepts a complete enquiry and normalises an empty phone", () => {
  const result = enquirySchema.safeParse(validEnquiry);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.phone, undefined);
});

test("rejects an email address that cannot receive a reply", () => {
  const result = enquirySchema.safeParse({
    ...validEnquiry,
    email: "not-an-email",
  });
  assert.equal(result.success, false);
});

test("rejects messages over the 2,000 character limit", () => {
  const result = enquirySchema.safeParse({
    ...validEnquiry,
    message: "x".repeat(2_001),
  });
  assert.equal(result.success, false);
});

test("uses the required inbox prefix for investment enquiries", () => {
  assert.equal(
    enquiryTypeDetails["business-investment"].prefix,
    "[Investment]",
  );
});

test("rejects forms completed implausibly quickly", () => {
  assert.equal(isPlausibleCompletion(Date.now() - 1_000), false);
  assert.equal(isPlausibleCompletion(Date.now() - 5_000), true);
});

test("escapes enquiry content before inserting it into HTML", () => {
  assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
});
