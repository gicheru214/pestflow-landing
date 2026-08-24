import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APP_STORE_HANDOFF_EVENT,
  APP_STORE_URL,
  DESKTOP_LOGIN_URL,
  GOOGLE_PLAY_URL,
  buildAppStoreSuccessPath,
  fireMetaAppStoreHandoffOnce,
  normalizeAppStoreHandoffEventId,
  resolveAppHandoffDestination,
} from "../client/src/lib/appStoreHandoff";
import { buildMobileFieldSuccessPath } from "../client/src/lib/mobileFieldHandoff";
import { capturedWorkflowLeadEventId } from "../client/src/lib/workflowLeadHandoff";

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

test("keeps the App Store milestone separate from Lead and Signup", () => {
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

test("resolves the success handoff destination for each supported platform", () => {
  const iphone = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  });
  const ipadDesktopUa = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
    platform: "MacIntel",
    maxTouchPoints: 5,
  });
  const macDesktop = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
    platform: "MacIntel",
    maxTouchPoints: 0,
  });
  const android = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36",
    userAgentDataMobile: true,
  });

  assert.deepEqual(
    [iphone.platform, iphone.url, iphone.telemetryDestination],
    ["ios_ipados", APP_STORE_URL, "apple_app_store"],
  );
  assert.deepEqual(
    [ipadDesktopUa.platform, ipadDesktopUa.url, ipadDesktopUa.telemetryDestination],
    ["ios_ipados", APP_STORE_URL, "apple_app_store"],
  );
  assert.deepEqual(
    [android.platform, android.url, android.telemetryDestination],
    ["android", GOOGLE_PLAY_URL, "google_play_store"],
  );
  assert.deepEqual(
    [macDesktop.platform, macDesktop.url, macDesktop.telemetryDestination],
    ["desktop", DESKTOP_LOGIN_URL, "desktop_login"],
  );
});

test("reports mobile store destinations truthfully and keeps desktop out of the store event", () => {
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

  const android = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36",
  });
  const desktop = resolveAppHandoffDestination({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
  });

  assert.equal(fireMetaAppStoreHandoffOnce("pestflow-appstore-android-123", android), true);
  assert.equal(fireMetaAppStoreHandoffOnce("pestflow-appstore-android-123", android), true);
  assert.equal(fireMetaAppStoreHandoffOnce("pestflow-appstore-desktop-123", desktop), false);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0]?.[2], {
    content_name: "PestFlow Android App",
    content_category: "mobile_app",
    destination: "google_play_store",
    platform: "android",
  });

  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
});

test("fires a deduplicated Lead on success only for captured workflow leads", () => {
  const successSource = readFileSync(
    "client/src/pages/signup-success.tsx",
    "utf8",
  );
  const popupSource = readFileSync(
    "client/src/components/home/playbook-activation-popup.tsx",
    "utf8",
  );
  const appStoreBranch = successSource.slice(
    successSource.indexOf("if (isAppStoreHandoff)"),
    successSource.indexOf("if (completedAccountSignup)"),
  );

  assert.match(popupSource, /beginMetaLeadEvent\(\)/);
  assert.match(popupSource, /next\.set\("meta_event_id", metaEventId\)/);
  assert.equal(
    capturedWorkflowLeadEventId(
      "playbook_workflow_recurring",
      "pestflow-lead-event-123",
    ),
    "pestflow-lead-event-123",
  );
  assert.equal(
    capturedWorkflowLeadEventId(
      "mobile_banner",
      "pestflow-lead-event-123",
    ),
    null,
  );
  assert.equal(
    capturedWorkflowLeadEventId("playbook_workflow_invoice", "bad id"),
    null,
  );
  assert.match(successSource, /capturedWorkflowLeadEventId\(/);
  assert.match(successSource, /fireMetaLeadOnce\(leadEventId\)/);
  assert.match(successSource, /const APP_STORE_OPEN_DELAY_MS = 1400/);
  assert.match(successSource, /const APP_STORE_FALLBACK_DELAY_MS = 5000/);
  assert.match(successSource, /window\.open\(appHandoffDestination\.url, "_blank"\)/);
  assert.match(successSource, /automatic_result: isInternalPreview/);
  assert.match(successSource, /"window_created"/);
  assert.match(successSource, /"popup_blocked"/);
  assert.match(successSource, /setShowHandoffFallback\(true\)/);
  assert.match(successSource, /data-testid="handoff-fallback-link"/);
  assert.match(successSource, /method: "manual_fallback"/);
  assert.doesNotMatch(
    appStoreBranch,
    /SIGNUP\.COMPLETE|CHECKOUT\.SUCCESS|ACCOUNT\.SIGNUP_COMPLETE/,
  );
});
