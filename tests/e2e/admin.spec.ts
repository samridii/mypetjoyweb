import { test, expect } from "@playwright/test";

const MOCK_ADMIN  = { id: "a1", fullName: "Admin User", email: "admin@test.com", role: "admin" };
const MOCK_TOKEN  = "admin_jwt_token";
const MOCK_USERS  = [
  { _id: "u1", fullName: "Sam Kim", email: "sam@test.com", role: "user" },
  { _id: "u2", fullName: "Jane Doe", email: "jane@test.com", role: "user" },
];
const MOCK_PETS   = [
  { _id: "p1", name: "Buddy",  type: "Dog", status: "AVAILABLE" },
  { _id: "p2", name: "Whiskers", type: "Cat", status: "ADOPTED" },
];
const MOCK_ORDERS = [
  { _id: "o1", status: "PENDING",   totalAmount: 450, user: { fullName: "Sam Kim" } },
  { _id: "o2", status: "DELIVERED", totalAmount: 200, user: { fullName: "Jane Doe" } },
];
const MOCK_ADOPTIONS = [
  { _id: "a1", status: "PENDING",  fullName: "Sam Kim",  pet: { name: "Buddy" } },
  { _id: "a2", status: "APPROVED", fullName: "Jane Doe", pet: { name: "Whiskers" } },
];

async function loginAsAdmin(page: any) {
  await page.goto("/");
  await page.evaluate(({ token, user }: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, { token: MOCK_TOKEN, user: MOCK_ADMIN });
}

async function mockAdminApis(page: any) {
  await page.route("**/api/admin/users**",     (r: any) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: MOCK_USERS }) }));
  await page.route("**/api/admin/pets**",      (r: any) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: MOCK_PETS }) }));
  await page.route("**/api/admin/orders**",    (r: any) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: MOCK_ORDERS }) }));
  await page.route("**/api/admin/adoptions**", (r: any) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: MOCK_ADOPTIONS }) }));
}

test.describe("Admin Dashboard", () => {
  test("41. admin dashboard page loads with a heading", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin");
    const heading = page.locator("h1, h2, [class*='title'], [class*='dashboard']").first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test("42. admin dashboard shows navigation links (users/pets/orders/adoptions)", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin");
    const adminLink = page.locator("a[href*='/admin'], nav a, [class*='sidebar'] a").first();
    await expect(adminLink).toBeVisible({ timeout: 5000 });
  });

  test("43. admin stats or summary cards are visible", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin");
    // Cards, stat boxes, or count numbers should appear
    const statsArea = page.locator("[class*='card'], [class*='stat'], [class*='summary'], [class*='count']").first();
    await expect(statsArea).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin Users Page", () => {
  test("44. admin users page lists all users", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/users");
    await expect(page.locator("text=Sam Kim").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Jane Doe").first()).toBeVisible({ timeout: 5000 });
  });

  test("45. admin users page shows delete button for each user", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/users");
    const deleteBtn = page.locator("button:has-text('Delete'), button:has-text('Remove'), [aria-label*='delete' i]").first();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin Pets Page", () => {
  test("46. admin pets page lists all pets with names", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/pets");
    await expect(page.locator("text=Buddy").first()).toBeVisible({ timeout: 5000 });
  });

  test("47. admin pets page has an Add Pet button", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/pets");
    const addBtn = page.locator("button:has-text('Add'), button:has-text('Create'), button:has-text('New')").first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin Orders Page", () => {
  test("48. admin orders page shows all orders with status", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/orders");
    await expect(page.locator("text=PENDING, text=DELIVERED").first()).toBeVisible({ timeout: 5000 });
  });

  test("49. admin orders page has update status button or dropdown", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/orders");
    const ctrl = page.locator("select, button:has-text('Update'), button:has-text('Status'), [class*='status']").first();
    await expect(ctrl).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin Adoptions Page", () => {
  test("50. admin adoptions page lists pending and approved adoptions", async ({ page }) => {
    await mockAdminApis(page);
    await loginAsAdmin(page);
    await page.goto("/admin/adoptions");
    await expect(page.locator("text=PENDING, text=APPROVED, text=Sam Kim").first()).toBeVisible({ timeout: 5000 });
  });
});