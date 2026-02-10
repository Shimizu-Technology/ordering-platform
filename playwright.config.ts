import { defineConfig, devices } from "@playwright/test";
import { loadProjectEnvFiles } from "./e2e/utils/load-env";

const CI = !!process.env.CI;
loadProjectEnvFiles(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 390, height: 844 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "smoke",
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "comprehensive",
      testMatch: /comprehensive\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      command: "bundle exec rails server -p 3100",
      url: "http://localhost:3100",
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: "api",
    },
    {
      command: "VITE_API_URL=http://localhost:3100/api/v1 pnpm dev -- --port 5174 --strictPort",
      url: "http://localhost:5174/havajava/home",
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: "frontends/havajava",
    },
    {
      command: "VITE_API_URL=http://localhost:3100/api/v1 pnpm dev -- --port 5175 --strictPort",
      url: "http://localhost:5175/threesquares/home",
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: "frontends/threesquares",
    },
  ],
});
