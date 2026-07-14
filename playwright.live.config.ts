import { defineConfig } from '@playwright/test';

// 실제 운영 백엔드(apppang.shop)를 직접 호출하는 라이브 스모크 테스트 전용 설정입니다.
// 목(mock) 기반 e2e 스펙과 분리되어 있으며, 기본 `npm run test:e2e`에는 포함되지 않습니다.
export default defineConfig({
  testDir: './e2e/live',
  reporter: 'list',
  use: {
    baseURL: 'https://apppang.shop',
  },
});
