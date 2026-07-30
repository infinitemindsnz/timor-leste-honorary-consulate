import type { APIRoute } from "astro";
import { Resend } from "resend";
import {
  enquirySchema,
  formDataToEnquiryInput,
  isPlausibleCompletion,
} from "../../lib/enquiry";
import {
  buildAcknowledgementEmail,
  buildConsulateEmail,
} from "../../lib/enquiry-emails";

export const prerender = false;

const turnstileResultSchema = {
  isValid(value: unknown): value is {
    success: boolean;
    action?: string;
    hostname?: string;
  } {
    if (!value || typeof value !== "object") return false;
    const result = value as Record<string, unknown>;
    return (
      typeof result.success === "boolean" &&
      (result.action === undefined || typeof result.action === "string") &&
      (result.hostname === undefined || typeof result.hostname === "string")
    );
  },
};

function json(
  body: unknown,
  status: number,
  extraHeaders?: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function wantsJson(request: Request) {
  return request.headers.get("accept")?.includes("application/json") ?? false;
}

function outcome(
  request: Request,
  status: "success" | "invalid" | "failed" | "rate-limited",
  httpStatus: number,
  body: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
) {
  if (wantsJson(request)) return json(body, httpStatus, extraHeaders);

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/?status=${status}#enquiry`,
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

async function verifyTurnstile(
  token: string,
  remoteIp: string,
  secret: string,
  expectedHostname?: string,
) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
        idempotency_key: globalThis.crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) return false;
  const result: unknown = await response.json();
  if (!turnstileResultSchema.isValid(result) || !result.success) return false;
  if (result.action && result.action !== "contact") return false;
  if (expectedHostname && result.hostname !== expectedHostname) return false;
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 50_000) {
    return outcome(request, "invalid", 413, {
      ok: false,
      message: "The enquiry is too large. Shorten it and try again.",
    });
  }

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).origin !== url.origin) {
    return outcome(request, "invalid", 403, {
      ok: false,
      message: "The enquiry could not be accepted from this page.",
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return outcome(request, "invalid", 400, {
      ok: false,
      message: "The enquiry could not be read. Check the form and try again.",
    });
  }

  if (String(formData.get("website") ?? "")) {
    return outcome(request, "success", 200, { ok: true });
  }

  const parsed = enquirySchema.safeParse(formDataToEnquiryInput(formData));
  if (!parsed.success) {
    return outcome(request, "invalid", 400, {
      ok: false,
      message: "Check the highlighted details and try again.",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  if (!isPlausibleCompletion(parsed.data.formStartedAt)) {
    return outcome(request, "invalid", 400, {
      ok: false,
      message: "Wait a moment, then try sending your enquiry again.",
    });
  }

  const {
    RESEND_API_KEY,
    TURNSTILE_SECRET_KEY,
    TURNSTILE_EXPECTED_HOSTNAME,
    CONSULATE_RECIPIENT_EMAIL,
    EMAIL_FROM_ADDRESS,
    CONSULATE_RESPONSE_WINDOW = "five working days",
  } = import.meta.env;

  if (
    !RESEND_API_KEY ||
    !TURNSTILE_SECRET_KEY ||
    !CONSULATE_RECIPIENT_EMAIL ||
    !EMAIL_FROM_ADDRESS
  ) {
    console.error("Enquiry service is missing required environment variables.");
    return outcome(request, "failed", 503, {
      ok: false,
      message:
        "The online enquiry service is temporarily unavailable. Call or email the Consulate directly.",
    });
  }

  try {
    const turnstileValid = await verifyTurnstile(
      parsed.data.turnstileToken,
      clientAddress,
      TURNSTILE_SECRET_KEY,
      TURNSTILE_EXPECTED_HOSTNAME,
    );

    if (!turnstileValid) {
      return outcome(request, "invalid", 400, {
        ok: false,
        message: "The security check expired. Refresh it and try again.",
      });
    }

    const consulateEmail = buildConsulateEmail(parsed.data);
    const acknowledgement = buildAcknowledgementEmail(
      parsed.data,
      CONSULATE_RESPONSE_WINDOW,
    );
    const resend = new Resend(RESEND_API_KEY);
    const idempotencyKey = `enquiry/${globalThis.crypto.randomUUID()}`;

    const { error } = await resend.batch.send(
      [
        {
          from: EMAIL_FROM_ADDRESS,
          to: [CONSULATE_RECIPIENT_EMAIL],
          replyTo: parsed.data.email,
          subject: consulateEmail.subject,
          html: consulateEmail.html,
          text: consulateEmail.text,
        },
        {
          from: EMAIL_FROM_ADDRESS,
          to: [parsed.data.email],
          subject: acknowledgement.subject,
          html: acknowledgement.html,
          text: acknowledgement.text,
        },
      ],
      { idempotencyKey },
    );

    if (error) throw new Error("Resend rejected the enquiry email batch.");
  } catch {
    console.error("The enquiry email pipeline failed.");
    return outcome(request, "failed", 502, {
      ok: false,
      message:
        "The message could not be sent. Call or email the Consulate directly.",
    });
  }

  return outcome(request, "success", 200, {
    ok: true,
    message: "Obrigadu barak — your message has been received.",
  });
};

export const ALL: APIRoute = () =>
  json(
    {
      ok: false,
      message: "Use the contact form to send an enquiry.",
    },
    405,
    { Allow: "POST" },
  );
