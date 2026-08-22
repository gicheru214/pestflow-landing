import { expect, test } from "@playwright/test";
import { APP_STORE_URL } from "../client/src/lib/appStoreHandoff";

test("shows a manual App Store link when the automatic handoff is blocked", async ({ page }) => {
  await page.goto("/signup-success?handoff=app_store&internal=1&source=replay_regression");

  await expect(page.getByRole("heading", { name: "You're In!" })).toBeVisible();
  await expect(page.getByText("Taking you into PestFlow…")).toBeVisible();

  const fallback = page.getByTestId("app-store-fallback-link");
  await expect(fallback).toBeVisible({ timeout: 7_000 });
  await expect(page.getByRole("heading", {
    name: "PestFlow didn’t open automatically",
  })).toBeVisible();
  await expect(fallback).toHaveAttribute("href", APP_STORE_URL);
  await expect(page).toHaveURL(/\/signup-success\?/);
});
