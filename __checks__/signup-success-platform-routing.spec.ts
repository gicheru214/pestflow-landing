import { devices, expect, test, type BrowserContextOptions } from "@playwright/test";
import {
  APP_STORE_URL,
  DESKTOP_LOGIN_URL,
  GOOGLE_PLAY_URL,
} from "../client/src/lib/appStoreHandoff";

const cases: Array<{
  name: string;
  context: BrowserContextOptions;
  expectedUrl: string;
  expectedCta: string;
  telemetryDestination: string;
  telemetryPlatform: string;
  initScript?: () => void;
}> = [
  {
    name: "iPhone",
    context: devices["iPhone 13"],
    expectedUrl: APP_STORE_URL,
    expectedCta: "Open PestFlow in the App Store",
    telemetryDestination: "apple_app_store",
    telemetryPlatform: "ios_ipados",
  },
  {
    name: "iPadOS desktop user agent with touch",
    context: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      viewport: { width: 1024, height: 768 },
      hasTouch: true,
    },
    expectedUrl: APP_STORE_URL,
    expectedCta: "Open PestFlow in the App Store",
    telemetryDestination: "apple_app_store",
    telemetryPlatform: "ios_ipados",
    initScript: () => {
      Object.defineProperty(navigator, "platform", { configurable: true, value: "MacIntel" });
      Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 5 });
    },
  },
  {
    name: "Android",
    context: devices["Pixel 7"],
    expectedUrl: GOOGLE_PLAY_URL,
    expectedCta: "Open PestFlow in Google Play",
    telemetryDestination: "google_play_store",
    telemetryPlatform: "android",
  },
  {
    name: "desktop",
    context: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
      hasTouch: false,
    },
    expectedUrl: DESKTOP_LOGIN_URL,
    expectedCta: "Continue to PestFlow login",
    telemetryDestination: "desktop_login",
    telemetryPlatform: "desktop",
  },
];

