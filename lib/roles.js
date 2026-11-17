// Lab roles and the people hierarchy. Roles are CMS data (the `roles`
// collection): each has a `serial` that sets its place in the hierarchy and a
// `tier` that groups neighbouring roles under one heading. Dependency-free so
// it runs on the server, in the browser and under `node --test`.

// Used until roles are saved in the CMS, and to seed the collection.
export const seedRoles = [
  { slug: "co-founder", name: "Co-Founder", serial: 1, tier: "Founders" },
  { slug: "director", name: "Director", serial: 2, tier: "Leadership" },
  { slug: "advisory-committee-member", name: "Advisory Committee Member", serial: 3, tier: "Leadership" },
  { slug: "in-charge-coin-lab", name: "In-Charge, COiN Lab", serial: 4, tier: "Leadership" },
  { slug: "research-area-head", name: "Research Area Head", serial: 5, tier: "Research Area Heads" },
  { slug: "lead-researcher", name: "Lead Researcher", serial: 6, tier: "Researchers" },
  { slug: "research-associate", name: "Research Associate", serial: 7, tier: "Researchers" },
  { slug: "research-assistant", name: "Research Assistant", serial: 8, tier: "Student Researchers" },
  { slug: "research-intern", name: "Research Intern", serial: 9, tier: "Student Researchers" },
];

export const defaultRole = "Research Assistant";

// Missing or non-numeric serials sort last.
const serial = (value) => (value === "" || value == null || Number.isNaN(Number(value)) ? Infinity : Number(value));
const byName = (a, b) => String(a.name || "").localeCompare(String(b.name || ""));

export function sortRoles(roles) {
  return [...roles].sort((a, b) => serial(a.serial) - serial(b.serial) || byName(a, b));
}

// The heading a role sits under; a role with no tier is its own heading.
export const roleTier = (role) => String(role?.tier || "").trim() || role?.name || "";

// People in hierarchy order: by their role's serial, then by name.
export function rankPeople(people, roles) {
  const rank = new Map(sortRoles(roles).map((role, index) => [role.name, index]));
  const roleRank = (person) => rank.get(person.role) ?? Infinity;
  return [...people].sort((a, b) => roleRank(a) - roleRank(b) || byName(a, b));
}

/**
 * Groups people into tiers, top of the hierarchy first.
 * Returns [{ key, label, members }]; tiers with no members are dropped and
 * people whose role is not in `roles` land in a final "Members" tier.
 */
export function buildHierarchy(people, roles) {
  const tierOf = new Map(roles.map((role) => [role.name, roleTier(role)]));
  const tiers = new Map(sortRoles(roles).map((role) => [roleTier(role), []]));
  const other = [];
  for (const person of rankPeople(people, roles)) (tiers.get(tierOf.get(person.role)) || other).push(person);
  const result = [...tiers].map(([label, members]) => ({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, members }));
  if (other.length) result.push({ key: "members", label: "Members", members: other });
  return result.filter((tier) => tier.members.length);
}
