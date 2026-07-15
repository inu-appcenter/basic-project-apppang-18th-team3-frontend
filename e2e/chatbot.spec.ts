import { expect, test } from '@playwright/test';

test.describe('챗봇 페이지', () => {
  test('메시지를 보내면 실제 API 응답을 봇 말풍선으로 보여준다', async ({ page }) => {
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: '테스트 응답입니다', sessionId: 'test-session' }),
      }),
    );

    await page.goto('/chatbot');
    await page.getByPlaceholder('메시지를 입력하세요...').fill('안녕');
    await page.getByPlaceholder('메시지를 입력하세요...').press('Enter');

    await expect(page.getByText('테스트 응답입니다')).toBeVisible();
  });

  test('API 실패 시 폴백 메시지를 보여준다', async ({ page }) => {
    await page.route('**/api/chat', (route) => route.fulfill({ status: 500 }));

    await page.goto('/chatbot');
    await page.getByPlaceholder('메시지를 입력하세요...').fill('안녕');
    await page.getByPlaceholder('메시지를 입력하세요...').press('Enter');

    await expect(page.getByText('죄송해요, 아직 해당 질문에 대한 답변을 준비 중이에요')).toBeVisible();
  });
});
