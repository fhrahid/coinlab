// One definition of "is this posting open?" shared by the public pages, the
// applications API and the CMS list, so they can never disagree.
// Dependency-free: runs on the server, in the browser and under `node --test`.

// Deadlines are stored as "YYYY-MM-DD" and include that whole day (UTC).
export function isJobOpen(job, now = new Date()) {
  if (!job || job.active === false) return false;
  return !job.deadline || job.deadline >= now.toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "";
  // A bare date is parsed as UTC midnight; pin the output to UTC so the day
  // never shifts with the viewer's time zone.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
