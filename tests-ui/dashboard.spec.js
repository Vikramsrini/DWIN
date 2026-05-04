const { test, expect } = require('@playwright/test');

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Set up auth state before loading dashboard
        await page.goto('/login.html');
        await page.evaluate(() => {
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Test User');
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should display digital twin avatar', async ({ page }) => {
        await expect(page.locator('#twinAvatar')).toBeVisible();
        await expect(page.locator('.avatar-face')).toBeVisible();
    });

    test('should display health metrics cards', async ({ page }) => {
        await expect(page.locator('.card-calories')).toBeVisible();
        await expect(page.locator('.card-sleep')).toBeVisible();
        await expect(page.locator('.card-exercise')).toBeVisible();
        await expect(page.locator('.card-hygiene')).toBeVisible();
    });

    test('should display date selector', async ({ page }) => {
        await expect(page.locator('#dateDisplay')).toBeVisible();
    });

    test('should show logout button', async ({ page }) => {
        await expect(page.locator('#btnLogout')).toBeVisible();
    });
});
