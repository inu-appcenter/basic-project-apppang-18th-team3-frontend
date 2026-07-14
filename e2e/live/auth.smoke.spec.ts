import { expect, test } from '@playwright/test';

// 실제 운영 백엔드(apppang.shop)를 직접 호출하는 스모크 테스트입니다.
// 목(mock) 테스트와 달리 백엔드 상태에 따라 실패할 수 있으니 CI에서 자동 실행하지 마세요.
// 실행: npm run test:e2e:live
test.describe('실제 백엔드 스모크 테스트', () => {
  test('로그인/이메일 중복확인 엔드포인트가 JSON으로 응답한다', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'smoke-test@example.com', password: 'invalid-password' },
    });
    console.log(`POST /api/auth/login -> ${loginRes.status()}`);
    expect(loginRes.headers()['content-type']).toContain('application/json');

    const checkEmailRes = await request.get('/api/auth/check-email', {
      params: { email: 'smoke-test@example.com' },
    });
    console.log(`GET /api/auth/check-email -> ${checkEmailRes.status()}`);
    expect(checkEmailRes.headers()['content-type']).toContain('application/json');
  });
});
