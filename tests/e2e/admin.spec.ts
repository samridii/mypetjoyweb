import { test, expect } from "@playwright/test";

const MOCK_ADMIN = { id: "a1", fullName: "Admin User", email: "admin@test.com", role: "admin" };
const MOCK_TOKEN = "admin_jwt_token";
const MOCK_USERS = [
  { _id: "u1", fullName: "Sam Kim",  email: "sam@test.com",  role: "user" },
  { _id: "u2", fullName: "Jane Doe", email: "jane@test.com", role: "user" },
];
const MOCK_PETS = [
  { _id: "p1", name: "Buddy",    type: "Dog", status: "AVAILABLE" },
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
});

test.describe("Admin Users Page", () => {});

test.describe("Admin Pets Page", () => {});

test.describe("Admin Orders Page", () => {});

test.describe("Admin Adoptions Page", () => {});