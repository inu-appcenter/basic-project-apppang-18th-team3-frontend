import { expect, test } from '@playwright/test';

test.describe('아이디·비밀번호 찾기 페이지', () => {
  test('아이디 찾기: 이름·전화번호 확인 후 이메일 목록을 보여준다', async ({ page }) => {
    await page.route('**/api/auth/find-email', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ emails: ['te***@example.com'] }),
      }),
    );

    await page.goto('/find-account');
    await page.fill('input[placeholder="이름"]', '테스트');
    await page.fill('input[placeholder="휴대폰 번호"]', '01012345678');
    await page.getByRole('button', { name: '아이디 찾기' }).last().click();

    await expect(page.getByText('아래 아이디로 가입되어 있어요')).toBeVisible();
    await expect(page.getByText('te***@example.com')).toBeVisible();
  });

  test('비밀번호 찾기: 본인인증 후 새 비밀번호로 변경한다', async ({ page }) => {
    await page.route('**/api/auth/password-reset-verify', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resetToken: 'reset-token-123' }),
      }),
    );
    await page.route('**/api/auth/reset-password', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok' }),
      }),
    );

    await page.goto('/find-account');
    await page.getByRole('button', { name: '비밀번호 찾기' }).click();
    await page.fill('input[placeholder="아이디(이메일)"]', 'user@example.com');
    await page.fill('input[placeholder="이름"]', '테스트');
    await page.fill('input[placeholder="휴대폰 번호"]', '01012345678');
    await page.getByRole('button', { name: '본인인증' }).click();

    await page.fill('input[placeholder="새 비밀번호 (8자 이상, 영문+숫자)"]', 'newPass123');
    await page.fill('input[placeholder="새 비밀번호 확인"]', 'newPass123');
    await page.getByRole('button', { name: '비밀번호 변경' }).click();

    await expect(page.getByText('비밀번호가 변경되었습니다')).toBeVisible();
  });
});
