# Governed publication contract — registration only

This directory lets the Business Agent **register** this website: name it,
state its live URL, verify that the pinned commit carries exactly these files,
and refuse every change request with a closed reason. It grants **no** write
authority. `writable-paths.v1.json` says so explicitly (`registrationOnly: true`,
`files: []`, `default: deny`), and `approval-policy.v1.json` binds no operation
to any approval stage.

## Why nothing is writable yet

1. **Public facts live in component code.** The consulate phone
   (`+64 21 021 68888`) renders from `SinglePageContact.astro`, `Footer.astro`
   and the `BaseLayout.astro` JSON-LD; the email and the Wellington embassy
   details the same way. A governed change must write every occurrence
   atomically or none; that needs one data record the renderer reads.
2. **Hosting cannot be settled.** The site deploys to Cloudflare Pages by CLI
   push (`npm run deploy:cloudflare`), not by a git integration. The publisher
   proves publication only against a Vercel production deployment; Cloudflare
   Pages is representable in the registry (`hosting.kind = cloudflare_pages`)
   but not executable.
3. **The protected branch has no required check.** Ruleset `21391088` blocks
   deletion and non-fast-forward pushes only. The publisher requires a
   pull-request rule with one strict required status check from its own App
   integration and zero bypass actors.

## Becoming writable (version 2, reviewed)

1. Move phone, email, address, jurisdiction note, embassy details, and the
   contact-section labels into `src/data/consulate.yaml` (strict Zod schema),
   and render every occurrence from it. Keep the byte-frozen tokens in
   `src/styles/tokens.css` out of any contract.
2. Declare the coupled occurrence sets (phone: display + `tel:` hrefs +
   JSON-LD `telephone`; email: visible + `mailto:` + JSON-LD `email`) with an
   exhaustive repository scan, as `dave-tax-nz-site/governance` does.
3. Host on a Vercel project (or add a recorded-envelope Cloudflare Pages
   settlement adapter to the publisher), install the Business Agent GitHub App
   scoped to this repository, and add the pull-request + required-check rule to
   the ruleset.
4. Pin the new digests in the deployment manifest and flip the registry entry
   from `publication: disabled` to `approval_required`.

Until then this site is read-only from the agent's point of view: it can be
named, linked, and listed; nothing can change it.
