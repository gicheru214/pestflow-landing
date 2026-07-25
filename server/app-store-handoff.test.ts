import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_STORE_HANDOFF_EVENT,
  buildAppStoreSuccessPath,
  fireMetaAppStoreHandoffOnce,
  normalizeAppStoreHandoffEventId,
} from "../client/src/lib/appStoreHandoff";

test("builds a dedicated App Store success path with paid attribution", () => {
  const path = buildAppStoreSuccessPath(
    {
      utm_source: "facebook",
      utm_campaign: "july-winners",
      fbclid: "fb-click-123",
    },
    "pestflow-appstore-event-123",
  );
  const url = new URL(path, "https://pestflow.org");

  assert.equal(url.pathname, "/app-store-success");
  assert.equal(url.searchParams.get("source"), "home_mobile_top");
  assert.equal(url.searchParams.get("app_store_event_id"), "pestflow-appstore-event-123");
  assert.equal(url.searchParams.get("utm_source"), "facebook");
  assert.equal(url.searchParams.get("utm_campaign"), "july-winners");
  assert.equal(url.searchParams.get("fbclid"), "fb-click-123");
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
