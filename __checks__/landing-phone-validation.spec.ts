import { expect, test } from "@playwright/test";

for (const device of ["desktop", "ios"] as const) {
  test(`${device} popup locks +1, blocks invalid NANP numbers, and preserves the admin payload`, async ({ page }) => {
    const submissions: Array<Record<string, unknown>> = [];

    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (url.pathname === "/api/submissions") {
        const payload = request.postDataJSON() as Record<string, unknown>;
        submissions.push(payload);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            ...payload,
            id: "phone-validation-check",
            metaRegistration: {
              eventId: "phone-validation-event",
              shouldFireBrowser: false,
            },
            playbookDelivery: { accepted: true },
          }),
        });
        return;
      }

      if (url.origin !== "http://127.0.0.1:4174") {
        await route.abort("blockedbyclient");
        return;
      }

      await route.continue();
    });

    await page.goto(`/?device=${device}&popup-check=1&reset_preview=1`);
    await expect(
      page.locator('a[href="https://app.pestflow.org/admin"]'),
    ).toHaveAttribute("href", "https://app.pestflow.org/admin");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("phone-country-prefix")).toHaveText(
      /🇺🇸\s*\+1/,
    );
    await expect(dialog.getByText("Returning user?", { exact: true })).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Sign in with Google" }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "Or sign in with email →" }),
    ).toHaveAttribute("href", "https://app.pestflow.org/login");

    await dialog.getByPlaceholder("John Smith").fill("Jordan Owner");
    await dialog.getByPlaceholder("john@example.com").fill("jordan@example.net");
    const phone = dialog.getByTestId("popup-phone-input");

    await phone.fill("1125550199");
    await dialog.getByRole("button", { name: "Send Me the Free Playbook" }).click();
    await expect(dialog.getByText("Enter a valid area code—it cannot start with 0 or 1")).toBeVisible();
    expect(submissions.filter((entry) => entry.type === "newsletter")).toHaveLength(0);

    await phone.fill("2121550199");
    await dialog.getByRole("button", { name: "Send Me the Free Playbook" }).click();
    await expect(dialog.getByText("Enter a valid phone number", { exact: true })).toBeVisible();
    expect(submissions.filter((entry) => entry.type === "newsletter")).toHaveLength(0);

    await phone.fill("+1 (212) 555-0199");
    await expect(phone).toHaveValue("2125550199");
    await phone.fill("212555019912345");
    await expect(phone).toHaveValue("2125550199");

    await dialog.getByRole("button", { name: "Send Me the Free Playbook" }).click();
    await expect.poll(() => submissions.filter((entry) => entry.type === "newsletter")).toHaveLength(1);
    expect(submissions.find((entry) => entry.type === "newsletter")).toMatchObject({
      type: "newsletter",
      firstName: "Jordan",
      lastName: "Owner",
      email: "jordan@example.net",
      phone: "2125550199",
    });
  });
}
