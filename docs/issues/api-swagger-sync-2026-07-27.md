# API 스웨거 재동기화 (2026-07-27)

백엔드 API 변경 후 https://apppang.shop/swagger-ui/index.html (`/v3/api-docs`) 전체 스펙(34개 엔드포인트)을 프론트 `src/api/*`, `src/types/*`와 1:1 대조한 결과.

## 수정 완료 (실제 연결 깨져있던 것)

### 1. 상품 목록 카테고리 필터 — `src/api/product.ts`
- 문제: 프론트가 `categoryId` 쿼리파라미터로 요청, 백엔드는 `category_id`(snake_case)만 인식.
- 영향: 메인 카테고리 클릭 / 상품목록 카테고리 필터가 조용히 무시되고 전체 상품이 내려옴 (에러 없이 틀린 결과).
- 조치: `getProducts` 내부에서 `categoryId` → `category_id`로 매핑해서 전송. 타입(`GetProductsParams`)은 camelCase 유지, 실제 와이어 포맷만 변환.
- 참고: `keyword`, `page`, `size`, `sort`는 이름 그대로 일치해서 손 안 댐. `min_price`/`max_price`/`rocket_delivery` 쿼리도 스웨거에 있지만 프론트에 가격/로켓 필터 UI 자체가 없어(로켓 필터는 클라이언트 사이드 필터링만 함) 미반영 — 필요해지면 `GetProductsParams`에 추가하면 됨.

### 2. 최근 찾던 상품 — `src/api/mypage.ts`
- 문제: `GET /api/users/recent-products` 호출 중, 실제 경로는 `GET /api/users/me/recent-products`.
- 영향: 메인 페이지 `RecentProductsSection`이 항상 404 → 빈 목록으로 표시됨.
- 조치: URL을 `/api/users/me/recent-products`로 수정.

### 3. 최근 검색어 — `src/types/search.ts`, `src/pages/SearchPage.tsx`
- 문제: 프론트는 검색어 기록 아이템을 "최근 조회 상품"({productId, name, imageUrl, price})으로 가정했으나, 실제 스웨거 응답은 검색 키워드 기록 `{ keyword, searchedAt }`.
- 영향: 로그인 상태에서 최근 검색어가 항상 빈 칩으로 보임(`item.name`이 존재하지 않는 필드라 `undefined`).
- 조치: `SearchHistoryItem` 타입을 `{ keyword: string; searchedAt: string }`로 교체, `SearchPage.tsx`에서 `item.name` → `item.keyword`로 수정.

## 검증
- `tsc --noEmit` 통과
- `eslint` 통과 (변경 파일 기준)
- `npm run build` 통과
- 테스트 스크립트 없음(프로젝트에 test 커맨드 미설정) — 스킵

## 이상 없음 확인된 것들
아래는 스웨거와 대조해서 필드명·타입까지 100% 일치 확인된 것들 (수정 안 함): `address.ts`/`AddressResponse`·`AddressRequest`, `auth.ts`의 login/signup/checkEmail/logout, `banner.ts`, `cart.ts` 전체, `order.ts`의 estimate/create/detail, `mypage.ts`의 getMe/getOrders/updateMe/updatePassword, `product.ts`의 상품 상세·리뷰 목록(직전 커밋에서 이미 리뷰 images 필드 반영함), `wishlist.ts` 전체.

## 추가로 구현 완료 (2026-07-27 후속 작업)
아래 4개는 처음엔 "새 기능 개발 필요, 범위 밖"으로 남겨뒀다가 이어서 요청받아 구현함.
- **아이디·비밀번호 찾기** — `FindAccountPage.tsx`(`/find-account`) 신규. `findEmail`/`verifyPasswordReset`/`resetPassword` API 함수 추가(`api/auth.ts`, `types/auth.ts`). `LoginPage`의 "아이디·비밀번호 찾기" 버튼이 토스트 대신 이 페이지로 이동하도록 수정.
- **주문 취소** — `cancelOrder` API 추가(`api/order.ts`, `types/order.ts`의 `OrderCancelResponse`). `OrderDetailPage`에 취소 버튼 추가(배송완료/이미 취소된 주문은 숨김 — 정확한 취소 가능 상태값을 백엔드가 문서화하지 않아 `NOT_CANCELABLE_STATUSES` 하드코딩 목록으로 추정 처리함, 실제 상태값 늘어나면 갱신 필요).
- **리뷰 작성** — `ReviewWritePage.tsx`(`/products/:productId/reviews/new`) 신규(별점/제목/내용/사진 최대 5장). `createReview`가 실제 스펙대로 `multipart/form-data`(FormData)로 전송하도록 수정, `ReviewCreateRequest.images` 타입을 `string[]` → `File[]`로 변경. `ProductDetailPage`의 "리뷰 작성하기" 버튼을 이 페이지로 연결.
- **찜리스트** — `WishlistPage.tsx`(`/mypage/wishlist`) 신규. 기존에 있던 `getWishlist`/`removeWishlist`를 붙여서 목록 표시 + 찜 해제.
- 카테고리 아이디(`GET /api/categories`)는 사용자 확인 결과 `MainPage`에 이미 정확히 반영되어 있어(1~10번 카테고리ID 일치) 추가 작업 없음.
- e2e 커버리지: `e2e/find-account.spec.ts`, `e2e/order-detail.spec.ts`, `e2e/wishlist.spec.ts` 신규 + `e2e/product-detail.spec.ts`에 리뷰 작성 플로우 테스트 추가. 기존 스펙 중 `/api/users/recent-products`를 목킹하던 3개 파일(`authenticated-pages`, `login`, `register`)은 위 1번 URL 수정에 맞춰 `/api/users/me/recent-products`로 같이 고침.

## 백엔드 쪽에 확인이 필요한 스웨거 문서 자체 문제
- `RecentProductResponse`, `SearchHistoryListResponse`, `CategoryResponse` 세 스키마의 `items` 배열 원소가 스웨거 컴포넌트 스키마상 전부 동일한 `Item`(`{categoryId, name, iconUrl}`) 하나로 뭉개져 있음 — 실제 예시(example) 값은 각기 다름(최근상품은 `{productId,name,imageUrl,price}`, 검색기록은 `{keyword,searchedAt}`). 아마 백엔드에서 같은 이름의 내부 클래스가 여러 개라 springdoc이 스키마를 덮어쓴 것으로 보임. 이번엔 example 값 기준으로 프론트를 맞췄지만, 백엔드에서 DTO 클래스명을 구분해서 스웨거 스키마가 실제 응답과 일치하도록 고치는 게 안전함.
- `GET /api/addresses`, `/api/banners`, `/api/orders`, `/api/wishlist` 응답 스키마가 배열이 아니라 단일 객체로 선언돼 있음(example만 배열). 실제로는 배열로 내려오는 게 맞아 보이지만(설명에 "없으면 빈 배열"이라 적혀있음), 스키마 선언 자체는 고쳐야 스웨거 기반 코드 생성 도구를 쓸 때 문제가 안 됨.
