/**
 * tests/auth.setup.ts
 *
 * Runs ONCE before your test suite.
 * Logs in via the UI, then saves cookies + localStorage to auth.json
 * so all other tests can reuse the session without logging in again.
 *
 * playwright.config.ts must include:
 *   projects: [{ name: 'setup', testMatch: 'auth.setup.ts' }]
 *   and your main project must depend on 'setup'
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../auth.json");

setup("authenticate and save storage state", async ({ page }) => {

  // ── 1. Navigate to the login page ───────────────────────────────────────
  await page.goto("http://localhost:3000/login");

  // ── 2. Fill in credentials ───────────────────────────────────────────────
  await page.getByLabel("Email").fill("testuser@gmail.com");
  await page.getByLabel("Password").fill("TestPass123!");

  // ── 3. Submit the form ───────────────────────────────────────────────────
  await page.getByRole("button", { name: /login|sign in/i }).click();

  // ── 4. Wait for redirect — confirm we are now logged in ─────────────────
  await page.waitForURL("http://localhost:3000/");
  await expect(page).toHaveURL(/localhost:3000/);

  // ── 5. Save cookies + localStorage → auth.json ──────────────────────────
  await page.context().storageState({ path: AUTH_FILE });
});