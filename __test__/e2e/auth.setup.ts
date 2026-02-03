import { test as setup } from '@playwright/test';

import { TEST_USER } from '../fixtures/auth/users';

const authFile = './__tests__/fixtures/auth/user.json';

setup('유저정보 setup', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: '아이디' }).fill(TEST_USER.valid.id);
  await page.getByLabel('비밀번호').fill(TEST_USER.valid.password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.setViewportSize({ width: 768, height: 1080 });

  const logo = page.getByTestId('onsquad-logo');

  expect(logo).toBeVisible();

  await page.context().storageState({ path: authFile });
});
