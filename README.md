# FrontendForCs

정적 HTML 페이지 모음 프로젝트입니다.

## 프로젝트 개요
- 런타임은 **정적 파일 서빙**만으로 동작합니다.
- 외부 CDN(Tailwind CDN/Google Fonts/cdnjs) 없이 동작하도록 구성되어 있습니다.
- 배포 시 `dist/` 폴더만 복사해도 실행 가능하도록 맞춰져 있습니다.

---

## 폐쇄망(외부 인터넷 차단) 환경 가이드

> 전제
> - 외부 인터넷 접근 불가
> - 사내 Nexus(NPM registry)만 접근 가능
> - 인증 방식: Nexus ID/PW

### 1) Nexus 인증 환경변수 설정

```bash
export NEXUS_USERNAME='사번또는ID'
export NEXUS_PASSWORD='비밀번호'
```

### 2) npm auth(_auth) 값 생성

```bash
echo -n "$NEXUS_USERNAME:$NEXUS_PASSWORD" | base64
export NPM_CONFIG__AUTH="$(echo -n "$NEXUS_USERNAME:$NEXUS_PASSWORD" | base64)"
```

### 3) `.npmrc` 확인
레포 루트 `.npmrc`는 아래 정책을 전제로 합니다.

```ini
registry=https://<NEXUS_REGISTRY_URL>/repository/npm-group/
always-auth=true
email=unused@example.com
@company:registry=https://<NEXUS_REGISTRY_URL>/repository/npm-group/
```

> `<NEXUS_REGISTRY_URL>`은 실제 사내 Nexus 주소로 교체하세요.

### 4) 패키지 설치

```bash
npm install
# 또는 lockfile을 운영할 경우
npm ci
```

### 5) 정적 산출물 빌드

```bash
npm run build
```

빌드 결과:
- `src/pages/*.njk`가 `dist/*.html`로 렌더링
- `dist/app.css` 생성

전체 배포 산출물(`dist/css`, `dist/javascript`, `dist/design`, `dist/vendor`)까지 포함하려면 아래 명령을 사용하세요.

```bash
./scripts/build.sh
```

### 6) 실행 확인 (정적 서버)

```bash
python3 -m http.server 4173 --directory dist
```

브라우저 접속:
- `http://localhost:4173/main.html`
- `http://localhost:4173/login.html`

---

## 외부 네트워크 요청 0개 점검 체크리스트

아래 명령 결과에 CDN URL 매치가 없어야 합니다.

```bash
rg -n "cdn.tailwindcss|fonts.googleapis|fonts.gstatic|cdnjs|https?://" \
  *.html dist/*.html css/*.css dist/css/*.css src/*.html src/*.css
```

추가 확인 포인트:
- 모든 페이지 `<head>`는 1개만 존재
- `dist/index.html`은 `./app.css`를 로드
- Google Fonts 대신 시스템 폰트 스택 사용
- `dist/`만 복사해도 페이지 진입 가능

---

## Build
프로젝트는 번들러 없이 동작하는 정적 리소스 구조이며, HTML은 템플릿 렌더링으로 `dist/`에 생성합니다.

### 템플릿 구조
- `src/layouts/`: 공통 레이아웃(`base.njk`, `app-shell.njk`)
- `src/partials/`: 공통 UI 조각(사이드바, 로그인 폼/푸터, 페이지별 콘텐츠 분리)
- `src/pages/`: 페이지 엔트리 템플릿(`*.njk` → `dist/*.html`)
- `scripts/render.mjs`: `src/pages/*.njk`를 정적 HTML로 렌더링

### 명령어
```bash
npm install
npm run render      # pages -> dist/*.html
npm run build       # render + dist/app.css 생성
./scripts/build.sh  # render -> css/fontawesome -> assets(css/javascript/design) 복사
```

생성 결과:
- `dist/*.html` (예: `login.html`, `main.html`, `chat.html`, `sms.html` 등)
- `dist/app.css`
- `dist/vendor/fontawesome/`
- `dist/css/`
- `dist/javascript/`
- `dist/design/`

## 로컬 소스 반영하기
원격 저장소에 반영된 변경사항은 자동으로 로컬에 내려오지 않습니다.
아래 순서로 동기화한 뒤 빌드하세요.

```bash
git checkout main
git pull origin main
./scripts/build.sh
```

브랜치가 `work`라면 필요 시 `git checkout work && git pull origin work`로 동일하게 반영할 수 있습니다.

## 로컬에서 바로 확인하기
빌드 후 간단한 정적 서버로 확인할 수 있습니다.

```bash
./scripts/build.sh
python3 -m http.server 4173 --directory dist
```

브라우저에서 `http://localhost:4173/main.html` 또는 `http://localhost:4173/login.html`에 접속하세요.

