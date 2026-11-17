import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, isJobOpen } from "./jobs.js";

const now = new Date("2026-11-18T10:00:00Z");

test("isJobOpen respects the active switch and the deadline day", () => {
  assert.equal(isJobOpen({ active: true }, now), true);
  assert.equal(isJobOpen({ active: false, deadline: "2099-01-01" }, now), false);
  assert.equal(isJobOpen({ deadline: "2026-11-18" }, now), true); // deadline day still open
  assert.equal(isJobOpen({ deadline: "2026-11-17" }, now), false);
  assert.equal(isJobOpen(null, now), false);
});

test("formatDate is stable across time zones and tolerant of bad input", () => {
  assert.equal(formatDate("2026-11-18"), "18 Nov 2026");
  assert.equal(formatDate(""), "");
  assert.equal(formatDate("not a date"), "");
});
