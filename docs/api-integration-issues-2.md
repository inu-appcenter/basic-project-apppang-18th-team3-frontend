# API 연동 이슈 정리 (2) — UI/UX 점검 1번 항목 수정 중 발견

> `docs/ui-ux-audit.md`의 "1. 전역 공통 이슈"를 고치는 과정에서 새로 확인된 백엔드 계약 문제/미검증 항목을 정리.
> 기존 `docs/api-integration-issues.md`(전 페이지 최초 연동 작업 기록)와는 별개로, 이번 수정 작업 범위에서 발견한 것만 남김.

## 1. 백엔드 응답 스키마 문제 (프론트에서 수정 불가, 백엔드 확장 필요)

### 1.1 장바구니/주문 응답에 상품 이미지 필드가 없음

```ts
// src/types/cart.ts
export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
} // imageUrl 없음

// src/types/mypage.ts
export interface OrderItemInfo {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  status: string;
} // imageUrl 없음, 주문내역/주문상세/마이페이지 최근주문에서 공용으로 씀
```

`ui-ux-audit.md` 1-1에서는 "상품 이미지가 회색 박스로만 표시된다"를 전역 문제로 지적했는데, 실제로 고쳐보니 원인이 페이지마다 다름:

- **`ProductListPage`**: `ProductItemResponse.imageUrl`이 응답에 있는데 프론트가 안 쓰고 있었음 → 이번에 실제 `<img>`로 교체 완료 (프론트 버그, 해결됨).
- **장바구니 / 주문내역 / 주문상세 / 마이페이지**: 위 스키마처럼 응답 자체에 이미지 필드가 없음 → 프론트 수정으로 해결 불가능. 손대지 않고 회색 박스 유지.

**임시 우회 방법(적용 안 함)**: 아이템마다 `GET /api/products/:productId`를 추가 호출해서 이미지만 뽑아오는 방법이 있으나, 장바구니/주문 목록 길이만큼 N+1 호출이 생겨 리스트가 길어지면 성능이 나빠짐. 우회보다는 **백엔드에서 `CartItemResponse`/`OrderItemInfo`에 `imageUrl` 필드를 추가**하는 쪽을 권장.

## 2. 검증하지 못한 부분

### 2.1 리뷰 "더보기" 페이지네이션 (`ProductDetailPage`)

이번에 죽은 버튼이던 리뷰 "전체보기"/"리뷰 전체보기" 두 개를 하나의 "리뷰 더보기"로 합치면서, `GET /api/products/:id/reviews`에 `page` 파라미터를 올려 다음 페이지를 이어붙이는 로직을 새로 넣었음.

문제는 `docs/api-integration-issues.md` 1.1에 이미 나와 있듯 **상품 DB가 비어 있어** 실제 서버 데이터로:
- `page` 파라미터가 진짜 다음 페이지를 반환하는지
- `ReviewListResponse.total`이 실제 전체 리뷰 개수를 의미하는지 (더보기 버튼 숨김 조건 `reviews.length < total`의 기준값)

둘 다 확인하지 못했다. Swagger 스키마상 필드 존재만 보고 관례대로 구현한 상태라, 상품 데이터가 채워진 뒤 리뷰가 여러 페이지 있는 상품으로 재검증 필요.

## 3. 기능 자체가 없어 "준비 중" 안내로만 처리한 항목 (백엔드 버그 아님, 추후 실제 구현 필요)

| 위치 | 항목 | 실제로 만들려면 필요한 것 |
|---|---|---|
| 로그인 | 아이디·비밀번호 찾기 | 별도 API(이메일 인증/재설정) + 전용 페이지 |
| 로그인 | 사업자 회원 가입 | 사업자 전용 가입 플로우 + 역할 구분 필드 |
| 회원가입 | 약관 "상세보기" | 약관 전문 콘텐츠(현재 프론트/백엔드 어디에도 원문 없음) + 모달 또는 별도 페이지 |
| 상품상세 | "브랜드 상품 모아보기" | `GET /api/products`에 `brand` 필터 파라미터 추가 (현재 `categoryId`/`keyword`만 지원) |

이 네 가지는 `docs/requirements.md` 페이지 범위표에도 없던 항목이라, 이번엔 클릭 시 "준비 중인 기능입니다" 토스트만 붙여 죽은 버튼(클릭해도 무반응)만 없앴음. 실제 기능으로 만들려면 위 표의 선행 작업이 필요.
