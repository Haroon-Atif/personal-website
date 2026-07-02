import { test, expect } from "@playwright/test";

test.describe("blog", () => {
  test("topic index → article renders", async ({ page }) => {
    await page.goto("/blog/");
    // Topic cards are present; open one.
    const firstTopic = page
      .getByRole("link", { name: /cybersecurity/i })
      .first();
    await firstTopic.click();
    await expect(page).toHaveURL(/\/blog\/cybersecurity\/?$/);
    // An article link from the topic list, then the article itself.
    await page
      .getByRole("link", { name: /sql injection/i })
      .first()
      .click();
    await page.waitForURL(/\/blog\/cybersecurity\/sql-injection-basics\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("projects", () => {
  test("cards render the real projects", async ({ page }) => {
    await page.goto("/projects/");
    await expect(page.getByRole("heading", { name: /AlSalah/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Web Automation Agent/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /MITRE/ })).toBeVisible();
  });

  test("clicking a card opens its detail page", async ({ page }) => {
    await page.goto("/projects/");
    await page.getByRole("heading", { name: /AlSalah/ }).click();
    await expect(page).toHaveURL(/\/projects\/alsalah-prayer-times\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /AlSalah/ }),
    ).toBeVisible();
  });
});

test.describe("about", () => {
  test("shows real bio, skills, and education", async ({ page }) => {
    await page.goto("/about/");
    await expect(
      page.getByText(/software engineer based in Los Angeles/),
    ).toBeVisible();
    await expect(page.getByText("Kotlin Multiplatform").first()).toBeVisible();
    await expect(page.getByText("Western Governor's University")).toBeVisible();
  });
});

test.describe("errors", () => {
  test("unknown route renders the 404 page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist/");
    // Static export serves the not-found HTML; status may be 200 or 404.
    expect(res).not.toBeNull();
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});
