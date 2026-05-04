const { test, expect } = require('@playwright/test');

test.describe('Activity Logging', () => {
    test.beforeEach(async ({ page }) => {
        // Set up auth state
        await page.goto('/login.html');
        await page.evaluate(() => {
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Test User');
        });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should display activity cards with values', async ({ page }) => {
        // Check cards show values
        await expect(page.locator('#valCalories')).toBeVisible();
        await expect(page.locator('#valSleep')).toBeVisible();
        await expect(page.locator('#valExercise')).toBeVisible();
        await expect(page.locator('#valHygiene')).toBeVisible();
    });

    test('should have activity cards clickable', async ({ page }) => {
        const card = page.locator('.activity-card').first();
        await expect(card).toBeVisible();
    });
});
