/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly TURNSTILE_EXPECTED_HOSTNAME?: string;
  readonly CONSULATE_RECIPIENT_EMAIL: string;
  readonly EMAIL_FROM_ADDRESS: string;
  readonly CONSULATE_RESPONSE_WINDOW?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
