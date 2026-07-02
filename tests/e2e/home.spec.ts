import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders the hero with the real name and tagline", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Haroon Atif" }),
    ).toBeVisible();
    await expect(page.getByText(/prayer-times app/i).first()).toBeVisible();
  });

  test("shows the real experience timeline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Sileria/ })).toBeVisible();
    await expect(page.getByText(/Odeh \(2004\)/).first()).toBeVisible();
  });

  test("hero CTAs link to projects, blog, and the CV", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "./projects" })).toBeVisible();
    const cv = page.getByRole("link", { name: "download cv" }).first();
    await expect(cv).toHaveAttribute("href", /\.pdf$/);
    // The download attribute is what makes it save rather than navigate.
    await expect(cv).toHaveAttribute("download", "");
  });
});
