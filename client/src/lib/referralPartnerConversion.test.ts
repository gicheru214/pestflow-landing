import assert from "node:assert/strict";
import test from "node:test";
import { fireReferralPartnerApplicationOnce, rememberReferralPartnerApplication } from "./referralPartnerConversion";

test("a confirmed partner application emits one Lead alongside its existing custom event", () => {
  const saved = new Map<string, string>();
  const calls: unknown[][] = [];
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { fbq: (...args: unknown[]) => calls.push(args) },
  });

  assert.equal(fireReferralPartnerApplicationOnce(), false);
  assert.deepEqual(calls, []);

  const applicationId = "123e4567-e89b-12d3-a456-426614174000";
  assert.equal(rememberReferralPartnerApplication(applicationId), true);
  assert.equal(fireReferralPartnerApplicationOnce(), true);
  assert.deepEqual(calls.map(([kind, name]) => [kind, name]), [
    ["trackCustom", "ReferralPartnerApplication"],
    ["track", "Lead"],
  ]);

  assert.equal(fireReferralPartnerApplicationOnce(), true);
  assert.equal(calls.length, 2);

  // A browser that already fired the older custom event still needs the new Lead.
  saved.delete(`pestflow_referral_partner_lead_fired:${applicationId}`);
  assert.equal(fireReferralPartnerApplicationOnce(), true);
  assert.deepEqual(calls.at(-1)?.slice(0, 2), ["track", "Lead"]);
  assert.equal(calls.length, 3);
});
