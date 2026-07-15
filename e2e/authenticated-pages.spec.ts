import { expect, test } from '@playwright/test';

// zustand authStore는 새로고침/풀 네비게이션 시 리셋되므로(localStorage의 accessToken을
// 부팅 시 재검증하는 로직이 없음 — docs/api-integration-issues.md 참고), 로그인 상태가
// 필요한 페이지는 실제 로그인 후 NavigationBar로 클라이언트 사이드 이동해야 세션이 유지된다.
async function loginThenGoTo(page: import('@playwright/test').Page, navLabel: string) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-token', user: { userId: 1, name: '테스트유저' } }),
    }),
  );
  await page.route('**/api/banners', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("로그인")');
  await page.waitForURL('/');

  await page.getByRole('button', { name: navLabel }).click();
}

test.describe('로그인 상태에서만 접근하는 페이지', () => {
  test('장바구니가 비어 있으면 빈 상태를 보여준다', async ({ page }) => {
    await page.route('**/api/cart', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ itemCount: 0, totalPrice: 0, items: [] }),
      }),
    );

    await loginThenGoTo(page, '장바구니');
    await page.waitForURL('**/cart');
    await expect(page.getByText('장바구니가 비어 있어요')).toBeVisible();
  });

  test('마이페이지가 로그인 사용자 정보를 보여준다', async ({ page }) => {
    await page.route('**/api/users/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 1,
          email: 'user@example.com',
          name: '테스트유저',
          phoneNumber: '01000000000',
          appMoney: 1000,
          createdAt: '2026-01-01T00:00:00',
        }),
      }),
    );
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await loginThenGoTo(page, '마이페이지');
    await page.waitForURL('**/mypage');
    await expect(page.getByText('테***저')).toBeVisible();
    await expect(page.getByText('주문 내역이 없습니다')).toBeVisible();
  });
});
