// playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // ── 1. Setup project — runs auth.setup.ts first ──────────────────────
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // ── 2. Main test project — depends on setup, reuses auth.json ────────
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // 👇 This is what loads your auth.json automatically
        storageState: "auth.json",
      },
      dependencies: ["setup"],
    },
  ],
});