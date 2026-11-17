export const labRoles = [
  "Director",
  "Advisory Committee Member",
  "In-Charge, COiN Lab",
  "Research Area Head",
  "Lead Researcher",
  "Research Associate",
  "Research Assistant",
  "Research Intern",
];
const leadershipRoles = [
  "Director",
  "Advisory Committee Member",
  "In-Charge, COiN Lab",
];
export function roleType(role) {
  return leadershipRoles.includes(role) ? "leadership" : "researcher";
}

// Display hierarchy for the /people page: top to bottom.
export const peopleTiers = [
  {
    key: "leadership",
    label: "Leadership",
    roles: ["Director", "Advisory Committee Member", "In-Charge, COiN Lab"],
  },
  { key: "heads", label: "Research Area Heads", roles: ["Research Area Head"] },
  {
    key: "researchers",
    label: "Researchers",
    roles: ["Lead Researcher", "Research Associate"],
  },
  {
    key: "students",
    label: "Student Researchers",
    roles: ["Research Assistant", "Research Intern"],
  },
];
export function roleTier(role) {
  return (
    peopleTiers.find((tier) => tier.roles.includes(role)) || peopleTiers[2]
  );
}
