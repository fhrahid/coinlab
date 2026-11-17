// Run with: node --test lib/
import assert from "node:assert/strict";
import { test } from "node:test";
import { nameKey, sortPapers, toPublication } from "./publications.js";

test("nameKey ignores honorifics, punctuation and case", () => {
  assert.equal(nameKey("Prof. A. K. M. Masum, PhD"), nameKey("a k m masum"));
  assert.equal(nameKey("Md. Nasir Uddin"), "nasir uddin");
  assert.notEqual(nameKey("Nasir Uddin"), nameKey("Nasir Ahmed"));
});

test("sortPapers puts featured first, then newest", () => {
  const sorted = sortPapers([{ slug: "a", year: 2025 }, { slug: "b", year: 2023, featured: true }, { slug: "c", year: 2026 }]);
  assert.deepEqual(sorted.map((p) => p.slug), ["b", "c", "a"]);
});

test("toPublication links lab authors and drops unsafe links", () => {
  const pub = toPublication(
    { slug: "p", title: "T", authors: ["Md. Nasir Uddin", "Jane Doe"], wingSlugs: ["nlp", "gone"], doi: "10.1/x", codeUrl: "javascript:alert(1)" },
    { people: new Map([["nasir uddin", "md-nasir-uddin"]]), wings: new Map([["nlp", "NLP"]]), pdf: () => "", doi: (d) => `https://doi.org/${d}` },
  );
  assert.deepEqual(pub.authors, [{ name: "Md. Nasir Uddin", href: "/people/md-nasir-uddin" }, { name: "Jane Doe" }]);
  assert.deepEqual(pub.wings, [{ slug: "nlp", title: "NLP" }]);
  assert.equal(pub.doiHref, "https://doi.org/10.1/x");
  assert.equal(pub.codeHref, "");
});
