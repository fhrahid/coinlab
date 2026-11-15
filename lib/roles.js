export const labRoles = ['Director', 'Advisory Committee Member', 'In-Charge, COiN Lab', 'Research Area Head', 'Lead Researcher', 'Research Associate', 'Research Assistant', 'Research Intern'];
const leadershipRoles = ['Director', 'Advisory Committee Member', 'In-Charge, COiN Lab'];
export function roleType(role) { return leadershipRoles.includes(role) ? 'leadership' : 'researcher'; }
