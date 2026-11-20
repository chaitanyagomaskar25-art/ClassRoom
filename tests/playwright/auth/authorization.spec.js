
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/testData.js';

test.describe('Role-Based Authorization', () => {

  // ROLE-01
  test('student should access student dashboard', async ({ page }) => {

    await page.goto('/login');

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.student.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(page).toHaveURL(/student/);

  });

  // ROLE-02
  test('student should not access mentor dashboard', async ({ page }) => {

    await page.goto('/login');

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.student.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await expect(page).toHaveURL(/student/);

    await page.goto('/mentor/dashboard');

    await expect(page).not.toHaveURL(/mentor\/dashboard/);

  });

  // ROLE-03
  test('student should not access admin dashboard', async ({ page }) => {

    await page.goto('/login');

    await page.getByLabel(/email/i)
      .fill(testUsers.student.email);

    await page.getByLabel(/password/i)
      .fill(testUsers.student.password);

    await page.getByRole('button', { name: /login/i })
      .click();

    await page.goto('/admin/dashboard');

    await expect(page).not.toHaveURL(/admin\/dashboard/);

  });

});
