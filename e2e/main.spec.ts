import { expect, test } from '@playwright/test';

test.describe('메인 페이지', () => {
  test('배너를 불러와 렌더링하고 클릭 시 linkUrl로 이동한다', async ({ page }) => {
    await page.route('**/api/banners', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, imageUrl: 'https://example.com/banner1.jpg', linkUrl: '/products?category=1', displayOrder: 1 },
        ]),
      }),
    );

    await page.goto('/');
    await expect(page.getByRole('button', { name: '배너 1 이동' })).toBeVisible();

    await page.getByRole('button', { name: '배너 1 이동' }).click();
    await page.waitForURL('**/products?category=1');
  });

  test('배너가 없으면 빈 상태로도 페이지가 깨지지 않는다', async ({ page }) => {
    await page.route('**/api/banners', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto('/');
    await expect(page.getByText('앱팡에서 검색하세요!')).toBeVisible();
  });
});
