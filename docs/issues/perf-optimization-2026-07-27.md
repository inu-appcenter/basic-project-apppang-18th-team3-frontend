# 전체 코드 성능 최적화 (2026-07-27)

페이지 이동/액션 시 체감 딜레이 문제로 전체 코드베이스를 점검한 결과.

## 수정 완료

### 1. 라우트 단위 코드 스플리팅 — `src/App.tsx`
- 문제: 19개 페이지가 모두 `App.tsx`에서 정적 import되어 첫 진입 시 전체 페이지 코드가 하나의 번들에 포함됨.
- 영향: 앱 최초 로드(TTI) 시 실제로 필요 없는 페이지 코드까지 파싱/실행하며 초기 딜레이 발생.
- 조치: 첫 진입 라우트인 `MainPage`만 정적 import 유지, 나머지 18개 페이지는 `React.lazy` + `Suspense`로 전환. 라우트 진입 시에만 해당 페이지 청크를 요청.
- 효과(빌드 결과 확인): 메인 번들 `index-*.js` 298KB(gzip 98KB) + 페이지별 청크 0.6~14KB로 분리. 이전에는 전부 메인 번들에 합산되어 있었음.

### 2. 리스트 아이템 불필요 리렌더링 — `src/pages/ProductListPage.tsx`, `src/pages/ProductDetailPage.tsx`
- 문제: `ProductCard`(상품 목록, 무한스크롤로 수십~수백 개 누적 가능), `ReviewItem`(상품 상세 리뷰 목록)이 메모이제이션 없이 일반 함수 컴포넌트로 선언됨.
- 영향: 정렬 드롭다운 토글, 로켓배송 필터, 상품 상세의 색상/수량 옵션 선택 등 부모 state 변경 시마다 무관한 리스트 아이템까지 전부 리렌더링되어 탭/스크롤 액션에 버벅임 발생.
- 조치: 두 컴포넌트를 `React.memo`로 감싸 `product`/`review` prop 참조가 바뀌지 않으면 리렌더링을 스킵하도록 함.

### 3. 리스트 이미지 지연 로딩 — `ProductListPage`, `ProductDetailPage`(`ReviewItem`), `RecentProductsSection`
- 문제: 상품 목록/리뷰/최근 본 상품 이미지에 `loading="lazy"`가 누락되어 화면 밖 이미지까지 즉시 네트워크 요청.
- 조치: `loading="lazy" decoding="async"` 추가. (상품 상세의 상세 이미지/리뷰 사진 그리드는 이미 적용되어 있었음 — 누락된 지점만 통일)

## 검증
- `tsc -b --noEmit` 통과
- `eslint` 통과 — 변경 파일 기준(사전 존재하던 무관 파일 41건의 prettier/no-param-reassign 에러는 이번 변경 범위 밖이라 그대로 둠)
- `npm run build` 통과 (청크 분리 확인)
- `npx playwright test` 26/26 통과

## 손대지 않은 것 (root cause 아님)
- 토스트류 `setTimeout(..., 2000)`은 자동 사라짐 UX용 타이머로 정상 동작이며 딜레이 원인 아님.
- zustand 스토어 사용은 이미 selector 패턴(`useXStore((s) => s.field)`)으로 되어 있어 불필요한 리렌더링 유발 지점 없음.
- `CartPage`의 아이템 카드는 개수가 적어(장바구니 특성상) 메모이제이션 이득이 크지 않아 제외.
