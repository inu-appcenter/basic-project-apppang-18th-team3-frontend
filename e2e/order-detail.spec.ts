import { expect, test } from '@playwright/test';

const ORDER_SUMMARY = {
  orderId: 77,
  orderDate: '2026-07-01T10:00:00',
  status: '배송중',
  totalPrice: 10000,
  items: [
    {
      orderItemId: 1,
      productId: 5,
      productName: '테스트상품',
      quantity: 1,
      price: 10000,
      status: '배송중',
    },
  ],
};

const ORDER_DETAIL = {
  orderId: 77,
  orderDate: '2026-07-01T10:00:00',
  status: '배송중',
  productAmount: 10000,
  discountAmount: 0,
  shippingFee: 0,
  paymentMethod: 'app_money',
  totalPrice: 10000,
  recipientName: '홍길동',
  phone: '01000000000',
  zipcode: '00000',
  address: '서울시',
  detailAddress: '101호',
  deliveryRequest: '',
  items: ORDER_SUMMARY.items,
};

test('로그인 후 주문상세에서 주문 취소 버튼으로 주문을 취소한다', async ({ page }) => {
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
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([ORDER_SUMMARY]),
    }),
  );
  await page.route('**/api/orders/77', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ORDER_DETAIL),
    }),
  );
  await page.route('**/api/orders/77/cancel', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orderId: 77,
        status: '주문취소',
        refundMoney: 10000,
        remainingMoney: 10000,
      }),
    }),
  );

  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("로그인")');
  await page.waitForURL('/');

  await page.getByRole('button', { name: '마이페이지' }).click();
  await page.waitForURL('**/mypage');
  await page.getByRole('button', { name: '주문내역' }).click();
  await page.waitForURL('**/mypage/orders');
  await page.getByRole('button', { name: '주문 상세' }).click();
  await page.waitForURL('**/mypage/orders/77');

  const cancelButtons = page.getByRole('button', { name: '주문 취소' });
  await cancelButtons.first().click();
  await cancelButtons.nth(1).click();

  await expect(page.getByText('주문이 취소되었습니다')).toBeVisible();
});