## 리눅스 서버 배포 (Docker + Nginx)
이 프로젝트는 정적 리소스(`dist/`)를 서빙하는 구조이므로 Docker로 배포하는 방식이 가장 빠르고 단순합니다.

### 1) Dockerfile
레포 루트의 `Dockerfile`을 사용합니다.

```dockerfile
# 1) build stage
FROM alpine:3.20 AS build
WORKDIR /app
COPY . .
RUN sh ./scripts/build.sh

# 2) runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2) 이미지 빌드

```bash
docker build -t frontend-for-cs:latest .
```

### 3) 컨테이너 실행 (docker run)

```bash
docker run -d \
  --name frontend-for-cs \
  -p 80:80 \
  --restart unless-stopped \
  frontend-for-cs:latest
```

브라우저에서 `http://<서버IP>/main.html` 또는 `http://<서버IP>/login.html`로 확인하세요.

### 4) docker-compose로 실행
레포 루트의 `docker-compose.yml`을 사용하면 동일한 설정으로 더 간단하게 실행/재시작할 수 있습니다.

```bash
docker compose up -d --build
```

중지/정리:

```bash
docker compose down
```

로그 확인:

```bash
docker compose logs -f
```

### 5) 운영 서버 반영 절차 (권장)
일반적으로는 아래 순서가 안전합니다.

1. CI 또는 로컬에서 이미지 빌드
2. 레지스트리에 push
3. 서버에서 pull 후 교체 실행

```bash
# 빌드/배포 환경
docker build -t your-registry/frontend-for-cs:2026-02-14 .
docker push your-registry/frontend-for-cs:2026-02-14

# 운영 서버
docker pull your-registry/frontend-for-cs:2026-02-14
docker rm -f frontend-for-cs || true
docker run -d \
  --name frontend-for-cs \
  -p 80:80 \
  --restart unless-stopped \
  your-registry/frontend-for-cs:2026-02-14
```

---

## 정적 웹에서 동적 웹으로 전환 가이드

현재 구조는 `dist/` 정적 리소스를 Nginx로 서빙하는 방식입니다. 동적 웹으로 전환할 때는 **전면 교체보다 단계적 전환(BFF/API 추가)** 을 권장합니다.

### 1) 전환 목표 정의
- 사용자별 화면/권한 제어
- DB 기반 실시간 데이터 조회
- 관리자에서 콘텐츠를 수정하면 즉시 반영

### 2) 아키텍처 선택
- **권장**: 프론트(현재 정적) + 백엔드 API 분리
  - 프론트: 기존 HTML/CSS/JS 유지, API 호출 추가
  - 백엔드: 인증/인가, 비즈니스 로직, DB 접근 담당
- 대안: SSR(서버 렌더링) 프레임워크로 재구성(초기 마이그레이션 비용 큼)

### 3) 최소 전환 순서 (리스크 낮은 방식)
1. 인증 API 도입(로그인/세션 또는 JWT)
2. 사용자 정보 API 도입(`/api/me`)
3. 화면별 데이터 API 도입(예: 상담 목록, 콜백 상태)
4. 기존 정적 JS에서 API 연동(fetch/axios)
5. 관리자성 데이터(공지/문구)부터 CMS성 CRUD 제공

### 4) 백엔드에서 먼저 가져가야 하는 책임
- 인증/인가(권한 체크)
- 민감정보 처리(비밀번호, 토큰, 개인정보)
- 감사 로그/접근 로그
- 입력 검증/비즈니스 규칙

### 5) 프론트 코드 변경 체크리스트
- 하드코딩 데이터 제거 후 API 응답으로 렌더링
- 로딩/빈 상태/에러 상태 UI 추가
- 토큰 만료 처리(재로그인 유도)
- API 실패 재시도/사용자 메시지 표준화

### 6) 배포 구조 예시
- 프론트 컨테이너(Nginx): 정적 리소스 서빙
- 백엔드 컨테이너(Node/Spring 등): `/api/*`
- 리버스 프록시(Nginx/Ingress):
  - `/` → 프론트
  - `/api` → 백엔드

### 7) 전환 시 흔한 실수
- 프론트에 권한 로직만 두고 서버 검증 생략
- API 에러 스펙 미정의(화면별 예외 처리 지옥)
- CORS/쿠키 정책(SameSite, Secure) 미정리

### 8) 빠른 시작 템플릿(예시)
```text
Phase 1 (1~2주): 로그인 + /api/me + 메인 대시보드 데이터 API
Phase 2 (2~4주): 상담/콜백/문자 기능 API화 + 권한체계 정리
Phase 3 (지속): 관리자 화면, 감사로그, 모니터링/알림 체계
```

필요하다면 현재 파일 구조(`main.html`, `login.html`, `javascript/*.js`) 기준으로 어떤 API부터 붙일지 상세 전환안까지 작성할 수 있습니다.
