// Regression tests for the governed publication contract (governance/*.json).
//
// The contract is documentation for a publisher that lives outside this repository, so what is
// testable here is the agreement between the policy's claims and the repository it describes:
// the declared phone occurrence set must equal what a root scan actually finds, the public email
// must occur only at its declared pointers, the approval ceremony must bind exactly the declared
// operations, and no undeclared operation block may exist in the write authority.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { siteSchema } from "../src/data/schema.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(path.join(root, rel), "utf8"));
const writable = readJson("governance/writable-paths.v1.json");
const approval = readJson("governance/approval-policy.v1.json");
const siteText = readFileSync(path.join(root, "src/data/site.yaml"), "utf8");
const site = parseYaml(siteText);

function walkFiles(dir, skip, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join("/");
    if (skip.has(rel)) continue;
    const stats = entry.isSymbolicLink() ? statSync(full) : entry;
    if (stats.isDirectory()) out.push(...walkFiles(full, skip, base));
    else if (stats.isFile()) out.push(rel);
  }
  return out;
}

function countLiteral(text, literal) {
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(literal, index)) !== -1) {
    count += 1;
    index += literal.length;
  }
  return count;
}

function resolvePointer(node, pointer) {
  return pointer.replace(/^\//, "").split("/").reduce((current, segment) =>
    Array.isArray(current) ? current[Number(segment)] : current[segment], node);
}

const phoneRule = writable.files[0].fields[0];
const scan = writable.preconditions.find((entry) => entry.kind === "closed_set_occurrence_scan");
const excluded = new Set(scan.scanExclusions.map((entry) => entry.path));

test("src/data/site.yaml satisfies the strict build-time schema", () => {
  const result = siteSchema.safeParse(site);
  assert.equal(result.success, true, JSON.stringify(result.error?.issues ?? null));
});

test("every declared phone target resolves to its matchLiteral in the base record", () => {
  for (const target of phoneRule.targets) {
    assert.equal(resolvePointer(site, target.jsonPointer), target.matchLiteral.replace(/^tel:/, target.render === "tel" ? "tel:" : ""));
  }
  for (const precondition of writable.preconditions.filter((entry) => Array.isArray(entry.assertions))) {
    for (const assertion of precondition.assertions) assert.equal(resolvePointer(site, assertion.jsonPointer), assertion.equals);
  }
});

test("the closed-set occurrence accounting equals a root scan of the repository", () => {
  const files = walkFiles(root, excluded);
  const found = new Map(scan.expectedOccurrences.map((entry) => [entry.literal, 0]));
  const where = [];
  for (const rel of files) {
    const bytes = readFileSync(path.join(root, rel));
    for (const [literal] of found) {
      if (!bytes.includes(literal)) continue;
      const count = countLiteral(bytes.toString("utf8"), literal);
      found.set(literal, found.get(literal) + count);
      where.push(`${rel}: ${literal} x${count}`);
    }
  }
  for (const entry of scan.expectedOccurrences) {
    assert.equal(found.get(entry.literal), entry.count, `${entry.literal} occurrences: ${where.join(", ")}`);
  }
  assert.equal(scan.totalDeclaredTargets, phoneRule.targets.length);
  assert.equal(writable.coupledSet.totalTargets, phoneRule.targets.length);
  assert.deepEqual(writable.coupledSet.paths, writable.files.map((entry) => entry.path));
  assert.deepEqual(scan.nonRenderingOccurrences, []);
});

test("the public email occurs only at its two declared pointers", () => {
  const email = writable.publicEmailPatch;
  const display = resolvePointer(site, email.currentValuePointer);
  assert.equal(resolvePointer(site, email.currentMailtoPointer), `mailto:${display}`);
  for (const assertion of email.semanticAssertions) assert.equal(resolvePointer(site, assertion.jsonPointer), assertion.equals);
  const emailExcluded = new Set(email.scanExclusions.map((entry) => entry.path));
  const declaredPaths = new Set(email.targets.map((target) => target.path));
  for (const rel of walkFiles(root, emailExcluded)) {
    const bytes = readFileSync(path.join(root, rel));
    if (!bytes.includes(display)) continue;
    assert.equal(declaredPaths.has(rel), true, `undeclared public email occurrence in ${rel}`);
    assert.equal(countLiteral(bytes.toString("utf8"), display), 2, `${rel} must carry the email exactly twice (value + mailto)`);
  }
});

test("the approval ceremony binds exactly the declared operations", () => {
  const declared = new Set(["public_phone_patch", "public_email_patch", "site_text_patch"]);
  assert.deepEqual(new Set(approval.operations.map((entry) => entry.operationKind)), declared);
  assert.equal(approval.default, "deny");
  assert.equal(approval.naturalLanguageApproval, "deny");
  for (const entry of approval.operations) assert.deepEqual(entry.requiredApprovalStages, ["publication_approval"]);
});

