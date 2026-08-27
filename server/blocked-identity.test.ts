import assert from "node:assert/strict";
import test from "node:test";
import {
  blockedSubmissionIdentity,
  normalizeBlockedEmail,
  normalizeBlockedPhone,
} from "./blocked-identity";

test("normalizes blocked emails and US phone numbers", () => {
  assert.equal(normalizeBlockedEmail(" Person@Example.COM "), "person@example.com");
  assert.equal(normalizeBlockedPhone("+1 (305) 555-0199"), "3055550199");
});

test("blocks a submission by email after an account has been deleted", () => {
  assert.deepEqual(
    blockedSubmissionIdentity(
      { email: "BLOCKED@example.com" },
      "blocked@example.com,another@example.com",
      "",
    ),
    { type: "email", normalizedValue: "blocked@example.com" },
  );
});

test("blocks equivalent phone formatting but allows unrelated identities", () => {
  assert.deepEqual(
    blockedSubmissionIdentity(
      { phone: "+1 305-555-0199" },
      "",
      "(305) 555-0199",
    ),
    { type: "phone", normalizedValue: "3055550199" },
  );
  assert.equal(
    blockedSubmissionIdentity(
      { email: "allowed@example.com", phone: "3055550100" },
      "blocked@example.com",
      "3055550199",
    ),
    null,
  );
});
