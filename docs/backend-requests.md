# 백엔드 요청 사항

실서버(`https://apppang.shop`) 연동 중 발견한 문제를 백엔드팀에 전달하기 위해 정리한 문서.
상세 재현 로그와 근거는 `docs/api-integration-issues.md` 참고.

## 1. 당장 고쳐야 할 버그

### 1.1 `GET /api/banners` — 인증 없이 401 반환

```bash
curl -s -o /dev/null -w "status=%{http_code}\n" "https://apppang.shop/api/banners"
# status=401
```

배너는 비로그인 사용자에게도 보여야 하는 공개 마케팅 콘텐츠인데 인증을 요구하고 있음.
비로그인 상태로 메인 페이지에 들어가면 배너 조회가 401이 되어, 프론트 쪽 세션 처리 로직과
겹쳐 메인 페이지가 정상 동작하지 않는 문제로 이어졌음(프론트에서는 임시 방어 처리함).
**인증 없이도 200을 반환하도록 수정 요청.**

### 1.2 `POST /api/cart`, `POST /api/wishlist` — 둘 다 409 "이미 가입된 이메일입니다" 반환

```bash
curl -s -X POST "https://apppang.shop/api/cart" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'
# HTTP 409 {"error":"이미 가입된 이메일입니다"}

curl -s -X POST "https://apppang.shop/api/wishlist" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"productId":1}'
# HTTP 409 {"error":"이미 가입된 이메일입니다"}
```

회원가입 이메일 중복확인 로직이 완전히 다른 엔드포인트(장바구니 담기/찜하기)에서도
잘못 발동하는 것으로 보임. **이 버그 때문에 장바구니 담기·찜하기 성공 케이스를 실서버에서
전혀 검증할 수 없는 상태.** 우선순위 높음.

### 1.3 `GET /api/products/{id}` — 존재하지 않는 id 조회 시 500 반환 (404여야 함)

```bash
curl -s -o /dev/null -w "status=%{http_code}\n" "https://apppang.shop/api/products/999999" -H "Authorization: Bearer <token>"
# status=500
```

존재하지 않는 리소스는 404를 반환해야 함. 현재 상품 DB가 비어 있어 **모든 productId 조회가
500**이 되는 상태라 정상 케이스도 함께 검증 불가.

### 1.4 상품/카테고리/배너 DB에 시드 데이터가 전혀 없음

```bash
curl -s "https://apppang.shop/api/products?page=1&size=5" -H "Authorization: Bearer <token>"
# {"categoryId":null,"categoryName":null,"keyword":null,"page":1,"size":0,"total":0,"hasNext":false,"items":[]}
curl -s "https://apppang.shop/api/categories" -H "Authorization: Bearer <token>"   # {"items":[]}
curl -s "https://apppang.shop/api/banners" -H "Authorization: Bearer <token>"      # []
```

프론트는 스펙대로 정확히 연동했지만, 빈 상태 렌더링까지만 검증 가능했음. 무한스크롤·옵션
선택·리뷰 목록 등 "데이터가 있을 때"의 실제 동작은 시드 데이터가 들어가야 검증 가능.

## 2. 확인 및 문서화 요청

### 2.1 `GET /api/products` 쿼리 파라미터명 명세 필요

Swagger에 쿼리 파라미터가 전혀 명시되어 있지 않음. 응답이 `categoryId`/`categoryName`/
`keyword`/`page`/`size`를 그대로 echo하는 것으로 미루어 관례적인 이름(`categoryId`,
`keyword`, `page`, `size`, `sort`)으로 구현했는데, 실제 데이터가 없어 필터링이 의도대로
동작하는지 확인 못 함. 정확한 파라미터명 확정 요청.

### 2.2 주문 `status` 값 확정 필요

`OrderSummaryResponse.status`가 실제로 "배송완료"/"배송중"/"주문접수" 한글 문자열과
정확히 일치하는지 불명확. 값이 다르면 프론트 상태 배지 색상이 전부 틀어짐(현재는 불일치
시 "주문접수"로 폴백 처리해둠).

### 2.3 `Item` 공용 스키마의 `name` 필드 의미 확인

`GET /api/search/history`와 `GET /api/users/recent-products`가 동일한 제네릭 타입
`{productId, name, imageUrl, price}`를 재사용 중. 검색 기록 쪽 `name`이 실제로 검색
키워드 문자열이 맞는지, 상품명과 혼용되는 건 아닌지 확인 필요.

### 2.4 Swagger `summary` 필드 채워주세요

대부분의 엔드포인트에 `summary`가 비어 있어 API 목적을 코드/응답 스키마만 보고 추측해야
했음. 문서화 개선 요청.
