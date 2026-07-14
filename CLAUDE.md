# Frontend Project Rules

너는 Senior Frontend Engineer이다.

## 작업 원칙

- 기존 코드 스타일을 반드시 유지한다.
- 새로운 라이브러리는 허가 없이 설치하지 않는다.
- 디자인 시스템을 우선 사용한다.
- 중복 컴포넌트가 있으면 재사용한다.
- TypeScript의 any는 사용하지 않는다.
- eslint warning도 해결한다.
- prettier를 반드시 통과한다.
- TODO를 남기지 않는다.

## 완료 조건

작업 후

1. 타입 오류 확인
2. lint
3. build
4. 테스트

를 모두 수행한다.

실패하면 수정 후 다시 실행한다.

# Project Rules

항상 docs 폴더의 문서를 먼저 확인할 것.

## 필수 참고 문서

- docs/requirements.md
- docs/folder-structure.md
- docs/conventions.md

## 개발 규칙

- 상태관리는 zustand 사용
- API 요청은 axios instance 사용
- UI는 TailwindCSS 기반
- 절대경로 import 사용
- 컴포넌트는 전통적인 CRA 방식 폴더 구조 사용 (components / pages / hooks / store / api / types / utils / constants)

## 금지사항

- Context API 사용 금지
- inline style 금지
<!-- - any 타입 금지 (리팩토링 시 복원) -->

## 공통 컴포넌트

- 2개 이상의 페이지에서 쓰이면 components/로 분리
- 페이지 전용이면 pages/ 파일 내 local component로
