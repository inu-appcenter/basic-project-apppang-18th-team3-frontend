# 백엔드 전달용 - 스웨거 스키마 불일치 2건 (2026-07-28)

`docs/issues/api-swagger-sync-2026-07-27.md` 재동기화 작업 중 발견, 프론트에서 우회 처리했지만 백엔드 쪽 수정이 안전한 항목만 정리.

## 1. `items` 배열 원소 스키마가 하나로 뭉개짐

`RecentProductResponse`, `SearchHistoryListResponse`, `CategoryResponse` 세 스키마의 `items` 배열 원소가 스웨거 컴포넌트 스키마상 전부 동일한 `Item`(`{categoryId, name, iconUrl}`) 하나로 선언되어 있음.

- 실제 example 값은 각기 다름
  - 최근 본 상품: `{productId, name, imageUrl, price}`
  - 검색 기록: `{keyword, searchedAt}`
- 추정 원인: 백엔드에 같은 이름의 내부 DTO 클래스가 여러 개 있어 springdoc이 스키마를 덮어쓴 것으로 보임
- 요청 사항: DTO 클래스명을 구분해서 스웨거 스키마가 실제 응답과 일치하도록 수정 필요 (스키마 기반 코드 생성 도구 사용 시 문제됨)
- 프론트 조치: example 값 기준으로 타입 맞춰서 우회 완료, 백엔드 수정 시 별도 프론트 대응 불필요

## 2. 배열 응답인데 스키마는 단일 객체로 선언됨

`GET /api/addresses`, `/api/banners`, `/api/orders`, `/api/wishlist` 응답 스키마가 배열이 아니라 단일 객체로 선언되어 있음 (example만 배열, 설명엔 "없으면 빈 배열"이라 명시).

- 실제 응답은 배열이 맞아 보임
- 요청 사항: 스키마 선언을 배열 타입으로 수정 필요
- 프론트 조치: 현재도 배열로 정상 파싱 중, 영향 없음 (스키마 문서 정확도 문제)

## 참고

- 원본 대조 대상: https://apppang.shop/swagger-ui/index.html (`/v3/api-docs`)
- 백엔드 레포: `inu-appcenter/basic-project-apppang-18th-team3-backend`
- 이슈 등록은 사용자가 직접 진행 (GitHub 인증 필요)
