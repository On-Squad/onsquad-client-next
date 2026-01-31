import { expect, test } from '@playwright/test';

test.describe('Appbar', () => {
  test('로고가 렌더링되고 클릭 가능', async ({ page }) => {
    await page.goto('/');

    const logo = page.getByTestId('onsquad-logo');
    await expect(logo).toBeVisible();

    await logo.click();

    await expect(page).toHaveURL('/');
  });
});
