import { test, expect } from "@playwright/test";

// The AlSalah visualization lives on the project detail page and is the concrete
// example of "click a card → see a visualization of the project": a shared
// date/location/method picker driving live prayer times and Odeh crescent
// visibility, plus a build-time-precomputed global crescent globe.
test.describe("alsalah visualization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/alsalah-prayer-times/");
    // Gate on hydration: the globe fills its evening list client-side on mount,
    // so a populated <option> proves JS is running before we drive controlled
    // inputs (a pre-hydration `fill` would be reverted by the controlled value).
    await expect(
      page.getByLabel("New-moon evening").locator("option").first(),
    ).toBeAttached();
  });

  test("renders both panels and the shared controls", async ({ page }) => {
    await expect(page.getByRole("img", { name: /Sun path for/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Crescent for/ })).toBeVisible();
    await expect(page.getByLabel("Location")).toBeVisible();
    await expect(page.getByLabel("Date")).toBeVisible();
    await expect(page.getByLabel("Method")).toBeVisible();
    await expect(page.getByLabel("Madhab")).toBeVisible();
  });

  test("changing the date changes the crescent visibility zone", async ({
    page,
  }) => {
    const crescent = page.getByRole("img", { name: /Crescent for/ });

    // Default is Makkah on 2026-07-16, a day-old crescent → easily visible.
    await expect(crescent).toHaveAttribute("aria-label", /zone A/);

    // The evening of the 2026-07-14 new moon → far too young to see (zone D).
    await page.getByLabel("Date").fill("2026-07-14");
    await expect(crescent).toHaveAttribute("aria-label", /zone D/);
  });

  test("changing the location relabels the prayer-times panel", async ({
    page,
  }) => {
    const sunPath = page.getByRole("img", { name: /Sun path for/ });
    await expect(sunPath).toHaveAttribute("aria-label", /Sun path for Makkah/);

    await page.getByLabel("Location").selectOption({ label: "London" });
    await expect(sunPath).toHaveAttribute("aria-label", /Sun path for London/);
  });

  test("switching madhab shifts the Asr time", async ({ page }) => {
    const sunPath = page.getByRole("img", { name: /Sun path for/ });
    const asrOf = async () =>
      ((await sunPath.getAttribute("aria-label")) ?? "").match(
        /Asr (\d\d:\d\d)/,
      )?.[1];

    const hanafi = await asrOf();
    await page.getByLabel("Madhab").selectOption("standard");
    // Standard (shadow ratio 1) gives an earlier Asr than Ḥanafī (ratio 2).
    await expect.poll(async () => (await asrOf()) !== hanafi).toBe(true);
  });
});

// Under reduced motion the flagship globe must degrade to its static 2D map of
// the same precomputed data — no WebGL, no animation.
test.describe("crescent globe — reduced motion", () => {
  test("falls back to the static 2D map", async ({ page }) => {
    // emulateMedia reliably drives window.matchMedia (the `reducedMotion`
    // context option did not reach matchMedia in this setup).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/alsalah-prayer-times/");
    await expect(
      page.getByRole("img", { name: /Static global crescent visibility map/ }),
    ).toBeVisible();
  });
});
