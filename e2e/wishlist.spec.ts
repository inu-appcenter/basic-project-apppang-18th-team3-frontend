import { expect, test } from '@playwright/test';

const WISHLIST_ITEM = {
  wishlistId: 1,
  productId: 5,
  productName: '테스트 상품',
  brand: '테스트 브랜드',
  price: 10000,
  rocketDelivery: true,
};

test('로그인 후 찜리스트에서 목록을 보고 찜을 해제한다', async ({ page }) => {
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
  await page.route('**/api/users/me/recent-products', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' }),
  );
  await page.route('**/api/users/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId: 1,
        email: 'user@example.com',
        name: '테스트유저',
        phoneNumber: '01000000000',
        appMoney: 0,
        createdAt: '2026-01-01T00:00:00',
      }),
    }),
  );
  await page.route('**/api/orders', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/wishlist', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([WISHLIST_ITEM]),
    }),
  );
  await page.route('**/api/wishlist/5', (route) => route.fulfill({ status: 204 }));

  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("로그인")');
  await page.waitForURL('/');

  await page.getByRole('button', { name: '마이페이지' }).click();
  await page.waitForURL('**/mypage');
  await page.getByRole('button', { name: '찜리스트' }).click();
  await page.waitForURL('**/mypage/wishlist');

  await expect(page.getByText('테스트 상품')).toBeVisible();

  await page.getByRole('button', { name: '찜 해제' }).click();
  await expect(page.getByText('테스트 상품')).toHaveCount(0);
  await expect(page.getByText('찜한 상품이 없어요')).toBeVisible();
});
