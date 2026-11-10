import assert from "node:assert/strict";
import test from "node:test";
import { leadAdSourceFromRequest, leadAdSourceFromTracking } from "./lead-ad-source";

test("distinguishes tagged Facebook, Instagram, Meta and paid Google traffic", () => {
  assert.equal(leadAdSourceFromTracking({ utm_source: "fb", utm_medium: "paid_social" }), "facebook");
  assert.equal(leadAdSourceFromTracking({ utm_source: " IG " }), "instagram");
  assert.equal(leadAdSourceFromTracking({ fbclid: "test-click" }), "meta");
  assert.equal(leadAdSourceFromTracking({ utm_source: "google", utm_medium: "paid-search" }), "google_ads");
  assert.equal(leadAdSourceFromTracking({ gclid: "test-click" }), "google_ads");
  assert.equal(leadAdSourceFromTracking({ wbraid: "test-click" }), "google_ads");
  assert.equal(leadAdSourceFromTracking({ gbraid: "test-click" }), "google_ads");
  assert.equal(leadAdSourceFromTracking({ utm_source: "google", utm_medium: "organic" }), "google");
  assert.equal(leadAdSourceFromTracking({ utm_source: "google.com" }), null);
  assert.equal(leadAdSourceFromTracking({ gclid: "google", fbclid: "meta" }), null);
});

test("uses a tagged submission page before saved campaign data", () => {
  const saved = JSON.stringify({ utm_source: "fb" });
  assert.equal(leadAdSourceFromRequest("https://pestflow.org/?gclid=example", saved), "google_ads");
  assert.equal(leadAdSourceFromRequest("https://pestflow.org/playbook", saved), "facebook");
  assert.equal(leadAdSourceFromRequest("https://pestflow.org/?utm_source=newsletter", saved), null);
  assert.equal(leadAdSourceFromRequest(undefined, "invalid-json"), null);
});
