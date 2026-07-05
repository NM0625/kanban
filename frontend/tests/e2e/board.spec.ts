import { expect, test } from "@playwright/test";

test("renames a lane and adds a card", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /kanban that feels sharp/i })).toBeVisible();

  const backlogName = page.getByRole("textbox", { name: "Rename Backlog" });
  await backlogName.fill("Ideas");
  await expect(page.getByRole("textbox", { name: "Rename Ideas" })).toHaveValue("Ideas");

  await page.getByLabel("New card title for Ideas").fill("Review roadmap");
  await page.getByLabel("New card details for Ideas").fill("Confirm tone and sequencing.");
  await page.getByRole("button", { name: "Add card" }).first().click();

  await expect(page.getByText("Review roadmap")).toBeVisible();
});
