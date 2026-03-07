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

async function answerAllQuestions(page: any) {
  for (let i = 0; i < 8; i++) {
    const options = page.locator("button[type='button'].rounded-2xl.border-2");
    await options.first().click();
    await page.waitForTimeout(200);
    if (i < 7) {
      await page.locator("button:has-text('Next')").click();
      await page.waitForTimeout(300);
    }
  }
}

test.describe("AI Pet Recommendation Page", () => {

  test("1. quiz page loads with a heading and start button", async ({ page }) => {
    await setAuthCookies(page);
    await page.goto("/quiz");

    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    await expect(heading).toContainText("Find Your Perfect Pet");

    const startBtn = page.locator("button:has-text('Start the Quiz')");
    await expect(startBtn).toBeVisible({ timeout: 5000 });
  });

  test("2. submitting quiz shows AI recommendation result", async ({ page }) => {
    await setAuthCookies(page);
    await page.route("**/api/quiz**", (route: any) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, recommendation: "We recommend getting a Cat! Cats are perfect for apartment living." }),
      })
    );

    await page.goto("/quiz");
    await page.locator("button:has-text('Start the Quiz')").click();
    await page.waitForTimeout(300);
    await answerAllQuestions(page);
    await page.locator("button:has-text('Get My Match')").click();

    await expect(page.locator("text=Perfect Match Found")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Cat").first()).toBeVisible({ timeout: 5000 });
  });

  test("3. shows error state when API fails", async ({ page }) => {
    await setAuthCookies(page);
    await page.route("**/api/quiz**", (route: any) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Please provide an answers field" }),
      })
    );

    await page.goto("/quiz");
    await page.locator("button:has-text('Start the Quiz')").click();
    await page.waitForTimeout(300);
    await answerAllQuestions(page);
    await page.locator("button:has-text('Get My Match')").click();

    await expect(
      page.locator("text=Something went wrong")
        .or(page.locator("button:has-text('Start the Quiz')"))
    ).toBeVisible({ timeout: 8000 });
  });

  test("4. submit button is disabled until an answer is selected", async ({ page }) => {
    await setAuthCookies(page);
    await page.goto("/quiz");
    await page.locator("button:has-text('Start the Quiz')").click();
    await page.waitForTimeout(300);

    const nextBtn = page.locator("button:has-text('Next')");
    await expect(nextBtn).toBeDisabled({ timeout: 3000 });

    const options = page.locator("button[type='button'].rounded-2xl.border-2");
    await options.first().click();
    await expect(nextBtn).toBeEnabled({ timeout: 3000 });
  });

  test("5. quiz page has a link or navigation back to home or pets", async ({ page }) => {
    await setAuthCookies(page);
    await page.goto("/quiz");

    const navLink = page.locator("header a, nav a, a[href='/'], a[href='/pets']").first();
    await expect(navLink).toBeVisible({ timeout: 8000 });
  });

});