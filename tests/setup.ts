import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../auth.json");

setup("authenticate and save storage state", async ({ page }) => {


  await page.goto("http://localhost:3000/login");

  await page.getByLabel("Email").fill("admin@gmail.com");
  await page.getByLabel("Password").fill("Admin1234");

  await page.getByRole("button", { name: /login|sign in/i }).click();

  await page.waitForURL("http://localhost:3000/");
  await expect(page).toHaveURL(/localhost:3000/);

  await page.context().storageState({ path: AUTH_FILE });
});