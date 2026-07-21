# API 연동 이슈 정리

전 페이지 실제 백엔드(`https://apppang.shop`) 연동 작업 중 발견한 문제와, 스펙(`docs/requirements.md`)에는 있지만
백엔드 계약이 없거나 페이지 범위 밖이라 연결하지 않은 항목을 정리한다. 검증은 (1) `npm run test:e2e`의 mock 기반
Playwright 테스트, (2) 테스트 계정(`claude-harness-check-1234@example.com`)으로 실제 서버에 대한 GET 전반 + 장바구니/찜
쓰기 API 1~2회 호출로 진행했다.

## 1. 백엔드 버그 (재현 확인됨)

### 1.1 상품/카테고리/배너 데이터가 DB에 전혀 없음

```bash
curl -s "https://apppang.shop/api/products?page=1&size=5" -H "Authorization: Bearer <token>"
# {"categoryId":null,"categoryName":null,"keyword":null,"page":1,"size":0,"total":0,"hasNext":false,"items":[]}

curl -s "https://apppang.shop/api/categories" -H "Authorization: Bearer <token>"   # {"items":[]}
curl -s "https://apppang.shop/api/banners" -H "Authorization: Bearer <token>"      # []
```

프론트 코드는 실제 스펙대로 정확히 연동했지만, 상품 리스트/상세/배너 슬라이더는 **빈 상태 렌더링까지만
검증 가능**했다. 정상적으로 데이터가 채워졌을 때의 UI(무한스크롤, 옵션 선택, 리뷰 목록 등)는 백엔드에 시드
데이터가 들어가야 검증할 수 있다.

### 1.2 `GET /api/products/{id}`가 존재하지 않는 id에 500을 반환 (404 아님)

```bash
curl -s -o /dev/null -w "status=%{http_code}\n" "https://apppang.shop/api/products/999999" -H "Authorization: Bearer <token>"
# status=500
```

상품이 하나도 없는 현재 DB 상태에서는 **모든 productId 조회가 500**이 된다. 프론트는 이 경우를 "상품 정보를
불러오지 못했습니다" 에러 화면으로 처리해 뒀지만, 정상 케이스(존재하는 id)는 검증하지 못했다.

### 1.3 `GET /api/banners`가 인증 없이 401을 반환

```bash
curl -s -o /dev/null -w "status=%{http_code}\n" "https://apppang.shop/api/banners"
# status=401
```

배너는 비로그인 사용자에게도 보여야 하는 공개 마케팅 콘텐츠인데 인증을 요구한다. 이 때문에
비로그인 상태로 메인 페이지에 진입하면 배너 조회가 401을 반환했고, `src/api/instance.ts`의
응답 인터셉터가 모든 401에 대해 무조건 `accessToken` 삭제 + `/login`으로 강제 이동시키던
버그와 겹쳐 **비로그인 사용자가 메인 페이지에 들어가자마자 로그인 페이지로 튕기는** 심각한
프론트 버그로 이어졌다. 인터셉터는 "토큰이 있었는데 401이 온 경우(세션 만료)"에만 강제
로그아웃하도록 수정했다(토큰 없이 401을 받은 공개 페이지의 부가 데이터 조회는 호출부의
`catch`가 조용히 처리). 백엔드의 `GET /api/banners` 인증 요구 자체는 프론트에서 고칠 수
없는 별도 버그로 남아있다.

### 1.4 `POST /api/cart`, `POST /api/wishlist`가 모두 409 "이미 가입된 이메일입니다" 반환

```bash
curl -s -X POST "https://apppang.shop/api/cart" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'
# HTTP 409 {"error":"이미 가입된 이메일입니다"}

curl -s -X POST "https://apppang.shop/api/wishlist" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"productId":1}'
# HTTP 409 {"error":"이미 가입된 이메일입니다"}
```

회원가입 이메일 중복확인 로직이 엉뚱한 엔드포인트에서도 발동하는 것으로 보인다. 이 버그 때문에
**장바구니 담기·찜하기 성공 케이스는 프론트/백엔드 양쪽 다 실증 검증이 불가능**했다. 코드는 정상 응답
스키마(`CartItemResponse`, `WishlistResponse`)를 기준으로 작성했고, mock e2e 테스트로 성공 경로 로직은
검증했다.

## 2. 요구사항엔 있지만 백엔드 계약이 없어 연결하지 않은 항목

