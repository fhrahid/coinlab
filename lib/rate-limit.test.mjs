import assert from "node:assert/strict";
import { test } from "node:test";
import { clientAddress, rateLimit } from "./rate-limit.js";

test("rateLimit allows up to the limit, blocks after, and resets with the window", () => {
  const rule = { limit: 2, windowMs: 1000 };
  assert.equal(rateLimit("a", rule, 0).ok, true);
  assert.equal(rateLimit("a", rule, 10).ok, true);
  const blocked = rateLimit("a", rule, 20);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.retryAfter, 1);
  assert.equal(rateLimit("b", rule, 20).ok, true); // other callers are unaffected
  assert.equal(rateLimit("a", rule, 1000).ok, true); // new window
});

test("clientAddress takes the first forwarded hop", () => {
  const request = (headers) => ({ headers: new Headers(headers) });
  assert.equal(clientAddress(request({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })), "1.2.3.4");
  assert.equal(clientAddress(request({ "x-real-ip": "5.6.7.8" })), "5.6.7.8");
  assert.equal(clientAddress(request({})), "unknown");
});
