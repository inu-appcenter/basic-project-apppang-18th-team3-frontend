import { expect, test } from '@playwright/test';

const PRODUCT_DETAIL = {
  productId: 42,
  brand: '테스트 브랜드',
  name: '테스트 상품',
  images: ['https://example.com/1.jpg'],
  optionInfo: '',
  price: 1000,
  originalPrice: 1000,
  discountRate: 0,
  unitPrice: '',
  shippingInfo: '무료배송',
  rocketDelivery: false,
  stock: 10,
  description: '상품 설명',
  detailImages: [],
  categoryId: 1,
  isWished: false,
  canWriteReview: false,
  reviewSummary: { averageRating: 0, reviewCount: 0 },
};

const ADDRESS = {
  addressId: 1,
  recipientName: '홍길동',
  phone: '01012345678',
  zipcode: '12345',
  address: '서울시 강남구',
  detailAddress: '101호',
  normalDeliveryRequest: '문 앞',
  rocketDeliveryRequest: '문 앞',
  isDefault: true,
};

test.describe('체크아웃 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token', user: { userId: 1, name: '테스트유저' } }),
      }),
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
          appMoney: 100000,
          createdAt: '2026-01-01T00:00:00',
        }),
      }),
    );
    await page.route('**/api/products/42', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PRODUCT_DETAIL),
      }),
    );
    await page.route('**/api/products/42/reviews*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          productName: PRODUCT_DETAIL.name,
          averageRating: 0,
          reviewCount: 0,
          page: 1,
          total: 0,
          items: [],
        }),
      }),
    );
    await page.route('**/api/addresses', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([ADDRESS]),
      }),
    );
    await page.route(/\/api\/orders\/estimate(\?.*)?$/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          productAmount: 2000,
          discountAmount: 0,
          shippingFee: 0,
          totalPrice: 2000,
        }),
      }),
    );
    await page.route('**/api/orders', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 99,
          totalPrice: 2000,
          status: 'PAID',
          remainingMoney: 98000,
        }),
      }),
    );

    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("로그인")');
    await page.waitForURL('/');
  });

  test('수량 변경 후에도 결제하기 버튼이 활성화 상태를 유지하고 결제가 진행된다', async ({
    page,
  }) => {
    await page.goto('/products/42');
    await page.getByRole('button', { name: '바로구매' }).click();
    await page.waitForURL('**/checkout');

    const payButton = page.getByRole('button', { name: '결제하기' });
    await expect(payButton).toBeEnabled();

    await page.getByRole('button', { name: '수량 증가' }).click();
    await expect(payButton).toBeEnabled();

    await payButton.click();
    await page.waitForURL('**/mypage/orders/99');
  });

  test('등록된 배송지가 없으면 결제하기 대신 배송지 추가 안내를 보여준다', async ({ page }) => {
    await page.route('**/api/addresses', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/products/42');
    await page.getByRole('button', { name: '바로구매' }).click();
    await page.waitForURL('**/checkout');

    await expect(page.getByRole('button', { name: '결제하기' })).toBeDisabled();
    const addAddressButton = page.getByRole('button', { name: '배송지를 추가해주세요' });
    await expect(addAddressButton).toBeVisible();

    await addAddressButton.click();
    await page.waitForURL('**/mypage/addresses/new');
  });

  test('수량을 직접 입력해 변경할 수 있고 0 이하는 무시한다', async ({ page }) => {
    await page.goto('/products/42');
    await page.getByRole('button', { name: '바로구매' }).click();
    await page.waitForURL('**/checkout');

    const quantityInput = page.getByRole('spinbutton', { name: '수량 직접 입력' });
    await quantityInput.fill('5');
    await quantityInput.press('Enter');
    await expect(quantityInput).toHaveValue('5');

    await quantityInput.fill('0');
    await quantityInput.press('Enter');
    await expect(quantityInput).toHaveValue('5');
  });
});
