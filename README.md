# Honorary Consulate of Timor-Leste — Auckland

A modern, mobile-first single-page website for the Honorary Consulate of the
Democratic Republic of Timor-Leste, serving Auckland and the North Island of New
Zealand.

The site brings national information, trade and investment context, consular
guidance and direct contact details into one accessible scrolling
experience.

## Technology

- Astro 5 with strict TypeScript
- Tailwind CSS 4 and a custom design-token layer
- Markdown content collections

## Local development

Use Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

## Content

Editorial content is stored in `src/content/sections/`. Site-wide design values
are defined in `src/styles/tokens.css`.

Visa, passport, and official-document enquiries are directed to the Embassy of
Timor-Leste in Wellington.

## Deployment

The production site is hosted on Cloudflare Pages in the
`timor-leste-consulate-auckland` project.

```bash
npm run deploy:cloudflare
```

The command builds the static Astro site and deploys `dist/` to the production
`main` branch. Cloudflare serves the site at:

- `https://www.consulatetimorleste.co.nz`
- `https://timor-leste-consulate-auckland.pages.dev`

The apex domain redirects to `www`. A dated pre-migration DNS backup is kept
locally in the ignored `private-backups/` directory and must not be committed.

Before public launch, complete every `TODO(client)` and `TODO(verify)` item,
and verify all official contact details with the Consulate.
