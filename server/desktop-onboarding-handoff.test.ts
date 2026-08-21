import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOnboardingHandoffUrl,
  isMobileOnboardingClient,
  replaceMobileAppUrlForDesktop,
} from "../client/src/lib/onboardingHandoff";

const WINDOWS_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36";

test("desktop onboarding goes to desktop signup without routes or a mobile path", () => {
  const isMobile = isMobileOnboardingClient({ userAgent: WINDOWS_CHROME });
  const url = new URL(buildOnboardingHandoffUrl(isMobile, {
    routes: "73",
    email: "arthur@example.com",
    utm_source: "google",
  }));

  assert.equal(isMobile, false);
  assert.equal(url.pathname, "/signup");
  assert.equal(url.searchParams.get("desktop"), "true");
  assert.equal(url.searchParams.get("routes"), null);
  assert.equal(url.searchParams.get("email"), "arthur@example.com");
  assert.equal(url.toString().includes("/mobile/"), false);
});

test("resizing a desktop browser cannot turn it into a mobile device", () => {
  assert.equal(isMobileOnboardingClient({
    userAgent: WINDOWS_CHROME,
    maxTouchPoints: 10,
    platform: "Win32",
  }), false);
});

test("iPhone and iPadOS clients retain the mobile onboarding flow", () => {
  assert.equal(isMobileOnboardingClient({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) Mobile/15E148 Safari/604.1",
  }), true);
  assert.equal(isMobileOnboardingClient({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15",
    maxTouchPoints: 5,
    platform: "MacIntel",
  }), true);

  const url = new URL(buildOnboardingHandoffUrl(true, { routes: "3" }));
  assert.equal(url.pathname, "/mobile/onboard/feature");
  assert.equal(url.searchParams.get("routes"), "3");
});

test("desktop signup-success rewrites stale mobile return_to links", () => {
  const stale = new URL("https://app.pestflow.org/mobile-v2-field.html?screen=auth-signup&routes=73&email=arthur%40example.com");
  const url = replaceMobileAppUrlForDesktop(stale);

  assert.equal(url.pathname, "/signup");
  assert.equal(url.searchParams.get("routes"), null);
  assert.equal(url.searchParams.get("email"), "arthur@example.com");
  assert.equal(url.searchParams.get("desktop"), "true");
});
