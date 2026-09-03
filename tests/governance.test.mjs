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
  const declared = new Set(["public_phone_patch", "public_email_patch"]);
  assert.deepEqual(new Set(approval.operations.map((entry) => entry.operationKind)), declared);
  assert.equal(approval.default, "deny");
  assert.equal(approval.naturalLanguageApproval, "deny");
  for (const entry of approval.operations) assert.deepEqual(entry.requiredApprovalStages, ["publication_approval"]);
});

test("no undeclared operation block exists and every documented operation stays denied", () => {
  for (const key of ["textPatch", "linkPatch", "typedPageCreate", "publicOpeningHoursReplace", "articlePublish"]) {
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
