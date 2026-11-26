import assert from "node:assert/strict";
import test from "node:test";
import { withoutCallbackConsent } from "./callback";

test("website phone submissions do not grant AI callback consent", () => {
  for (const type of ["newsletter", "tech_lead", "trial_lead", "referral_partner", "popup_partial"]) {
    const result = withoutCallbackConsent({ type, phone: "2125550199", callbackConsent: true });
    assert.equal(result.callbackConsent, undefined);
    assert.equal(result.phone, "2125550199");
    assert.equal(result.type, type);
    assert.deepEqual((result as Record<string, unknown>).quizAnswers, {});
  }
});

test("embedded consent is stripped while other lead details are preserved", () => {
  const quizAnswers = { ownerRelationships: "2-5", aiSalesCallbackConsent: { granted: true } };
  const result = withoutCallbackConsent({ email: "owner@example.net", quizAnswers });
  assert.deepEqual(result.quizAnswers, { ownerRelationships: "2-5" });
  assert.equal(result.email, "owner@example.net");
  assert.equal(quizAnswers.aiSalesCallbackConsent.granted, true);
});