for (const scenario of cases) {
  test(`${scenario.name}: renders success first, routes correctly, and recovers`, async ({ browser }) => {
    const context = await browser.newContext(scenario.context);
    const recordedEvents: Array<{ event: string; properties: Record<string, unknown> }> = [];
    const metaCalls: unknown[][] = [];
    const capiPayloads: Array<Record<string, unknown>> = [];
    await context.exposeBinding(
        "__recordHandoffRegressionEvent",
        (_source, event: string, properties: Record<string, unknown>) => {
          recordedEvents.push({ event, properties });
        },
      );
    await context.exposeBinding(
        "__recordHandoffRegressionMetaCall",
        (_source, args: unknown[]) => {
          metaCalls.push(args);
        },
      );
    await context.addInitScript(() => {
        const host = window as Window & {
          __recordHandoffRegressionEvent: (
            event: string,
            properties: Record<string, unknown>,
          ) => Promise<void>;
          __recordHandoffRegressionMetaCall: (args: unknown[]) => Promise<void>;
        };
        Object.defineProperty(window, "posthog", {
          configurable: true,
          value: {
            __loaded: true,
            capture: (event: string, properties: Record<string, unknown>) => {
              void host.__recordHandoffRegressionEvent(event, properties);
            },
          },
        });
        Object.defineProperty(window, "fbq", {
          configurable: true,
          value: (...args: unknown[]) => {
            void host.__recordHandoffRegressionMetaCall(args);
          },
        });
    });
    if (scenario.initScript) await context.addInitScript(scenario.initScript);
    const page = await context.newPage();
    const destinationAttempts: string[] = [];

    await context.route("**/*", async (route) => {
        const request = route.request();
        const requestUrl = new URL(request.url());
        if (requestUrl.pathname === "/api/meta/app-store-handoff") {
          capiPayloads.push(request.postDataJSON() as Record<string, unknown>);
          await route.fulfill({
            status: 202,
            contentType: "application/json",
            body: JSON.stringify({ ok: true }),
          });
          return;
        }
        const isExternalMainNavigation = request.isNavigationRequest()
          && requestUrl.origin !== "http://127.0.0.1:4173";
        if (isExternalMainNavigation) {
          destinationAttempts.push(request.url());
          await route.abort("blockedbyclient");
          return;
        }
        await route.continue();
    });

      await page.goto(
        "/signup-success?handoff=app_store&source=playbook_workflow_recurring&meta_event_id=pestflow-lead-replay-regression",
      );
      await expect(page.getByRole("heading", { name: "You're In!" })).toBeVisible();
      await expect(page.getByText("Taking you into PestFlow…")).toBeVisible();
      expect(destinationAttempts).toEqual([]);

      await expect.poll(() => metaCalls.filter((call) => call[1] === "Lead")).toHaveLength(1);
      const leadCalls = metaCalls.filter((call) => call[1] === "Lead");
      expect(leadCalls).toHaveLength(1);
      expect(leadCalls[0]?.[3]).toEqual({ eventID: "pestflow-lead-replay-regression" });

      const handoffCalls = metaCalls.filter((call) => call[1] === "AppStoreHandoff");
      if (scenario.telemetryPlatform === "desktop") {
        expect(handoffCalls).toHaveLength(0);
        expect(capiPayloads).toHaveLength(0);
      } else {
        expect(handoffCalls).toHaveLength(1);
        expect(handoffCalls[0]?.[2]).toMatchObject({
          destination: scenario.telemetryDestination,
          platform: scenario.telemetryPlatform,
        });
        expect(handoffCalls[0]?.[3]).toMatchObject({
          eventID: expect.stringMatching(/^pestflow-appstore-/),
        });
        await expect.poll(() => capiPayloads).toHaveLength(1);
        expect(capiPayloads[0]).toMatchObject({
          eventId: (handoffCalls[0]?.[3] as { eventID: string }).eventID,
          destination: scenario.telemetryDestination,
          platform: scenario.telemetryPlatform,
        });
      }

      await expect.poll(() => destinationAttempts, { timeout: 4_000 }).toEqual([
        scenario.expectedUrl,
      ]);

      await expect.poll(() => (
        recordedEvents.find(({ event, properties }) => (
          event === "App Store Open Attempt" && properties.method === "automatic"
        ))
      )).toBeTruthy();
      const automaticAttempt = recordedEvents.find(({ event, properties }) => (
        event === "App Store Open Attempt" && properties.method === "automatic"
      ));
      expect(automaticAttempt?.properties).toMatchObject({
        method: "automatic",
        navigation_mode: "new_window",
        automatic_result: "window_created",
        platform: scenario.telemetryPlatform,
        destination: scenario.telemetryDestination,
      });
      const fallback = page.getByTestId("handoff-fallback-link");
      await expect(fallback).toBeVisible({ timeout: 7_000 });
      await expect(fallback).toBeEnabled();
      await expect(fallback).toHaveText(scenario.expectedCta);
      await expect(fallback).toHaveAttribute("href", scenario.expectedUrl);
      await expect(fallback).toHaveAttribute("target", "_blank");
      await expect(page.getByText("Taking you into PestFlow…")).not.toBeVisible();

      await page.waitForTimeout(5_500);
      await expect(fallback).toBeVisible();
      await fallback.click();
      await expect.poll(() => destinationAttempts, { timeout: 3_000 }).toEqual([
        scenario.expectedUrl,
        scenario.expectedUrl,
      ]);
      expect(destinationAttempts.every((url) => url === scenario.expectedUrl)).toBe(true);

      await expect.poll(() => (
        recordedEvents.find(({ event, properties }) => (
          event === "App Store Open Attempt" && properties.method === "manual_fallback"
        ))
      )).toBeTruthy();
      const fallbackAttempt = recordedEvents.find(({ event, properties }) => (
        event === "App Store Open Attempt" && properties.method === "manual_fallback"
      ));
      expect(fallbackAttempt?.properties).toMatchObject({
        method: "manual_fallback",
        navigation_mode: "new_window",
        platform: scenario.telemetryPlatform,
        destination: scenario.telemetryDestination,
      });

    await context.close();
  });
}
