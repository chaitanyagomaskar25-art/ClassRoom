
import { test, expect } from '@playwright/test';

test.describe('Authentication - Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // REG-01
  test('should display registration page', async ({ page }) => {

    await expect(
      page.getByRole('heading', { name: /register|sign up/i })
    ).toBeVisible();

  });

  // REG-02
  test('should register a new student successfully', async ({ page }) => {

    const uniqueEmail = `student${Date.now()}@test.com`;

    await page.getByLabel(/name/i)
      .fill('New Test Student');

    await page.getByLabel(/email/i)
      .fill(uniqueEmail);

    await page.getByLabel(/password/i)
      .fill('Student@123');

    await page.getByRole('button', { name: /register|sign up/i })
      .click();

    await expect(page).toHaveURL(/student|login/);
  });

  // REG-03
  test('should reject duplicate email', async ({ page }) => {

    await page.getByLabel(/name/i)
      .fill('Existing Student');

    await page.getByLabel(/email/i)
      .fill('student@test.com');

    await page.getByLabel(/password/i)
      .fill('Student@123');

    await page.getByRole('button', { name: /register|sign up/i })
      .click();

    await expect(
      page.getByRole('alert')
    ).toBeVisible();

  });

  // REG-04
  test('should not register with empty fields', async ({ page }) => {

    await page.getByRole('button', { name: /register|sign up/i })
      .click();

    await expect(
      page.getByLabel(/name/i)
    ).toBeInvalid();

  });

  // REG-05
  test('should reject invalid email format', async ({ page }) => {

    await page.getByLabel(/name/i)
      .fill('Test Student');

    await page.getByLabel(/email/i)
      .fill('invalid-email');

    await page.getByLabel(/password/i)
      .fill('Student@123');

    await page.getByRole('button', { name: /register|sign up/i })
      .click();

    await expect(
      page.getByLabel(/email/i)
    ).toBeInvalid();

  });

  // REG-06
  test('should reject weak password', async ({ page }) => {

    await page.getByLabel(/name/i)
      .fill('Test Student');

    await page.getByLabel(/email/i)
      .fill(`weak${Date.now()}@test.com`);

    await page.getByLabel(/password/i)
      .fill('123');

    await page.getByRole('button', { name: /register|sign up/i })
      .click();

    await expect(
      page.getByRole('alert')
    ).toBeVisible();

  });

});
