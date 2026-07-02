import { test, expect } from "@playwright/test";

// The moon-sighting visualization lives on the AlSalah project detail page and
// is the concrete example of "click a card → see a visualization of the project".
test.describe("moon-sighting visualization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/alsalah-prayer-times/");
  });

  test("renders the crescent diagram and controls", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: /Crescent at arc of vision/ }),
    ).toBeVisible();
    await expect(page.getByLabel("Arc of vision in degrees")).toBeVisible();
    await expect(page.getByLabel("Crescent width in arcminutes")).toBeVisible();
  });

  test("scrubbing arc of vision changes the visibility zone", async ({
    page,
  }) => {
    const arcv = page.getByLabel("Arc of vision in degrees");
    // The crescent diagram's aria-label reflects the live zone, and is unique
    // (the same phrases also appear in the surrounding prose).
    const diagram = page.getByRole("img", {
      name: /Crescent at arc of vision/,
    });

    // Max arc of vision → crescent easily visible (zone A).
    await arcv.focus();
    await page.keyboard.press("End");
    await expect(diagram).toHaveAttribute("aria-label", /zone A/);

    // Zero arc of vision → not visible (zone D).
    await page.keyboard.press("Home");
    await expect(diagram).toHaveAttribute("aria-label", /zone D/);
  });
});
