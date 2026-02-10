import { expect, test } from "@playwright/test";
import {
  addFirstMenuItemToCart,
  continueToCheckout,
  fillCheckoutContactInfo,
  submitCheckoutAndHandlePaymentFallback,
} from "../utils/order-helpers";

test("HavaJava confirmation can navigate to order tracking", async ({ page }) => {
  await page.goto("http://localhost:5174/havajava/home");

  const startOrderButton = page.getByRole("button", { name: /Order Online|Start Your Order/i }).first();
  await expect(startOrderButton).toBeVisible();
  await startOrderButton.click();

  await addFirstMenuItemToCart(page);
  await continueToCheckout(page);
  await fillCheckoutContactInfo(page, {
    name: "Playwright Tracking",
    phone: "6715553001",
    email: "playwright-tracking@example.com",
  });
  await submitCheckoutAndHandlePaymentFallback(page);

  const trackOrderButton = page.getByRole("button", { name: /Track Order/i });
  await expect(trackOrderButton).toBeVisible();
  await trackOrderButton.click();

  await expect(page).toHaveURL(/\/havajava\/track/);
  await expect(page.getByRole("heading", { name: /Track|Order/i })).toBeVisible();
});
