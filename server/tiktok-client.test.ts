import assert from "node:assert/strict";
import test from "node:test";
import { captureMarketingAttribution } from "../client/src/lib/marketingAttribution";
import {
  fireTikTokCompleteRegistrationOnce,
  normalizeTikTokPixelId,
} from "../client/src/lib/tiktokPixel";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

test("landing capture shares TikTok identifiers with the app subdomain", () => {
  let sharedCookie = "";
  const captured = captureMarketingAttribution(
    new URLSearchParams("ttclid=tiktok-click-123&utm_source=tiktok&utm_campaign=owner-demo"),
    new URLSearchParams(),
    {
      cookie: "_ttp=tiktok-browser-456",
      storage: memoryStorage(),
      hostname: "pestflow.org",
      pathname: "/",
      now: new Date("2026-09-19T12:00:00.000Z"),
      setCookie: (value) => { sharedCookie = value; },
    },
  );

  assert.equal(captured.ttclid, "tiktok-click-123");
  assert.equal(captured.ttp, "tiktok-browser-456");
  assert.match(sharedCookie, /Domain=\.pestflow\.org/);

  const restored = captureMarketingAttribution(
    new URLSearchParams(),
    new URLSearchParams(),
    {
      cookie: sharedCookie.split(";")[0],
      storage: memoryStorage(),
      hostname: "app.pestflow.org",
      pathname: "/signup",
      setCookie: () => {},
    },
  );
  assert.equal(restored.ttclid, "tiktok-click-123");
  assert.equal(restored.ttp, "tiktok-browser-456");
  assert.equal(restored.utm_source, "tiktok");
});

test("TikTok pixel IDs are validated before a script is loaded", () => {
  assert.equal(normalizeTikTokPixelId("DAI5LNBC77UC8FLK2CBG"), "DAI5LNBC77UC8FLK2CBG");
  assert.equal(normalizeTikTokPixelId("%VITE_TIKTOK_PIXEL_ID%"), null);
  assert.equal(normalizeTikTokPixelId("javascript:alert(1)"), null);
});

test("registration browser event uses the server event ID and only fires once", () => {
  const calls: unknown[][] = [];
  const stored = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ttq: {
        instance: (pixelId: string) => ({
          track: (...args: unknown[]) => calls.push([pixelId, ...args]),
        }),
      },
    },
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => { stored.set(key, value); },
    },
  });

  const eventId = "pestflow-lead-browser-server-123";
  assert.equal(
    fireTikTokCompleteRegistrationOnce(eventId, "DAI5LNBC77UC8FLK2CBG"),
    true,
  );
  assert.equal(
    fireTikTokCompleteRegistrationOnce(eventId, "DAI5LNBC77UC8FLK2CBG"),
    true,
  );
  assert.deepEqual(calls, [[
    "DAI5LNBC77UC8FLK2CBG",
    "CompleteRegistration",
    {},
    { event_id: eventId },
  ]]);

  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "sessionStorage");
});
