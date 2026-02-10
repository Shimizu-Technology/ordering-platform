import { expect, test } from "@playwright/test";
import {
  addFirstMenuItemToCart,
  continueToCheckout,
  fillCheckoutContactInfo,
  submitCheckoutAndHandlePaymentFallback,
} from "../utils/order-helpers";

test("Three Squares customer can place a restaurant order", async ({ page }) => {
  await page.goto("http://localhost:5175/threesquares/home");

  const restaurantSection = page.getByRole("button", { name: /Restaurant/i });
  await expect(restaurantSection).toBeVisible();
  await restaurantSection.click();

  await addFirstMenuItemToCart(page);
  await continueToCheckout(page);

  const locationOption = page.getByRole("button", { name: /Chalan San Antonio/i });
  if (await locationOption.isVisible()) {
    await locationOption.click();
  }

  await fillCheckoutContactInfo(page, {
    name: "Playwright Three Squares",
    phone: "6715551002",
    email: "playwright-threesquares@example.com",
  });
  await submitCheckoutAndHandlePaymentFallback(page);

  await expect(page.getByRole("button", { name: /Track Order/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start New Order/i })).toBeVisible();
});
