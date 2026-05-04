const { test, expect } = require('@playwright/test');

test.describe('Digital Twin Status', () => {
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

    test('should display twin aura', async ({ page }) => {
        const aura = page.locator('#twinAura');
        await expect(aura).toBeVisible();
        const classList = await aura.getAttribute('class');
        expect(classList).toContain('twin-aura');
    });

    test('should display twin health badge', async ({ page }) => {
        await expect(page.locator('#twinHealthBadge')).toBeVisible();
        await expect(page.locator('.badge-text')).toContainText(/Analyzing|Good|Fair|Poor/);
    });

    test('should show chart for activity trends', async ({ page }) => {
        const chart = page.locator('#activityChart, .chart-container, canvas').first();
        await expect(chart).toBeVisible();
    });

    test('should update avatar expression', async ({ page }) => {
        const mouth = page.locator('#avatarMouth');
        await expect(mouth).toBeVisible();
        const classList = await mouth.getAttribute('class');
        expect(classList).toContain('avatar-mouth');
    });
});
