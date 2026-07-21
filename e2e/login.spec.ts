import { expect, test } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test('잘못된 자격 증명 시 에러 토스트를 보여준다', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: '아이디 또는 비밀번호가 일치하지 않습니다' }),
      }),
    );

    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("로그인")');

    await expect(page.getByText('아이디 또는 비밀번호가 일치하지 않습니다')).toBeVisible();
  });

  test('로그인 성공 시 토큰을 저장하고 메인으로 이동한다', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token', user: { userId: 1, name: '테스트' } }),
      }),
    );
    await page.route('**/api/banners', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.route('**/api/users/recent-products', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' }),
    );

    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("로그인")');

    await page.waitForURL('/');
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBe('test-token');
  });
});