test("no undeclared operation block exists and every documented operation stays denied", () => {
  for (const key of ["linkPatch", "typedPageCreate", "publicOpeningHoursReplace", "articlePublish"]) {
    assert.equal(key in writable, false, `${key} must not be declared by this contract version`);
  }
  assert.equal(writable.default, "deny");
  assert.ok(writable.documentedOperations.some((entry) => entry.operationKind === "public_hours_patch"));
  for (const entry of writable.documentedOperations) assert.equal(entry.permitted, false, entry.operationKind);
});

test("components render the governed facts from the record, never from literals", () => {
  const components = ["src/components/SinglePageContact.astro", "src/components/Footer.astro", "src/layouts/BaseLayout.astro", "src/pages/index.astro"];
  for (const rel of components) {
    const text = readFileSync(path.join(root, rel), "utf8");
    assert.equal(text.includes(site.contact.rows[0].value), false, `${rel} hardcodes the phone`);
    assert.equal(text.includes(site.contact.rows[1].value), false, `${rel} hardcodes the email`);
    assert.equal(text.includes("lib/content"), true, `${rel} must read src/lib/content.ts`);
  }
});

test("every catalogued text surface resolves to a single-line string in its governed file, and none is a structural or governed-fact pointer", () => {
  const text = writable.textPatch;
  assert.equal(text.patternedSurfaces, null);
  assert.deepEqual(text.files, ["src/data/site.yaml", "src/data/sections.yaml"]);
  const docs = { "src/data/site.yaml": site, "src/data/sections.yaml": parseYaml(readFileSync(path.join(root, "src/data/sections.yaml"), "utf8")) };
  const ids = new Set();
  const forbiddenTail = /\/(href|ctaHref|kind|variant|icon|external|number|src|width|height|label|linkLabel|ctaLabel)$/;
  for (const surface of text.enumeratedSurfaces) {
    assert.equal(ids.has(surface.surfaceId), false, `duplicate ${surface.surfaceId}`); ids.add(surface.surfaceId);
    assert.match(surface.surfaceId, /^[a-z0-9.-]{1,120}$/);
    assert.equal(forbiddenTail.test(surface.jsonPointer), false, surface.surfaceId);
    assert.equal(/^\/contact\/rows\/[01]\//.test(surface.jsonPointer) || /^\/embassy\/(phone|email)\//.test(surface.jsonPointer), false, surface.surfaceId);
    const value = resolvePointer(docs[surface.file], surface.jsonPointer);
    assert.equal(typeof value, "string", surface.surfaceId);
    assert.equal(value.includes("\n"), false, surface.surfaceId);
  }
  assert.ok(text.enumeratedSurfaces.length >= 60);
  for (const literal of text.constraints.preserveLiteralOccurrences.map((entry) => entry.literal)) {
    assert.ok(scan.expectedOccurrences.some((entry) => entry.literal === literal), `${literal} must be governed by the closed-set scan`);
  }
});

test("every section markdown file has a governed record and carries only structure", () => {
  const sections = parseYaml(readFileSync(path.join(root, "src/data/sections.yaml"), "utf8"));
  const dir = path.join(root, "src/content/sections");
  for (const rel of walkFiles(dir, new Set(), dir).filter((name) => name.endsWith(".md"))) {
    const key = rel.replace(/\.md$/, "").split("/").join("-");
    assert.ok(sections[key], `no record for ${rel}`);
    const front = readFileSync(path.join(dir, rel), "utf8").split("\n---\n")[0].replace(/^---\n/, "");
    const keys = Object.keys(parseYaml(front)).sort();
    assert.deepEqual(keys.filter((k) => !["page", "order", "pattern", "surface"].includes(k)), [], `${rel} still carries copy in frontmatter`);
  }
});

test("every prose surface names a frontmatter-led section file whose record exists, and every label surface resolves to a label string away from the governed facts", () => {
  const text = writable.textPatch;
  const sections = parseYaml(readFileSync(path.join(root, "src/data/sections.yaml"), "utf8"));
  assert.equal(text.proseSurfaces.constraints.markdown, "prose-only");
  assert.ok(text.proseSurfaces.constraints.maxValueBytes <= text.constraints.maxTotalValueBytes);
  const files = new Set();
  for (const surface of text.proseSurfaces.surfaces) {
    assert.match(surface.surfaceId, /^section\.[a-z0-9-]+\.body$/);
    assert.equal(files.has(surface.file), false, `prose file declared twice: ${surface.file}`); files.add(surface.file);
    const raw = readFileSync(path.join(root, surface.file), "utf8");
    assert.ok(raw.startsWith("---\n") && raw.indexOf("\n---\n", 3) > 0, `${surface.file} must open with a closed frontmatter block`);
    assert.ok(sections[surface.surfaceId.slice("section.".length, -".body".length)], `${surface.file} has no governed record`);
  }
  const dir = path.join(root, "src/content/sections");
  const onDisk = walkFiles(dir, new Set(), dir).filter((name) => name.endsWith(".md")).length;
  assert.equal(text.proseSurfaces.surfaces.length, onDisk, "every section body is a prose surface");
  for (const surface of text.labelSurfaces.surfaces) {
    assert.match(surface.jsonPointer, /\/(label|ctaLabel|linkLabel)$/);
    assert.equal(/^\/(contact|embassy|meta)\//.test(surface.jsonPointer), false, surface.surfaceId);
    assert.equal(typeof resolvePointer(site, surface.jsonPointer), "string", surface.surfaceId);
  }
  assert.equal(text.labelSurfaces.surfaces.filter((s) => s.jsonPointer.startsWith("/nav/items/")).length, site.nav.items.length, "every navigation label is governed");
});

// The coverage proof: adding copy to this site without governing it must FAIL here. Every string in
// the two governed data files is either an addressable text/label surface, a prose body, a target of
// the phone/email coupled sets, or one of the few strings frozen on purpose — and each frozen one is
// named with its reason, so widening the exception set is a deliberate, reviewable act.
const FROZEN_TAILS = ["/href", "/icon", "/src", "/kind", "/variant", "/external", "/number", "/width", "/height"];
const FROZEN_POINTERS = new Map([
  ["/meta/lang", "Document language: structural, not copy."],
  ["/meta/themeColor", "Browser theme colour: structural, not copy."],
  ["/contact/rows/0/value", "The public phone number — owned by public_phone_patch, editable through that operation."],
  ["/contact/rows/1/value", "The public email address — owned by public_email_patch, editable through that operation."],
  ["/contact/rows/0/label", "Names the governed phone beside it: an identity assertion, not prose."],
  ["/contact/rows/1/label", "Names the governed email beside it: an identity assertion, not prose."],
  ["/contact/rows/2/label", "Same shape as the two governed rows; kept identity for one consistent rule."],
  ["/address/addressCountry", "ISO country code in structured data, not prose."],
  ["/embassy/phone/display", "The Wellington Embassy's own contact fact: a third party's, never ours to edit."],
  ["/embassy/email/display", "The Wellington Embassy's own contact fact: a third party's, never ours to edit."],
]);

test("every visible string in the governed data files is addressable, or frozen for a stated reason", () => {
  const sections = parseYaml(readFileSync(path.join(root, "src/data/sections.yaml"), "utf8"));
  const text = writable.textPatch;
  const covered = new Set([
    ...text.enumeratedSurfaces.map((surface) => `${surface.file}#${surface.jsonPointer}`),
    ...text.labelSurfaces.surfaces.map((surface) => `${surface.file}#${surface.jsonPointer}`),
  ]);
  const strings = (node, pointer = "") => {
    if (node !== null && typeof node === "object") {
      return Object.entries(node).flatMap(([key, value]) => strings(value, `${pointer}/${key}`));
    }
    return typeof node === "string" ? [[pointer, node]] : [];
  };
  const ungoverned = [];
  for (const [file, doc] of [["src/data/site.yaml", site], ["src/data/sections.yaml", sections]]) {
    for (const [pointer] of strings(doc)) {
      if (covered.has(`${file}#${pointer}`)) continue;
      if (FROZEN_TAILS.some((tail) => pointer.endsWith(tail))) continue;
      if (file === "src/data/site.yaml" && FROZEN_POINTERS.has(pointer)) continue;
      ungoverned.push(`${file}#${pointer}`);
    }
  }
  assert.deepEqual(ungoverned, [], "new copy must be catalogued (or frozen with a reason) before it ships");
  // The two frozen values really are the coupled-set targets — "editable through another operation"
  // must be true, not merely asserted.
  const factTargets = new Set([
    ...writable.files.flatMap((entry) => entry.fields.flatMap((field) => field.targets.map((target) => target.jsonPointer))),
    ...writable.publicEmailPatch.targets.flatMap((entry) => entry.pointers.map((pointer) => pointer.jsonPointer)),
  ]);
  for (const pointer of ["/contact/rows/0/value", "/contact/rows/1/value"]) {
    assert.equal(factTargets.has(pointer), true, `${pointer} must be written by a governed fact operation`);
  }
  // Sanity on the shape of the promise: the catalogue is large, and each section has exactly one body.
  assert.ok(text.enumeratedSurfaces.length + text.labelSurfaces.surfaces.length + text.proseSurfaces.surfaces.length >= 100);
});