| 페이지 | 항목 | 이유 |
|---|---|---|
| 검색 | 추천 검색어(입력 전 인기 키워드, `RECOMMENDED` 배열) | `GET /api/search/suggestions`는 `keyword` 입력이 있을 때 자동완성만 제공. 트렌드 키워드 조회 엔드포인트 자체가 없음 |
| 검색 | 최근 검색어 "전체 삭제" (로그인 상태) | 서버에 벌크 삭제 엔드포인트가 없어 키워드별 `DELETE`를 순차 호출하도록 구현 (원자적이지 않음) |
| 챗봇 | 상품 카드 응답 (7.3) | `POST /api/chat` 응답이 `{ reply, sessionId }` 뿐 — 구조화된 상품 데이터 계약이 없음 |
| 메인 | 카테고리 아이콘 메뉴 | `GET /api/categories` 응답이 `{ productId, name, imageUrl, price }` — 아이콘 메뉴(이름+슬러그)가 아니라 상품 추천 목록에 가까운 형태라 그대로 못 씀. 기존 클라이언트 정적 배열 유지 |
| 상품상세 | "도움이 돼요" 리뷰 투표 | 해당 API 없음 |
| 상품상세 | 바로구매 → 주문서 이동 | `docs/requirements.md`의 페이지 범위표 자체에 주문/결제 페이지가 없음 |
| 장바구니 | "총 N개 구매하기" 이동 | 위와 동일 — 주문 페이지가 없어 버튼 비활성화 조건만 반영, 이동 로직은 없음 |
| 장바구니 | 수량 증가 시 최대 재고 초과 가드 | `CartItemResponse`엔 재고/최대수량 필드가 없음 (상품 상세의 `stock`은 카트 응답에 노출되지 않음) |
| 마이페이지 | 퀵메뉴 5개 대상 페이지(찜리스트/최근본상품 등) | `App.tsx`에 해당 라우트 자체가 없음 (이번 스코프 아님, 기존과 동일한 dead link) |
| 마이페이지 | "최근 찾던 상품의 연관 상품" | `requirements.md` 9.6에 "구현 X"로 명시 — 기존 mock 유지 |
| 메인 | "추천 상품" 섹션 | `requirements.md` 3.6에 "구현 X"로 명시 — 기존 mock 유지 |

## 3. 검증하지 못한 부분 (스펙과 다를 수 있음, 주의)

- **`GET /api/products` 쿼리 파라미터명**: Swagger 문서에 파라미터가 전혀 명시돼 있지 않음. 응답이
  `categoryId`/`categoryName`/`keyword`/`page`/`size`를 그대로 echo하는 것으로 미루어 관례적인 이름
  (`categoryId`, `keyword`, `page`, `size`, `sort`)으로 구현했지만, 실제 데이터가 없어 필터링이 정말
  동작하는지는 확인하지 못했다.
- **주문 `status` 값**: `OrderSummaryResponse.status`가 실제로 `배송완료`/`배송중`/`주문접수` 한글 문자열과
  일치하는지 불명. 일치하지 않는 값이 오면 프론트에서 `주문접수`로 폴백하도록 방어 코드를 넣었다
  (`src/pages/MyPage.tsx`의 `toOrder`).
- **`GET /api/search/history` / `GET /api/users/recent-products`의 `Item.name` 필드**: 스키마가
  `{productId, name, imageUrl, price}`로 카테고리/최근본상품과 동일한 제네릭 타입을 재사용하고 있어, 검색
  기록에서 `name`이 실제로 검색 키워드 문자열이 맞는지는 실데이터로 확인하지 못했다.

## 4. 프론트엔드 자체 이슈 (이번 작업 중 발견, 백엔드와 무관)

### 4.1 (해결됨) 로그인 상태가 새로고침/앱 재시작 시 유지되지 않던 문제

`docs/requirements.md` 1.3 "JWT 정책"의 "앱 재실행 시 자동 로그인" 요구사항대로, `App.tsx` 최상단에서
`accessToken` 존재 시 `GET /api/users/me`로 재검증 후 `setAuth`로 복원하도록 수정 완료.

## 5. 실제로 연결한 것 요약

| 페이지 | 연결한 API |
|---|---|
| 메인 | `GET /api/banners`, `GET /api/users/recent-products` (로그인 시, 최근 찾던 상품의 연관 상품) |
| 검색 | `GET /api/search/suggestions`, `GET/POST/DELETE /api/search/history` (로그인 시), localStorage (비로그인) |
| 챗봇 | `GET /api/chat/history`, `POST /api/chat` |
| 상품 리스트 | `GET /api/products` (+ 무한스크롤, 정렬) |
| 상품 상세 | `GET /api/products/:id`, `GET /api/products/:id/reviews`, `POST/DELETE /api/wishlist`, `POST /api/cart` |
| 장바구니 | `GET /api/cart`, `PATCH /api/cart/:id`, `DELETE /api/cart/:id` |
| 마이페이지 | `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/me/password`, `GET /api/orders`, `GET /api/users/recent-products`, `POST /api/auth/logout` |
| 배송지 관리/입력/선택 | `GET/POST/PATCH/DELETE /api/addresses` |
| 주문내역/주문상세/주문·결제 | `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`, `POST /api/orders/estimate` |

로그인/회원가입(`POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/check-email`)은 이전 작업에서
이미 연동 완료.
