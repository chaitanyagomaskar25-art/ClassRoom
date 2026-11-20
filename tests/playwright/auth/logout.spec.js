
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/testData.js';

test.describe('Authentication - Logout', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/login');

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.student.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(page).toHaveURL(/student/);

  });

  // LOGOUT-01
  test('should logout successfully', async ({ page }) => {

    await page.getByRole('button', { name: /logout|sign out/i })
      .click();

    await expect(page).toHaveURL(/login/);

  });

  // LOGOUT-02
  test('should not access dashboard after logout', async ({ page }) => {

    await page.getByRole('button', { name: /logout|sign out/i })
      .click();

    await page.goto('/student/dashboard');

    await expect(page).toHaveURL(/login/);

  });

});
