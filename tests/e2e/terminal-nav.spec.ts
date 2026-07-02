import { test, expect } from "@playwright/test";

// The interactive `cd` prompt is rendered on every viewport now (desktop and
// mobile), so these run under both Playwright projects.
test.describe("terminal navigation prompt", () => {
  const term = (page: import("@playwright/test").Page) =>
    page.getByLabel(/Terminal navigation/);

  test("`cd` navigates to a real directory", async ({ page }) => {
    await page.goto("/");
    await term(page).fill("cd blog");
    await term(page).press("Enter");
    await expect(page).toHaveURL(/\/blog\/?$/);
  });

  test("`cd` into a nested topic works", async ({ page }) => {
    await page.goto("/");
    await term(page).fill("cd ~/projects");
    await term(page).press("Enter");
    await expect(page).toHaveURL(/\/projects\/?$/);
  });

  test("unknown directory reports an error and does not navigate", async ({
    page,
  }) => {
    await page.goto("/");
    await term(page).fill("cd nope");
    await term(page).press("Enter");
    await expect(page.getByText(/no such directory: nope/)).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("`help` prints the command list", async ({ page }) => {
    await page.goto("/");
    await term(page).fill("help");
    await term(page).press("Enter");
    await expect(page.getByText(/commands: cd <dir>/)).toBeVisible();
  });

  test("a block cursor is always visible in the nav", async ({ page }) => {
    await page.goto("/");
    const cursor = page.locator("header .cursor");
    await expect(cursor).toBeVisible();
    // Still a block cursor while typing (native caret is hidden).
    await term(page).fill("cd bl");
    await expect(cursor).toBeVisible();
    const caretColor = await term(page).evaluate(
      (el) => getComputedStyle(el).caretColor,
    );
    // transparent caret => our block is the only visible cursor.
    expect(caretColor).toMatch(/rgba?\(0, 0, 0, 0\)|transparent/);
  });
});
