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

### 1.3 `POST /api/cart`, `POST /api/wishlist`가 모두 409 "이미 가입된 이메일입니다" 반환

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

### 4.1 로그인 상태가 새로고침/앱 재시작 시 유지되지 않음

`src/store/authStore.ts`의 `isLoggedIn`은 인메모리 상태로, 로그인 성공 시에만 `true`가 된다.
`localStorage`의 `accessToken`을 앱 부팅 시 재검증해서 자동으로 `isLoggedIn`을 복원하는 로직이 없다.

`docs/requirements.md` 1.3 "JWT 정책"엔 "앱 재실행 시 자동 로그인 (토큰 유효성 검사 후 메인 이동)"이 명시돼
있는데 현재 미구현이다. 실제로는 로그인 직후 세션 안에서 클라이언트 사이드 라우팅으로 이동하는 동안엔
문제없이 동작하지만(예: `NavigationBar`로 `/cart`, `/mypage` 이동 — `e2e/authenticated-pages.spec.ts`에서
검증), 브라우저를 새로고침하면 `accessToken`이 남아있어도 `isLoggedIn`이 `false`로 리셋된다. 이번 스코프엔
포함하지 않았지만 별도로 처리가 필요하다 (예: `App.tsx` 최상단에서 `accessToken` 존재 시 `/api/users/me` 호출로
재검증 후 `setAuth` 복원).

## 5. 실제로 연결한 것 요약

| 페이지 | 연결한 API |
|---|---|
| 메인 | `GET /api/banners` |
| 검색 | `GET /api/search/suggestions`, `GET/POST/DELETE /api/search/history` (로그인 시), localStorage (비로그인) |
| 챗봇 | `GET /api/chat/history`, `POST /api/chat` |
| 상품 리스트 | `GET /api/products` (+ 무한스크롤, 정렬) |
| 상품 상세 | `GET /api/products/:id`, `GET /api/products/:id/reviews`, `POST/DELETE /api/wishlist`, `POST /api/cart` |
| 장바구니 | `GET /api/cart`, `PATCH /api/cart/:id`, `DELETE /api/cart/:id` |
| 마이페이지 | `GET /api/users/me`, `GET /api/orders`, `POST /api/auth/logout` |

로그인/회원가입(`POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/check-email`)은 이전 작업에서
이미 연동 완료.
