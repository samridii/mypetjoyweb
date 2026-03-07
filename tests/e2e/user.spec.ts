import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "u1", _id: "u1", fullName: "Sam Kim", email: "sam@test.com",
  role: "user", mobile: "9800000000", location: "Kathmandu",
};
const MOCK_TOKEN = "mock_jwt_token";

// Set cookies BEFORE navigation so Next.js middleware can read them server-side
async function setAuthCookies(page: any) {
  await page.context().addCookies([
    {
      name: "auth_token",
      value: MOCK_TOKEN,
      domain: "localhost",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      secure: false,
    },
    {
      name: "user_data",
      value: encodeURIComponent(JSON.stringify(MOCK_USER)),
      domain: "localhost",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      secure: false,
    },
  ]);
}

async function mockProfile(page: any) {
  await page.route("**/api/user/me**", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    })
  );
}

async function mockUpdateProfile(page: any, status = 200) {
  await page.route("**/api/user/update**", (route: any) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        status === 200
          ? { message: "Profile updated successfully", user: { ...MOCK_USER, fullName: "Sam Updated" } }
          : { message: "Server error" }
      ),
    })
  );
}

async function mockChangePassword(page: any, status = 200) {
  await page.route("**/api/user/change-password**", (route: any) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        status === 200
          ? { message: "Password changed successfully" }
          : { message: "Current password incorrect" }
      ),
    })
  );
}

test.describe("User Profile Page", () => {

  test("1. profile page loads and displays current user info", async ({ page }) => {
    await setAuthCookies(page);
    await mockProfile(page);
    await page.goto("/profile");

    await expect(page.locator("text=Sam Kim").first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator("text=sam@test.com").first()).toBeVisible({ timeout: 5000 });
  });

  test("2. profile page has editable fields for fullName and email", async ({ page }) => {
    await setAuthCookies(page);
    await mockProfile(page);
    await page.goto("/profile");

    const nameInput  = page.locator("input[placeholder='Your full name']");
    const emailInput = page.locator("input[placeholder='you@example.com']");
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test("3. updating profile calls update API and shows success message", async ({ page }) => {
    await setAuthCookies(page);
    await mockProfile(page);
    await mockUpdateProfile(page, 200);
    await page.goto("/profile");

    const nameInput = page.locator("input[placeholder='Your full name']");
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await nameInput.fill("Sam Updated");

    await page.locator("button:has-text('Save Changes')").click();

    await expect(
      page.locator("text=Profile updated successfully").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("4. change password section has currentPassword and newPassword fields", async ({ page }) => {
    await setAuthCookies(page);
    await mockProfile(page);
    await page.goto("/profile");

    await page.locator("button:has-text('Change Password')").click();
    await page.waitForTimeout(400);

    const inputs = page.locator("input[placeholder='••••••••']");
    await expect(inputs.nth(0)).toBeVisible({ timeout: 5000 });
    await expect(inputs.nth(1)).toBeVisible({ timeout: 5000 });
  });

  test("5. wrong current password shows error message (400)", async ({ page }) => {
    await setAuthCookies(page);
    await mockProfile(page);
    await mockChangePassword(page, 400);
    await page.goto("/profile");

    await page.locator("button:has-text('Change Password')").click();
    await page.waitForTimeout(400);

    const inputs = page.locator("input[placeholder='••••••••']");
    await inputs.nth(0).fill("wrongpassword");
    await inputs.nth(1).fill("NewPassword1!");
    await inputs.nth(2).fill("NewPassword1!");

    await page.locator("button:has-text('Update Password')").click();

    await expect(
      page.locator("text=Current password incorrect")
        .or(page.locator("text=incorrect"))
        .or(page.locator("text=Failed"))
    ).toBeVisible({ timeout: 5000 });
  });

});