import { expect, Page } from "@playwright/test";

export async function addFirstMenuItemToCart(page: Page): Promise<void> {
  const firstMenuItem = page
    .getByRole("button")
    .filter({ hasText: /\$[0-9]+\.[0-9]{2}/ })
    .first();

  await expect(firstMenuItem).toBeVisible();
  await firstMenuItem.click();

  const addToOrderButton = page.getByRole("button", { name: /Add to Order/i });
  await expect(addToOrderButton).toBeVisible();
  await addToOrderButton.scrollIntoViewIfNeeded();
  try {
    await addToOrderButton.click({ timeout: 4_000 });
  } catch {
    // Fallback for modal animation/viewport edge cases.
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("Add to Order")
      );
      if (!btn) throw new Error("Add to Order button not found");
      btn.click();
    });
  }

  const viewOrderButton = page.getByRole("button", { name: /View order/i });
  await expect(viewOrderButton).toBeVisible();
  await viewOrderButton.click();
}

export async function continueToCheckout(page: Page): Promise<void> {
  const checkoutButton = page.getByRole("button", { name: /Continue to Checkout/i });
  await expect(checkoutButton).toBeVisible();
  await checkoutButton.click();

  await expect(page.getByRole("textbox", { name: /Name \*/i })).toBeVisible();
}

export async function fillCheckoutContactInfo(
  page: Page,
  opts: { name: string; phone: string; email: string }
): Promise<void> {
  await page.getByRole("textbox", { name: /Name \*/i }).fill(opts.name);
  await page.getByRole("textbox", { name: /Phone \(for order updates\)/i }).fill(opts.phone);
  await page.getByRole("textbox", { name: /Email \(for receipt\)/i }).fill(opts.email);
}

export async function submitCheckoutAndHandlePaymentFallback(page: Page): Promise<void> {
  const submitButton = page
    .getByRole("button")
    .filter({ hasText: /Continue to Payment|Place Order/i })
    .last();

  await expect(submitButton).toBeVisible();
  await submitButton.click();

  const confirmationUrlMatcher = /\/confirmation\/\d+/;

  try {
    await page.waitForURL(confirmationUrlMatcher, { timeout: 12_000 });
    return;
  } catch {
    const cancelPaymentButton = page.getByRole("button", { name: /^Cancel$/i });
    if (await cancelPaymentButton.isVisible()) {
      await cancelPaymentButton.click();
      await page.waitForURL(confirmationUrlMatcher, { timeout: 12_000 });
      return;
    }

    const payAtCounterButton = page.getByRole("button", { name: /Pay at Counter/i });
    if (await payAtCounterButton.isVisible()) {
      await payAtCounterButton.click();
      await page.waitForURL(confirmationUrlMatcher, { timeout: 12_000 });
      return;
    }

    throw new Error("Checkout did not reach confirmation or a known payment fallback state.");
  }
}
