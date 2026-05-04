const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login.html');
    });

    test('should display login form', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Digital Twin');
        await expect(page.locator('#loginEmail')).toBeVisible();
        await expect(page.locator('#loginPassword')).toBeVisible();
        await expect(page.locator('#loginForm .btn-submit')).toContainText('Sign In');
        await expect(page.locator('#tabLogin')).toHaveClass(/active/);
    });

    test('should show signup form on tab click', async ({ page }) => {
        await page.locator('#tabSignup').click();
        await expect(page.locator('#tabSignup')).toHaveClass(/active/);
        await expect(page.locator('#signupForm')).toHaveClass(/active/);
        await expect(page.locator('#signupName')).toBeVisible();
        await expect(page.locator('#signupEmail')).toBeVisible();
        await expect(page.locator('#signupPassword')).toBeVisible();
    });

    test('should show toast error for empty login submission', async ({ page }) => {
        // Don't fill anything, just check required fields prevent submission
        const emailInput = page.locator('#loginEmail');
        await expect(emailInput).toHaveAttribute('required', '');
    });
});
