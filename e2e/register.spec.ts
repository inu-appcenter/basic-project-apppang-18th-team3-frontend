import { expect, test } from '@playwright/test';

async function fillValidForm(page: import('@playwright/test').Page) {
  await page.fill('input[placeholder="비밀번호"]', 'Passw0rd1');
  await page.fill('input[placeholder="이름"]', '테스트');
  await page.fill('input[placeholder="휴대폰 번호"]', '01012345678');
  await page.getByText('모두 동의합니다.').click();
}

test.describe('회원가입 페이지', () => {
  test('이미 사용 중인 이메일이면 인라인 에러를 보여준다', async ({ page }) => {
    await page.route('**/api/auth/check-email*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: false }),
      }),
    );

    await page.goto('/register');
    await page.fill('input[type="email"]', 'taken@example.com');
    await page.locator('input[type="email"]').blur();

    await expect(page.getByText('이미 사용 중인 이메일입니다.')).toBeVisible();
  });

  test('사용 가능한 이메일이면 폼을 채웠을 때 가입 버튼이 활성화된다', async ({ page }) => {
    await page.route('**/api/auth/check-email*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      }),
    );

    await page.goto('/register');
    await page.fill('input[type="email"]', 'new@example.com');
    await page.locator('input[type="email"]').blur();
    await expect(page.getByText('이미 사용 중인 이메일입니다.')).toHaveCount(0);

    await fillValidForm(page);

    await expect(page.getByRole('button', { name: '가입하기' })).toBeEnabled();
  });

  test('가입 성공 시 자동 로그인 후 메인으로 이동한다', async ({ page }) => {
    await page.route('**/api/auth/check-email*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      }),
    );
    await page.route('**/api/auth/signup', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ userId: 1, email: 'new@example.com', name: '테스트' }),
      }),
    );
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token', user: { userId: 1, name: '테스트' } }),
      }),
    );

    await page.goto('/register');
    await page.fill('input[type="email"]', 'new@example.com');
    await page.locator('input[type="email"]').blur();
    await fillValidForm(page);
    await page.getByRole('button', { name: '가입하기' }).click();

    await page.waitForURL('/');
  });
});
