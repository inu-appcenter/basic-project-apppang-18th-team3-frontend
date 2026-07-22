# API 연동 이슈 정리 (8) — UI/UX 점검 7번 항목 수정 중 발견

> `docs/ui-ux-audit.md`의 "7. 마이페이지"를 고치면서 확인한 것.

## 1. 주문 카드의 "로켓배송" 뱃지는 제거함 — 백엔드에 그 데이터가 없어서

- **한 것**: `MyPage.tsx`의 `Order.hasRocket`이 `toOrder()`에서 항상 `false`로 고정돼 있어 절대 렌더링되지
  않던 죽은 코드였다. 카드 클릭 이동은 이미 1번 항목 작업 때 붙여놨어서, 이번엔 뱃지 자체를 지웠다.
- **왜 값을 못 채우고 지웠나**: 이 뱃지가 보여주려던 정보(이 주문이 로켓배송 상품인지)는
  `OrderSummaryResponse`/`OrderItemInfo`(`src/types/mypage.ts`) 어디에도 없다. 로켓배송 여부는
  `ProductItemResponse.rocketDelivery`/`ProductDetailResponse.rocketDelivery`처럼 **상품** 응답에만 있고,
  **주문** 응답에는 없다.
- **필요한 것**: 마이페이지 주문 카드에 로켓배송 뱃지를 다시 넣으려면 둘 중 하나가 필요하다.
  1. 백엔드가 `OrderItemInfo`에 `rocketDelivery` 같은 필드를 추가해주는 것 (권장 — 주문 목록 조회 한 번으로
     끝남).
  2. 또는 프론트가 주문 카드마다 `GET /api/products/:productId`를 추가로 호출해서 알아내는 것 (주문
     카드 개수만큼 N+1 호출이 생겨서 비효율적, `docs/api-integration-issues-2.md`에서 이미 같은 이유로
     보류한 카트 이미지 건과 동일한 트레이드오프).

## 2. PackagePlus 아이콘 제거는 백엔드와 무관 — 그냥 목적 없는 장식이었음

용도를 확인해봤지만 어떤 화면에서도 이 아이콘에 대응하는 액션(재구매 등)이 연결된 적이 없었고, 관련
API도 없다. 백엔드 이슈 아님, 그냥 정리.
