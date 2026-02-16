# FrontendForCs

콜센터 상담 화면용 정적 프론트엔드 프로젝트입니다.  
Nunjucks 템플릿(`src/`)을 HTML(`dist/`)로 렌더링하고, 정적 CSS/JS 자산을 함께 패키징합니다.

## 프로젝트 설명
이 프로젝트는 상담원이 한 화면에서 주요 업무를 빠르게 처리할 수 있도록 구성된 CTI 업무 UI 모음입니다.

- 상담 채널별 화면 제공: `Main`, `Chat`, `SMS`, `Callback`, `PDS`, `Specific`
- 상담 업무 흐름 중심 구성: 고객 정보 확인 → 상담 진행 → 이력/메모 관리
- 정적 템플릿 기반 운영: 복잡한 런타임 프레임워크 없이 빠르게 빌드/배포 가능
- 동적 전환 준비 구조: 페이지/섹션/JS 모듈 분리로 API 연동 확장에 유리

현재는 목업/샘플 데이터 중심 정적 구조이며, 추후 백엔드 API 연동 시
`src/data/*.json`과 페이지별 JS 모듈(`javascript/*`)을 단계적으로 교체하는 방식으로 확장할 수 있습니다.

## 소스 기반과 구성 형식
- 템플릿 기반: `Nunjucks`
  - `src/pages/*.njk`가 페이지 엔트리
  - `src/layouts/base.njk`, `src/layouts/app-shell.njk`로 공통 레이아웃 구성
  - `src/partials/**`를 `include`해 섹션 단위로 조립
- 스타일 기반: `정적 CSS`
  - 공통 스타일: `app.css`, `css/foundation.css`, `css/components.css`
  - 페이지별 스타일: `css/main.css`, `css/chat.css`, `css/sms.css`, `css/callback.css`, `css/pds.css`, `css/specific.css`
  - 컴포넌트 스타일: `css/*-components.css`
- 스크립트 형식: 바닐라 JS 모듈
  - 공통 유틸: `javascript/common/ui.js`
  - 페이지별 로직: `javascript/main/*`, `javascript/sms.js`, `javascript/callback.js` 등
  - DOM 계약은 `data-role`, `data-action`, `data-target` 중심
- 데이터 형식: JSON 샘플 데이터
  - `src/data/*.json`을 `page_data`로 렌더 시 주입
- 최종 배포 형식: 정적 파일
  - `dist/*.html`, `dist/app.css`, `dist/css/*`, `dist/javascript/*`
  - 웹서버(Nginx/정적 서버)로 바로 배포 가능한 구조

## 기술 스택
- Template: `Nunjucks`
- Style: 정적 CSS (`app.css` + `css/*`)
- Script: Vanilla JavaScript (페이지별 모듈)
- Build: Node.js scripts (`scripts/render.mjs`, `scripts/build.sh`)
- Runtime: `nginx:1.27-alpine` (Docker 멀티스테이지)

## 프로젝트 구조
```text
FrontendForCs/
├─ src/
│  ├─ layouts/
│  │  ├─ base.njk
│  │  └─ app-shell.njk
│  ├─ pages/
│  │  ├─ main.njk
│  │  ├─ chat.njk
│  │  ├─ sms.njk
│  │  ├─ callback.njk
│  │  ├─ pds.njk
│  │  ├─ specific.njk
│  │  ├─ login.njk
│  │  ├─ index.njk
│  │  └─ 404.njk
│  ├─ partials/
│  │  ├─ components/sidebar.njk
│  │  ├─ shared/customer-info-main.njk
│  │  └─ pages/*/content.njk + sections/*.njk
│  ├─ data/*.json
│  └─ ...
├─ css/
│  ├─ foundation.css
│  ├─ components.css
│  ├─ *-components.css
│  └─ main.css/chat.css/sms.css/callback.css/pds.css/specific.css/login.css
├─ javascript/
│  ├─ common/ui.js
│  ├─ main/*.js
│  └─ page scripts (chat/sms/callback/pds/specific/login)
├─ scripts/
│  ├─ render.mjs
│  ├─ build.sh
│  └─ check-class-length.mjs
├─ dist/                # 빌드 산출물
├─ app.css              # 공통 스타일(빌드 시 dist/app.css로 복사)
├─ package.json
├─ Dockerfile
└─ docker-compose.yml
```

## 렌더링/빌드 흐름
1. `src/pages/*.njk`를 `scripts/render.mjs`로 렌더링  
2. `app.css`를 `dist/app.css`로 복사  
3. Font Awesome 자산(`vendor/fontawesome`)을 `dist/`에 복사  
4. 정적 디렉터리(`css`, `javascript`, `js`, `design`)가 존재할 경우 `dist/`에 복사

## 실행 방법

### 1) 의존성 설치
```bash
npm install
```

### 2) 템플릿 렌더
```bash
npm run render
```

### 3) CSS 빌드
```bash
npm run build:css
```

### 4) 전체 빌드(권장)
```bash
./scripts/build.sh
```

### 5) 로컬 확인
```bash
python3 -m http.server 4173 --directory dist
```
- `http://localhost:4173/main.html`
- `http://localhost:4173/login.html`

### 6) Docker 실행
```bash
docker compose up --build -d
```
- `http://localhost/main.html`

## npm 스크립트
- `npm run render`: `src/pages/*.njk` -> `dist/*.html`
- `npm run build:css`: `app.css` -> `dist/app.css` 복사
- `npm run copy:fontawesome`: Font Awesome 정적 파일 복사
- `npm run build`: `render + build:css + copy:fontawesome`
- `npm run watch`: Tailwind 제거 안내 메시지 출력(감시 빌드 미사용)
- `npm run check:classes`: 클래스 길이 점검

## 페이지 구성
- `main.html`: 상담 메인 대시보드
- `chat.html`: 채팅 상담
- `sms.html`: SMS 발송
- `callback.html`: 콜백 요청 관리
- `pds.html`: PDS 자동다이얼링
- `specific.html`: 특이사항 등록/승인
- `login.html`: 로그인 화면

## 유지보수 원칙
- `src/**`를 수정하고 `dist/**`는 빌드 결과로 관리
- 페이지별 `content.njk`는 엔트리, 세부 UI는 `sections/*.njk`로 분리
- 공통 레이아웃은 `base.njk` + `app-shell.njk`에서 관리
- 공통 선택자는 `data-role`, `data-action`, `data-target` 계약을 우선 사용
- Tailwind는 현재 사용하지 않으며, 스타일 변경은 `app.css` 및 `css/*`에서 직접 관리

## 동적 웹 전환 준비 포인트
- 샘플 데이터는 `src/data/*.json` 기반으로 분리
- JS는 페이지 단위 모듈 구조(특히 `javascript/main/*`)로 분해
- 템플릿은 section 단위로 분리되어 API 응답 바인딩으로 교체하기 쉬운 구조

## 참고
- 디자인/스타일 가이드: `STYLE_GUIDE.md`
- 추가 디자인 문서: `design/README.md`, `design/sms/README.md`
