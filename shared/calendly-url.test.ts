import assert from "node:assert/strict";
import test from "node:test";
import { buildPestFlowCalendlyUrl } from "./calendly-url";

test("prefills Calendly from the captured playbook contact", () => {
  const url = new URL(buildPestFlowCalendlyUrl({
    name: " Brian Weems ",
    email: " BRIANWEEMS21@YAHOO.COM ",
    phone: "(609) 613-7441",
    selectedDate: "2026-08-14",
  }));

  assert.equal(url.searchParams.get("name"), "Brian Weems");
  assert.equal(url.searchParams.get("email"), "brianweems21@yahoo.com");
  assert.equal(url.searchParams.get("location"), "6096137441");
  assert.equal(url.searchParams.get("month"), "2026-08");
  assert.equal(url.searchParams.get("date"), "2026-08-14");
  assert.equal(url.searchParams.get("utm_campaign"), "playbook-workflow-v2");
});

test("preserves inbound campaign attribution in the Calendly handoff", () => {
  const url = new URL(buildPestFlowCalendlyUrl({
    utmSource: "facebook",
    utmMedium: "paid_social",
    utmCampaign: "owner-playbook-test",
    utmContent: "popup-b",
  }));

  assert.equal(url.searchParams.get("utm_source"), "facebook");
  assert.equal(url.searchParams.get("utm_medium"), "paid_social");
  assert.equal(url.searchParams.get("utm_campaign"), "owner-playbook-test");
  assert.equal(url.searchParams.get("utm_content"), "popup-b");
});
