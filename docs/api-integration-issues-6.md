# API 연동 이슈 정리 (6) — UI/UX 점검 5번 항목 수정 중 발견

> `docs/ui-ux-audit.md`의 "5. 배송지 관리"를 고치면서 확인한 것. 이번 건 대부분 백엔드가 이미 준비돼 있었는데
> 프론트가 안 쓰고 있던 경우라, 앞선 문서들과 결이 조금 다르다.

## 1. (정정) 5-1 주소 분리는 백엔드 제약이 아니라 프론트 버그였음

`docs/ui-ux-audit.md` 작성 당시엔 "백엔드에 상세주소 구조가 없어서"로 추정했는데, 실제로
`AddressResponse`/`AddressRequest` 타입을 보니 처음부터 `zipcode`/`address`/`detailAddress`가 분리된 필드로
정의돼 있었다.

```ts
// src/types/address.ts (기존 그대로)
export interface AddressRequest {
  zipcode: string;
  address: string;
  detailAddress: string;
  ...
}
```

`AddressFormPage.tsx`가 입력창 하나(`address`)에 전체 주소를 다 받아서 `detailAddress: ''`로 항상 빈 값을
보내던 것뿐이었다. 이번에 주소를 "도로명 주소" / "상세 주소" 두 입력으로 분리하고, 편집 진입 시에도 두 필드를
각각 채우도록 고쳐서 백엔드 스키마와 맞게 저장되게 했다. **백엔드 작업 불필요, 이미 다 준비돼 있었음.**

남은 한 가지: `zipcode`는 여전히 빈 문자열로 저장된다. 진짜 우편번호를 받으려면 다음(Daum) 우편번호 검색
같은 외부 스크립트를 새로 불러와야 하는데, `CLAUDE.md`의 "새로운 라이브러리는 허가 없이 설치하지 않는다"
원칙에 걸려서 이번엔 손대지 않았다. 필요하면 사용자 승인 받고 별도로 진행하는 게 맞다.

## 2. (정정) 5-3 배송지 삭제도 백엔드는 이미 준비돼 있었음

`src/api/address.ts`에 `deleteAddress(addressId)`가 이미 구현돼 있었는데(`DELETE /api/addresses/:id`),
어느 페이지에서도 호출하지 않고 있었다. `AddressListPage.tsx`에 삭제 버튼 + 확인 모달만 새로 붙이면
됐다. 확인 모달은 `CartPage.tsx`에 있던 로컬 컴포넌트를 `src/components/ConfirmModal.tsx`로 분리해서
장바구니/배송지 양쪽에서 재사용하도록 정리했다(2곳 이상에서 쓰면 `components/`로 분리한다는 프로젝트
컨벤션에 맞춤).

## 3. 검증하지 못한 부분 (실 데이터로 테스트 필요)

- **기본배송지를 삭제하면 어떻게 되나**: `DELETE /api/addresses/:id`가 기본배송지(`isDefault: true`)를
  지울 때 다른 주소를 자동으로 기본으로 승격시키는지, 아니면 그냥 지워서 기본배송지가 없는 상태가 되는지
  확인 못했다. 후자라면 `CheckoutPage.tsx`의 `list.find((a) => a.isDefault) ?? list[0]` 로직이 처리하긴
  하지만, 실제 백엔드 동작을 봐야 확실하다.
- **결제 진행 중 선택된 배송지를 지우면**: `useCheckoutStore`의 `addressId`가 방금 삭제한 주소를 계속
  들고 있을 수 있는 시나리오(배송지 관리 화면과 결제 화면을 오가는 경우)는 이번에 테스트하지 않았다.
