# API 연동 이슈 정리 (3) — UI/UX 점검 2번 항목 수정 중 발견

> `docs/ui-ux-audit.md`의 "2. 메인 페이지"를 고치는 과정에서 새로 발견한 문제. 아이콘 교체(2-1)와 배너 드래그(2-2)는
> `ui-ux-audit.md`에 적힌 대로 프론트에서 해결 완료. 그 작업을 하다가 감사 문서에는 없던 **더 심각한 버그**를 하나
> 발견해서 별도로 기록한다.

## 1. 메인 카테고리 아이콘 메뉴가 실제로는 카테고리 필터링을 하지 않음 (신규 발견, 백엔드 계약 필요)

- **위치**: `src/pages/MainPage.tsx`의 `CATEGORIES` 배열(`path: '/products?category=식품'` 등) → `src/pages/ProductListPage.tsx:172-192`
- **문제**:
  ```ts
  // ProductListPage.tsx
  const categoryId = searchParams.get('categoryId');       // ← 이것만 실제 필터에 쓰임
  const title = searchParams.get('category') ?? keyword ?? '상품'; // ← 화면 제목에만 쓰임
  ...
  getProducts({ categoryId: categoryId ? Number(categoryId) : undefined, ... })
  ```
  메인 페이지의 카테고리 버튼은 `?category=식품`처럼 **라벨 문자열**을 쿼리로 넘기는데, 상품 목록 페이지는
  `categoryId`(숫자) 파라미터만 실제 API 필터로 사용한다. 즉 어떤 카테고리 아이콘을 눌러도 `categoryId`는 항상
  `undefined`가 되어 **필터링이 전혀 걸리지 않고 전체 상품이 그대로 보인다.** 화면 제목만 "식품"으로 바뀌어서
  겉보기에는 정상 동작하는 것처럼 보이는 게 더 문제.
- **왜 프론트만으로 못 고치나**: `CATEGORIES` 배열에는 라벨 텍스트만 있고 실제 `categoryId` 값이 없다.
  `docs/api-integration-issues.md` 2번 표에도 이미 적혀 있듯 `GET /api/categories`는 카테고리 목록이 아니라
  `{productId, name, imageUrl, price}` 형태의 상품 추천 목록을 반환해서, 라벨과 매칭되는 진짜 카테고리 ID를 얻을
  방법이 지금 백엔드엔 없다. 10개 라벨에 임의로 숫자를 붙여 넣는 건 실제 카테고리와 안 맞을 수 있어 하지 않았다.
- **필요한 것**: 백엔드에 "카테고리 이름 ↔ ID" 목록을 내려주는 엔드포인트(또는 기존 `GET /api/categories`를 이 용도에
  맞게 재정의)가 있어야 메인 아이콘 메뉴가 실제로 상품을 필터링하도록 연결할 수 있다.

## 2. 이번 수정 자체는 프론트 전용, 백엔드 영향 없음
- 카테고리 아이콘 lucide-react 아이콘 교체 (2-1): 정적 배열 값만 변경, API 연동 없음.
- 배너 슬라이더 마우스 드래그 지원 (2-2): `onTouchStart/onTouchEnd` → `onPointerDown/onPointerUp`으로 교체해 터치와
  마우스 드래그를 하나의 핸들러로 통합. 배너 데이터(`GET /api/banners`)나 API 계약과는 무관.
