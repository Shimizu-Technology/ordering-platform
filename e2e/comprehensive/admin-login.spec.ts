import { expect, test, type Page } from "@playwright/test";

function fromEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value;
  }
  return undefined;
}

const ADMIN_PASSWORD = fromEnv("E2E_ADMIN_PASSWORD", "ADMIN_PASSWORD", "ADMIN_TOKEN");
const CLERK_EMAIL = fromEnv("E2E_CLERK_EMAIL", "CLERK_TEST_EMAIL", "TEST_USER_EMAIL");
const CLERK_PASSWORD = fromEnv("E2E_CLERK_PASSWORD", "CLERK_TEST_PASSWORD", "TEST_USER_PASSWORD");
const RUN_CLERK_ADMIN = process.env.E2E_RUN_CLERK_ADMIN === "true";

async function loginAdmin(page: Page, adminUrl: string): Promise<void> {
  await page.goto(adminUrl);

  const tokenPasswordField = page.getByPlaceholder("Admin password");
  if (await tokenPasswordField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    if (!ADMIN_PASSWORD) {
      test.skip(true, "E2E_ADMIN_PASSWORD is required for token-based admin login.");
    }
    await tokenPasswordField.fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByText(/^Admin$/)).toBeVisible();
    return;
  }

  if (!CLERK_EMAIL || !CLERK_PASSWORD) {
    test.skip(true, "E2E_CLERK_EMAIL and E2E_CLERK_PASSWORD are required for Clerk login.");
  }
  if (!RUN_CLERK_ADMIN) {
    test.skip(
      true,
      "Set E2E_RUN_CLERK_ADMIN=true to run Clerk-powered admin login (disabled by default for stability)."
    );
  }

  const emailInput = page
    .locator("input[type='email'], input[name='identifier'], input[autocomplete='username']")
    .first();
  await expect(emailInput).toBeVisible();
  await emailInput.fill(CLERK_EMAIL!);

  const continueButton = page.getByRole("button", { name: /Continue|Sign in/i }).first();
  await continueButton.click();

  const passwordInput = page
    .locator("input[type='password'], input[autocomplete='current-password']")
    .first();
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(CLERK_PASSWORD!);

  await page.getByRole("button", { name: /Continue|Sign in/i }).first().click();

  const continueToAdminButton = page.getByRole("button", { name: /Continue to Admin/i });
  if (await continueToAdminButton.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await continueToAdminButton.click();
  }

  await expect(page.getByText(/^Admin$/)).toBeVisible();
}

test("HavaJava admin login works", async ({ page }) => {
  await loginAdmin(page, "http://localhost:5174/admin");
});

test("Three Squares admin login works", async ({ page }) => {
  await loginAdmin(page, "http://localhost:5175/admin");
});
