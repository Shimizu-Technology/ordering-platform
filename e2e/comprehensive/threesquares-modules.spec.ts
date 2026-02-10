import { expect, test } from "@playwright/test";

test("Three Squares catering inquiry submission works", async ({ page }) => {
  await page.goto("http://localhost:5175/threesquares/catering");

  await expect(page.getByRole("heading", { name: /Catering Services/i })).toBeVisible();

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 7);
  const eventDateIso = eventDate.toISOString().split("T")[0];

  await page.getByPlaceholder("Your Name *").fill("Playwright Catering");
  await page.getByPlaceholder("Email Address *").fill("playwright-catering@example.com");
  await page.getByPlaceholder("Phone Number").fill("6715552001");
  await page.getByRole("combobox").first().selectOption({ index: 1 });
  await page.locator("input[type='date']").fill(eventDateIso);
  await page.getByPlaceholder("# Guests *").fill("25");

  await page.getByRole("button", { name: /Submit Catering Request/i }).click();

  await expect(page.getByRole("heading", { name: /Thank You!/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Back to Menu/i })).toBeVisible();
});

test("Three Squares cookie store opens Shopify checkout handoff", async ({ page }) => {
  await page.goto("http://localhost:5175/threesquares/cookies");

  await expect(page.getByRole("heading", { name: /Latte Stone Cookies/i })).toBeVisible();

  const productCards = page.locator("section button").filter({ hasText: /\$[0-9]+\.[0-9]{2}/ });
  const productCount = await productCards.count();
  let added = false;

  for (let i = 0; i < Math.min(productCount, 8); i += 1) {
    await productCards.nth(i).click();

    const addToCartButton = page.getByRole("button", { name: /Add to Cart/i });
    await expect(addToCartButton).toBeVisible();

    if (await addToCartButton.isDisabled()) {
      // Some products need explicit variant selection.
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const variantButton = buttons.find((btn) => {
          const text = btn.textContent || "";
          return /\$\d+\.\d{2}/.test(text) && !text.includes("Add to Cart") && !btn.hasAttribute("disabled");
        });
        variantButton?.click();
      });
    }

    if (!(await addToCartButton.isDisabled())) {
      await addToCartButton.click();
      added = true;
      break;
    }

    const closeModalButton = page.locator("button").filter({ has: page.locator("svg.lucide-x") }).first();
    await closeModalButton.click();
  }

  if (!added) {
    test.skip(true, "No in-stock cookie variants available in current seed data.");
  }

  const cartButton = page
    .locator("button")
    .filter({ has: page.locator("svg.lucide-shopping-bag") })
    .first();
  await expect(cartButton).toBeVisible();
  await cartButton.click();

  const checkoutOnShopifyButton = page.getByRole("button", { name: /Checkout on Shopify/i });
  await expect(checkoutOnShopifyButton).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await checkoutOnShopifyButton.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");

  await expect(popup).toHaveURL(/shopify/i);
});
