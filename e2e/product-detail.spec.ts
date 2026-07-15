import { expect, test } from '@playwright/test';

const PRODUCT_DETAIL = {
  productId: 42,
  brand: '테스트 브랜드',
  name: '테스트 상품 상세',
  images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
  optionInfo: '',
  price: 1000,
  originalPrice: 2000,
  discountRate: 50,
  unitPrice: '100g당 100원',
  shippingInfo: '무료배송',
  rocketDelivery: false,
  stock: 10,
  description: '상품 설명',
  detailImages: [],
  categoryId: 1,
  isWished: false,
  canWriteReview: false,
  reviewSummary: { averageRating: 4.5, reviewCount: 10 },
};

const REVIEW_LIST = {
  productName: '테스트 상품 상세',
  averageRating: 4.5,
  reviewCount: 1,
  page: 1,
  total: 1,
  items: [
    {
      reviewId: 1,
      userName: '테스터',
      rating: 5,
      title: '',
      content: '좋아요',
      createdAt: '2026-01-01T00:00:00',
      images: [],
    },
  ],
};

test.describe('상품 상세 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products/42', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PRODUCT_DETAIL) }),
    );
    await page.route('**/api/products/42/reviews*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REVIEW_LIST) }),
    );
  });

  test('상품 정보를 불러와 렌더링한다', async ({ page }) => {
    await page.goto('/products/42');
    await expect(page.getByText('테스트 상품 상세')).toBeVisible();
    await expect(page.getByText('좋아요')).toBeVisible();
  });

  test('비로그인 상태에서 찜하기 클릭 시 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/products/42');
    await page.getByRole('button', { name: '좋아요' }).click();
    await page.waitForURL('**/login');
  });

  test('비로그인 상태에서 장바구니 담기 클릭 시 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/products/42');
    await page.getByRole('button', { name: '장바구니 담기' }).click();
    await page.waitForURL('**/login');
  });
});
