import { expect, test } from "@playwright/test";
import {
  addFirstMenuItemToCart,
  continueToCheckout,
  fillCheckoutContactInfo,
  submitCheckoutAndHandlePaymentFallback,
} from "../utils/order-helpers";

test("HavaJava customer can place an order", async ({ page }) => {
  await page.goto("http://localhost:5174/havajava/home");

  const startOrderButton = page.getByRole("button", { name: /Order Online|Start Your Order/i }).first();
  await expect(startOrderButton).toBeVisible();
  await startOrderButton.click();

  await addFirstMenuItemToCart(page);
  await continueToCheckout(page);
  await fillCheckoutContactInfo(page, {
    name: "Playwright HavaJava",
    phone: "6715551001",
    email: "playwright-havajava@example.com",
  });
  await submitCheckoutAndHandlePaymentFallback(page);

  await expect(page.getByRole("button", { name: /Track Order/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start New Order/i })).toBeVisible();
});
