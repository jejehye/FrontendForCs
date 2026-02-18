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
│  ├─ common/api.js
│  ├─ common/page-module.js
│  ├─ main/*.js
│  └─ page scripts (chat/sms/callback/pds/specific/login)
├─ nginx/
│  ├─ default.conf
│  └─ app-config.template.js
├─ docker-entrypoint.d/
│  └─ 40-env-app-config.sh
├─ scripts/
│  ├─ render.mjs
│  ├─ build.sh
│  └─ check-class-length.mjs
├─ dist/                # 빌드 산출물
├─ app-config.js        # 기본 앱 런타임 설정(USE_MOCK, endpoint 기본값)
├─ app.css              # 공통 스타일(빌드 시 dist/app.css로 복사)
├─ package.json
├─ Dockerfile
└─ docker-compose.yml
```

## 렌더링/빌드 흐름
1. `src/pages/*.njk`를 `scripts/render.mjs`로 렌더링  
2. `app.css`를 `dist/app.css`로 복사  
3. Font Awesome 자산(`vendor/fontawesome`)을 `dist/`에 복사  
4. 정적 디렉터리(`css`, `javascript`)가 존재할 경우 `dist/`에 복사

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
- `http://localhost:4173/main`
- `http://localhost:4173/login`

주의:
- 기본 레이아웃에서 `.html -> 확장자 없는 경로`로 canonical redirect를 수행합니다.
- 따라서 로컬 정적 서버 사용 시에도 `/main`, `/login`으로 접속하는 것을 권장합니다.

### 6) Docker 실행
```bash
docker compose up --build -d
```
- `http://localhost/main`
- `http://localhost/login`

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

## API 엔드포인트 주입 방식
정적 리소스는 그대로 배포하고, 데이터만 API(AJAX/fetch)로 조회하는 방식을 권장합니다.

- 공통 호출 유틸: `javascript/common/api.js` (`window.AppApi.fetchJson`)
- 페이지별 우선 엔드포인트:
  - `main`: `window.__APP_ENDPOINTS__.mainData` (기본: `/api/main`)
  - `chat`: `window.__APP_ENDPOINTS__.chatData` (기본: `/api/chat`)
  - `pds`: `window.__APP_ENDPOINTS__.pdsData` (기본: `/api/pds`)
  - `sms`: `window.__APP_ENDPOINTS__.smsData` (기본: `/api/sms`)
  - `callback`: `window.__APP_ENDPOINTS__.callbackData` (기본: `/api/callback`)
  - `specific`: `window.__APP_ENDPOINTS__.specificData` (기본: `/api/specific`)
  - `main 전송`: `mainTransferHts`, `mainTransferGoldnet`
- API 실패 시: 페이지별 기존 정적 데이터(`page_data`)로 fallback

### 1) 페이지별 개별 URL 주입 (권장)
Docker 런타임에서는 `nginx/app-config.template.js` + 환경변수로 자동 주입됩니다.
필요하면 서버 템플릿에서 직접 전역 객체를 주입할 수도 있습니다.

```html
<script>
  window.__APP_ENDPOINTS__ = {
    mainData: "https://api.example.com/cti/main",
    chatData: "https://api.example.com/cti/chat",
    pdsData: "https://api.example.com/cti/pds",
    callbackData: "https://api.example.com/cti/callback",
    specificData: "https://api.example.com/specific",
    smsData: "https://api.example.com/sms",
    mainTransferHts: "https://api.example.com/cti/main/transfer/hts",
    mainTransferGoldnet: "https://api.example.com/cti/main/transfer/goldnet"
  };
</script>
```

### 2) 공통 Base URL 주입
개별 URL 대신 Base URL만 주입하고, 코드에서 상대 경로(`/api/...`)를 사용합니다.

```html
<script>
  window.APP_API_BASE = "https://api.example.com";
</script>
```

### 다중 엔드포인트 사용 규칙
- 한 페이지에서 endpoint를 여러 개 써도 됨
- `window.__APP_ENDPOINTS__`에 키를 추가하고 JS에서 키로 접근
- 예: `main` 화면에서 조회 API와 전송 API를 키 단위로 분리 호출

## MOCK -> 실데이터 전환 가이드 (`USE_MOCK`)

이 프로젝트는 `USE_MOCK` 스위치로 목데이터/실데이터를 전환합니다.

- `USE_MOCK=true` : `src/data/*.json` 기반 목데이터 사용 (API 호출 스킵)
- `USE_MOCK=false` : 실데이터 API 호출 사용

기본값:
- Docker Compose 기본: `USE_MOCK=true`
- 로컬 정적 파일 기본: `app-config.js`의 `useMock: true`

### 1) Docker에서 실데이터로 전환 (권장)
아래처럼 환경변수를 주입해서 실행합니다.

```bash
USE_MOCK=false \
APP_API_BASE=https://api.example.com \
APP_ENDPOINT_MAIN_DATA=/cti/main \
APP_ENDPOINT_CHAT_DATA=/cti/chat \
APP_ENDPOINT_PDS_DATA=/cti/pds \
APP_ENDPOINT_SMS_DATA=/cti/sms \
APP_ENDPOINT_CALLBACK_DATA=/cti/callback \
APP_ENDPOINT_SPECIFIC_DATA=/cti/specific \
APP_ENDPOINT_MAIN_TRANSFER_HTS=/cti/main/transfer/hts \
APP_ENDPOINT_MAIN_TRANSFER_GOLDNET=/cti/main/transfer/goldnet \
docker compose up -d --build
```

팁:
- 운영에서는 `.env` 파일로 같은 키를 관리하는 방식을 권장
- endpoint를 비워두면 기본값(`/api/...`)을 사용

### 2) 로컬 정적 실행에서 실데이터로 전환
`app-config.js`에서 `useMock`을 `false`로 바꿉니다.

```js
const defaults = {
  useMock: false,
  ...
}
```

그 후 다시 빌드:

```bash
./scripts/build.sh
```

### 3) 전환 확인 방법
브라우저 콘솔에서 아래를 확인합니다.

```js
window.USE_MOCK
window.__APP_ENDPOINTS__
window.APP_API_BASE
```

- `window.USE_MOCK === false` 이면 실데이터 모드
- API 응답 실패 시 페이지별 fallback 로그가 콘솔에 출력될 수 있음

### 4) 자주 발생하는 실수
- `docker compose up -d`만 실행해서 예전 이미지가 계속 실행됨  
  -> 반드시 `--build` 포함
- 브라우저 캐시로 이전 `app-config.js`가 남아 있음  
  -> 강력 새로고침(`Cmd+Shift+R`) 또는 캐시 삭제
- `APP_API_BASE`/endpoint 오타로 404 발생  
  -> 네트워크 탭에서 실제 요청 URL 확인

## 참고
- 디자인/스타일 가이드: `STYLE_GUIDE.md`
