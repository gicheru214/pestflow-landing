import { expect, test } from "@playwright/test";

const baseUrl = process.env.ENVIRONMENT_URL || "https://pestflow.org";
const expectedSlugs = (process.env.EXPECTED_BLOG_SLUGS || "")
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);

function absolutePath(path: string) {
  return new URL(path, baseUrl).toString();
}

test("production blog index renders and generated posts open", async ({ page }) => {
  await page.goto(absolutePath("/blog"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /pest control business/i })).toBeVisible();
  await expect(page.getByText("PestFlow Learn")).toBeVisible();

  const slugsToCheck = expectedSlugs.length
    ? expectedSlugs
    : [
        ((await page.locator('main a[href^="/blog/"]').first().getAttribute("href")) || "")
          .replace("/blog/", "")
          .trim(),
      ].filter(Boolean);

  for (const slug of slugsToCheck) {
    await expect(page.locator(`a[href="/blog/${slug}"]`).first()).toBeVisible();
    await page.goto(absolutePath(`/blog/${slug}`), { waitUntil: "domcontentloaded" });
    await expect(page.locator("article")).toContainText("PestFlow");
    await expect(page.getByRole("link", { name: /Start free trial/i }).first()).toBeVisible();
  }
});
