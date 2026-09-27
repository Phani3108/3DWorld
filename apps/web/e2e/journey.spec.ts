import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const seriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`);
};

test("arrive, ask a resident, travel", async ({ page }) => {
  await page.goto("/");

  // 1 · Onboarding (keyboard-reachable, no serious a11y violations)
  await expect(page.getByRole("heading", { name: "Who's arriving?" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
  await page.getByLabel("Your name in the city").fill("E2E Visitor");
  await page.getByRole("button", { name: "Woman", exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: /Hyderabad/ }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: /You'll arrive in Old City/ })).toBeVisible();
  await page.getByRole("button", { name: "Enter Hyderabad" }).click();

  // 2 · In the city
  await expect(page.getByRole("status").filter({ hasText: "Live" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Hyderabad, Old City · Charminar/ })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  // 3 · Ask a resident through the composer
  const composer = page.getByLabel(/Message\. Start with @/);
  await composer.fill("@Zara how long does dum take?");
  await composer.press("Enter");
  const log = page.getByRole("list", { name: "Conversation in this place" });
  await expect(log).toContainText("how long does dum take?");
  await expect(log).toContainText("Thirty-five minutes");

  // 4 · Nearby lists people and places, closest first
  await page.getByRole("tab", { name: "Nearby" }).click();
  await expect(page.getByRole("list", { name: /People and places near you/ })).toContainText(
    "Charminar Bazaar",
  );

  // 5 · Travel to another city
  await page.getByRole("tab", { name: "Map" }).click();
  await page.getByRole("button", { name: "Go to Deira · Gold Souk" }).click();
  await expect(page.getByRole("button", { name: /Dubai, Deira · Gold Souk/ })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Live" })).toBeVisible();
});
