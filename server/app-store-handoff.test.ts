import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APP_STORE_HANDOFF_EVENT,
  buildAppStoreSuccessPath,
  fireMetaAppStoreHandoffOnce,
  normalizeAppStoreHandoffEventId,
} from "../client/src/lib/appStoreHandoff";
import { buildMobileFieldSuccessPath } from "../client/src/lib/mobileFieldHandoff";

test("builds the shared success path for an App Store handoff with paid attribution", () => {
  const path = buildAppStoreSuccessPath(
    {
      utm_source: "facebook",
      utm_campaign: "july-winners",
      fbclid: "fb-click-123",
    },
    "pestflow-appstore-event-123",
  );
  const url = new URL(path, "https://pestflow.org");

  assert.equal(url.pathname, "/signup-success");
  assert.equal(url.searchParams.get("handoff"), "app_store");
  assert.equal(url.searchParams.get("source"), "home_mobile_top");
  assert.equal(url.searchParams.get("app_store_event_id"), "pestflow-appstore-event-123");
  assert.equal(url.searchParams.get("utm_source"), "facebook");
  assert.equal(url.searchParams.get("utm_campaign"), "july-winners");
  assert.equal(url.searchParams.get("fbclid"), "fb-click-123");
});

test("builds the shared success path before mobile-v2 signup", () => {
  const path = buildMobileFieldSuccessPath({
    source: "popup_playbook",
    firstName: "Alex",
    email: "alex@example.com",
    metaEventId: "pestflow-lead-event-123",
    search: "?utm_source=facebook&fbclid=fb-click-123",
  });
  const successUrl = new URL(path, "https://pestflow.org");
  const finalUrl = new URL(successUrl.searchParams.get("return_to") || "");

  assert.equal(successUrl.pathname, "/signup-success");
  assert.equal(successUrl.searchParams.get("source"), "popup_playbook");
  assert.equal(successUrl.searchParams.get("meta_event_id"), "pestflow-lead-event-123");
  assert.equal(successUrl.searchParams.get("utm_source"), "facebook");
  assert.equal(finalUrl.pathname, "/mobile-v2-field.html");
  assert.equal(finalUrl.searchParams.get("screen"), "auth-signup");
  assert.equal(finalUrl.searchParams.get("firstName"), "Alex");
  assert.equal(finalUrl.searchParams.get("email"), "alex@example.com");
});

test("uses the controllable mobile banner instead of Safari's direct App Store banner", () => {
  const indexHtml = readFileSync("client/index.html", "utf8");
  const bannerSource = readFileSync(
    "client/src/components/home/mobile-download-banner.tsx",
    "utf8",
  );

  assert.doesNotMatch(indexHtml, /apple-itunes-app/);
  assert.match(bannerSource, /signup-success\?handoff=app_store/);
});

test("uses a separate Meta event rather than a Lead or Signup", () => {
  const calls: unknown[][] = [];
  const stored = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { fbq: (...args: unknown[]) => calls.push(args) },
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    },
  });

  assert.equal(APP_STORE_HANDOFF_EVENT, "AppStoreHandoff");
  assert.equal(normalizeAppStoreHandoffEventId("pestflow-appstore-event-123"), "pestflow-appstore-event-123");
  assert.equal(normalizeAppStoreHandoffEventId("bad id with spaces"), null);
  assert.equal(fireMetaAppStoreHandoffOnce("pestflow-appstore-event-123"), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.[0], "trackCustom");
  assert.equal(calls[0]?.[1], "AppStoreHandoff");
  assert.notEqual(calls[0]?.[1], "Lead");
  assert.notEqual(calls[0]?.[1], "Signup");

  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
});
