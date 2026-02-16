# CSS Style Guide

## 목적
- Tailwind 없이 정적 CSS(`app.css`, `css/*`)만으로 유지보수 가능한 구조를 유지한다.
- 화면 변경 시 영향 범위를 최소화한다.

## 기본 원칙
- 인라인 스타일(`style=""`) 사용 금지.
- 의미 없는 클래스명(`sem-u-*` 등) 신규 추가 금지.
- 같은 스타일이 2회 이상 반복되면 공통 클래스로 추출.
- `dist/**`는 빌드 산출물로 간주하고 직접 수정하지 않는다.

## 네이밍 규칙
- 공통 UI: `ui-*`
- 페이지/기능 스코프: `main-*`, `chat-*`, `sms-*`, `callback-*`, `pds-*`, `specific-*`
- 상태/변형: `is-*`, `has-*`, `*-active`, `*-disabled`
- 버튼 계층:
  - 기본 액션: `btn-primary`
  - 보조 액션: `btn-secondary`
  - 위험 액션: `btn-danger`

## 파일 책임 분리
- `app.css`: 전역 변수, 기본 리셋, 공통 토큰
- `css/foundation.css`: 기본 레이아웃/타이포 공통 규칙
- `css/components.css`: 공통 컴포넌트(버튼, 테이블, 배지, 폼)
- `css/*-components.css`: 페이지별 컴포넌트 상세 스타일
- `css/main.css`, `css/chat.css` 등: 페이지 엔트리(필요 컴포넌트 import)

## 작업 절차
1. 먼저 공통 클래스가 있는지 확인한다.
2. 없으면 해당 페이지 `*-components.css`에 추가한다.
3. 여러 페이지에서 재사용되면 `css/components.css`로 승격한다.
4. 템플릿(`src/partials/**`)에는 의미 클래스만 붙인다.

## 점검 체크리스트
- 클래스명만 보고 역할을 이해할 수 있는가
- 버튼/헤더/테이블 스타일이 페이지 간 일관적인가
- 동일한 CSS 선언이 다른 파일에 중복되어 있지 않은가
- 빌드(`./scripts/build.sh`) 후 `dist` 결과가 정상 렌더링되는가
