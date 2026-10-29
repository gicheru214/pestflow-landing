import assert from "node:assert/strict";
import test from "node:test";
import { isRetryableNoAnswer, usPhone, validZone, withinCallHours } from "./ai-lead-caller-policy";

test("only valid US phone numbers and known lead time zones can be queued", () => {
  assert.equal(usPhone("(212) 555-0123"), "+12125550123");
  assert.equal(usPhone("+1 212 555 0123"), "+12125550123");
  assert.equal(usPhone("1234567"), null);
  assert.equal(validZone("America/New_York"), "America/New_York");
  assert.equal(validZone("UTC"), null);
});

test("calling hours use the lead's local time and weekdays", () => {
  assert.equal(withinCallHours("America/New_York", new Date("2026-10-29T13:00:00Z")), true);
  assert.equal(withinCallHours("America/New_York", new Date("2026-10-29T21:59:00Z")), true);
  assert.equal(withinCallHours("America/New_York", new Date("2026-10-29T22:00:00Z")), false);
  assert.equal(withinCallHours("America/New_York", new Date("2026-11-01T15:00:00Z")), false);
  assert.equal(withinCallHours("America/New_York", new Date("2026-10-31T15:00:00Z")), false);
  assert.equal(withinCallHours("America/Phoenix", new Date("2026-10-29T16:00:00Z")), true);
});

test("a second attempt is considered only for no answer or busy", () => {
  assert.equal(isRetryableNoAnswer("customer-did-not-answer"), true);
  assert.equal(isRetryableNoAnswer("customer-busy"), true);
  assert.equal(isRetryableNoAnswer("customer-ended-call"), false);
  assert.equal(isRetryableNoAnswer("assistant-ended-call"), false);
  assert.equal(isRetryableNoAnswer("call.start.error-billing"), false);
});
