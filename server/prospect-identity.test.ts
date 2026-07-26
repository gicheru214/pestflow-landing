import assert from "node:assert/strict";
import test from "node:test";
import {
  adminProspectCanonicalKey,
  buildProspectGroups,
  deterministicProspectEventId,
  hashProspectKey,
  isTestProspect,
  type ProspectSubmissionLike,
} from "./prospect-identity";

function row(
  patch: Partial<ProspectSubmissionLike>,
): ProspectSubmissionLike {
  return {
    id: patch.id || crypto.randomUUID(),
    submittedAt: patch.submittedAt || new Date(),
    type: patch.type || "popup_partial",
    firstName: patch.firstName ?? "",
    lastName: patch.lastName ?? "",
    email: patch.email ?? "",
    phone: patch.phone ?? "",
    routeAnswers: patch.routeAnswers,
    quizAnswers: patch.quizAnswers,
  };
}

test("uses the same name-first prospect key as the admin dashboard", () => {
  const named = row({
    firstName: "  Jane ",
    lastName: " Doe ",
    email: "other@example.org",
  });
  assert.equal(adminProspectCanonicalKey(named), "jane   doe");

  const emailOnly = row({
    firstName: "Jane",
    lastName: "",
    email: "JANE@EXAMPLE.ORG ",
  });
  assert.equal(adminProspectCanonicalKey(emailOnly), "jane@example.org");
});

test("dedupes raw submissions while keeping the best funnel row", () => {
  const first = row({
    id: "first",
    submittedAt: "2026-07-24T10:00:00Z",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.org",
  });
  const quiz = row({
    id: "quiz",
    submittedAt: "2026-07-24T11:00:00Z",
    firstName: "Jane",
    lastName: "Doe",
    email: "second@example.org",
    quizAnswers: { revenue: { val: 100, revealed: true } },
  });
  const [group] = buildProspectGroups([first, quiz]);
  assert.equal(group.rows.length, 2);
  assert.equal(group.first.id, "first");
  assert.equal(group.latest.id, "quiz");
  assert.equal(group.best.id, "quiz");
});

test("removes the same synthetic rows hidden by admin", () => {
  assert.equal(isTestProspect(row({
    firstName: "QA",
    lastName: "Test",
    email: "real@example.org",
  })), true);
  assert.equal(isTestProspect(row({
    firstName: "A",
    lastName: "Person",
    email: "lead@mailinator.com",
  })), true);
  assert.equal(isTestProspect(row({
    firstName: "A",
    lastName: "Person",
    email: "owner@company.org",
  })), false);
});

test("creates a stable non-PII Meta event ID from the prospect key", () => {
  const hash = hashProspectKey("jane doe");
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(
    deterministicProspectEventId(hash),
    `pestflow-prospect-${hash.slice(0, 48)}`,
  );
});
