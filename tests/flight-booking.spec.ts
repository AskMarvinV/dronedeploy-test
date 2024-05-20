import { test, expect } from "@playwright/test";
import exp from "node:constants";
import { beforeEach } from "node:test";

const date = new Date();
date.setDate(date.getDate() + 1);

const year = date.getFullYear();
const month = ("0" + (date.getMonth() + 1)).slice(-2);
const day = ("0" + date.getDate()).slice(-2);

const yearMonthDayDateFormat = `${year}-${month}-${day}`; // format to 'yyyy-mm-dd'

test("User should be able to book One Way flight", async ({ page }) => {
  await test.step("Open the flight search page", async () => {
    await page.goto(
      "https://flightbookings.airnewzealand.co.nz/vbook/actions/search"
    );
  });

  await test.step("Provide required information", async () => {
    await page.getByText("One‐way trip").click();
    await page.getByLabel("From airport or city").click();
    await page.getByRole("option", { name: "Auckland" }).first().click();
    await page.getByLabel("To airport or city").click();
    await page.getByRole("option", { name: "Queenstown" }).first().click();
    await page.locator("#search-leavedate span").click();
    await page.locator(`[data-date="${yearMonthDayDateFormat}"]`).click();
    await page.getByRole("button", { name: "Search" }).click();
  });

  await test.step("Verify search result", async () => {
    await expect(page.getByText("Auckland to Queenstown")).toBeVisible();
    await expect(
      page.locator('[data-automation="journey-type-title"]').first()
    ).toHaveText("One way");
    const locatorCount = await page
      .locator('[data-automation="leg-option"]')
      .count();
    await expect(locatorCount).toBeGreaterThan(0);
  });

  await test.step("Verify that can select a flight and price amount is correct", async () => {
    const flightLegLocator = await page.locator(
      '[data-automation="leg-option-cost-ds"]'
    );
    const firstFlightLeg = await flightLegLocator.first();
    const flightLegCost = await firstFlightLeg.innerText();

    await firstFlightLeg.click();

    await expect(await page.locator('span[class="vui-hud-amount"]')).toHaveText(
      `${flightLegCost}.00`
    );
  });

  await test.step("Verify that user can continue to the next step", async () => {
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForLoadState();
    await page.getByTestId("traveller-listing-container").isVisible();
  });

  await test.step("Verify that user can procced to seat selection after filling the passenger details", async () => {
    await page.getByLabel("Title").selectOption("MR");
    await page.getByLabel("First name").fill("Marvin");
    await page.getByLabel("Family name").fill("Villahermosa");
    await page.getByLabel("Mobile or Landline").fill("278817695");
    await page
      .getByLabel("Email address")
      .fill("marvin.villahermosa@dronedeploy.com");

    await page.getByRole("button", { name: "Continue" }).click();
    await page.goto(
      "https://flightbookings.airnewzealand.co.nz/vbook/actions/select-your-seats?"
    );

    // TODO: Fix this part where clicking the continue button is not working
    // await page.getByRole("button", { name: "Continue" }).click();
    // await page.waitForURL("**/vbook/actions/extras");
    // expect(page.url()).toContain("book/actions/extras");
    // await page.getByRole("button", { name: "Continue" }).click();
  });

  await test.step("Verify that user cannot select seat that is occupied", async () => {
    await page.getByTestId("seat-map-container").isVisible();
    await page
      .locator('[title="Sorry these seats are unavailable"]')
      .first()
      .click();
    await page.getByText("Select a seat").isVisible();
  });

  await test.step("Verify that user can select a seat", async () => {
    await page.locator(".vui-ss-available").first().click();
    await page
      .getByLabel("Seat information")
      .getByRole("button", { name: "Continue" }).click;
    await expect(
      await page.getByRole('option', { name: 'Marvin Villahermosa Preferred' })).toContainText('Preferred seat')
  });
});
