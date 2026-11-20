
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/testData.js';

test.describe('Authentication - Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // AUTH-01
  test('should display login page', async ({ page }) => {
    await expect(page).toHaveURL(/login/);

    await expect(
      page.getByRole('button', { name: /login/i })
    ).toBeVisible();
  });

  // AUTH-02
  test('should login successfully with valid student credentials', async ({ page }) => {

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.student.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(page).toHaveURL(/student/);

    await expect(
      page.getByText(/welcome/i)
    ).toBeVisible();
  });

  // AUTH-03
  test('should reject incorrect password', async ({ page }) => {

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill('IncorrectPassword123');

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(
      page.getByRole('alert')
    ).toBeVisible();

    await expect(page).toHaveURL(/login/);
  });

  // AUTH-04
  test('should reject unregistered email', async ({ page }) => {

    await page.getByLabel(/email/i)
      .fill(testUsers.invalid.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.invalid.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(
      page.getByRole('alert')
    ).toBeVisible();
  });

  // AUTH-05
  test('should not submit empty login form', async ({ page }) => {

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(
      page.getByLabel(/email/i)
    ).toBeInvalid();
  });

  // AUTH-06
  test('should reject invalid email format', async ({ page }) => {

    await page.getByLabel(/email/i)
      .fill('invalid-email');

    await page.getByLabel(/password/i)
      .fill('Student@123');

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(
      page.getByLabel(/email/i)
    ).toBeInvalid();
  });

  // AUTH-07
  test('should mask password input', async ({ page }) => {

    const password = page.getByLabel(/password/i);

    await expect(password)
      .toHaveAttribute('type', 'password');
  });

  // AUTH-08
  test('should remain on login page after failed login', async ({ page }) => {

    await page.getByLabel(/email/i)
      .fill(testUsers.invalid.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.invalid.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(page).toHaveURL(/login/);
  });

});
