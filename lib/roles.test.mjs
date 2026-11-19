import assert from "node:assert/strict";
import { test } from "node:test";
import { buildHierarchy, rankPeople, seedRoles, sortRoles } from "./roles.js";

const roles = [
  { name: "Intern", serial: 3, tier: "Students" },
  { name: "Director", serial: 1, tier: "Leadership" },
  { name: "Advisor", serial: 2, tier: "Leadership" },
  { name: "Visitor", serial: "", tier: "" },
];

test("sortRoles orders by serial and puts missing serials last", () => {
  assert.deepEqual(
    sortRoles(roles).map((r) => r.name),
    ["Director", "Advisor", "Intern", "Visitor"],
  );
});

test("rankPeople uses the role's serial, then name", () => {
  const people = [
    { name: "Zed", role: "Intern" },
    { name: "Cal", role: "Advisor", serial: 1 },
    { name: "Bea", role: "Advisor", serial: 2 },
    { name: "Amy", role: "Director" },
    { name: "Abe", role: "Intern" },
  ];
  assert.deepEqual(
    rankPeople(people, roles).map((p) => p.name),
    ["Amy", "Bea", "Cal", "Abe", "Zed"],
  );
});

test("buildHierarchy groups by tier, drops empty tiers, keeps unknown roles", () => {
  const tiers = buildHierarchy(
    [
      { name: "Amy", role: "Director" },
      { name: "Cal", role: "Advisor" },
      { name: "Vi", role: "Visitor" },
      { name: "Old", role: "Retired role" },
    ],
    roles,
  );
  assert.deepEqual(
    tiers.map((t) => [t.label, t.members.map((m) => m.name)]),
    [
      ["Leadership", ["Amy", "Cal"]],
      ["Visitor", ["Vi"]],
      ["Members", ["Old"]],
    ],
  );
});

test("seed roles have unique slugs and ascending serials", () => {
  assert.equal(new Set(seedRoles.map((r) => r.slug)).size, seedRoles.length);
  assert.deepEqual(
    seedRoles.map((r) => r.serial),
    [...seedRoles.map((r) => r.serial)].sort((a, b) => a - b),
  );
});
