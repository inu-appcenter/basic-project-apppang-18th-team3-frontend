import { expect, test } from '@playwright/test';

test.describe('상품 리스트 페이지', () => {
  test('상품이 없으면 "상품이 없습니다"를 보여준다', async ({ page }) => {
    await page.route('**/api/products*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categoryId: null,
          categoryName: null,
          keyword: null,
          page: 1,
          size: 0,
          total: 0,
          hasNext: false,
          items: [],
        }),
      }),
    );

    await page.goto('/products');
    await expect(page.getByText('상품이 없습니다')).toBeVisible();
  });

  test('상품 목록을 렌더링하고 클릭 시 상세로 이동한다', async ({ page }) => {
    await page.route('**/api/products*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categoryId: null,
          categoryName: null,
          keyword: null,
          page: 1,
          size: 1,
          total: 1,
          hasNext: false,
          items: [
            {
              productId: 42,
              name: '테스트 상품',
              imageUrl: 'https://example.com/p.jpg',
              optionInfo: '',
              price: 1000,
              originalPrice: 2000,
              discountRate: 50,
              unitPrice: '100g당 100원',
              averageRating: 4.5,
              reviewCount: 10,
              shippingInfo: '무료배송',
              rocketDelivery: false,
            },
          ],
        }),
      }),
    );

    await page.goto('/products');
    await expect(page.getByText('테스트 상품')).toBeVisible();
    await page.getByText('테스트 상품').click();
    await page.waitForURL('**/products/42');
  });
});
