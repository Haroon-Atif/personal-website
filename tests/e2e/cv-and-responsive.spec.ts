import { test, expect } from "@playwright/test";

test.describe("cv download", () => {
  test("the CV file is served as a PDF", async ({ request }) => {
    const res = await request.get("/Haroon_Atif_CV.pdf");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("pdf");
  });
});

test.describe("responsive navigation", () => {
  test("desktop shows inline links; mobile uses the menu toggle", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle menu" });

    if (testInfo.project.name === "mobile") {
      await expect(toggle).toBeVisible();
      await toggle.click();
      // Opening the menu reveals the nav links; use one to navigate.
      await page
        .getByRole("link", { name: /projects/ })
        .last()
        .click();
      await expect(page).toHaveURL(/\/projects\/?$/);
    } else {
      await expect(toggle).toBeHidden();
      await page
        .getByRole("link", { name: /projects/ })
        .first()
        .click();
      await expect(page).toHaveURL(/\/projects\/?$/);
    }
  });
});

test.describe("footer", () => {
  test("has contact + cv links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "email" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "cv" })).toHaveAttribute(
      "download",
      "",
    );
  });
});
