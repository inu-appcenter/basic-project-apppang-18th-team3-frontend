import { expect, test } from '@playwright/test';

test.describe('검색 페이지', () => {
  test('1자 이상 입력 시 자동완성 목록을 보여준다', async ({ page }) => {
    await page.route('**/api/search/suggestions*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ suggestions: ['사과주스', '사과칩'] }),
      }),
    );

    await page.goto('/search');
    await page.locator('input[type="text"]').fill('사과');
    await expect(page.getByText('사과주스')).toBeVisible();
    await expect(page.getByText('사과칩')).toBeVisible();
  });

  test('추천 검색어는 기본 상태에서 보여진다', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('앱팡 추천 검색어')).toBeVisible();
    await expect(page.getByRole('button', { name: '휴지' })).toBeVisible();
  });
});
