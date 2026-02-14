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

### 5) CSS 빌드

```bash
npm run build
```

빌드 결과:
- `dist/app.css` 생성
- `postbuild`로 `app.css` 동기화 및 Font Awesome 로컬 리소스 복사 수행

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
프로젝트는 번들러 없이 동작하는 정적 리소스 구조입니다.
배포용 산출물은 아래 명령으로 `dist/`에 생성됩니다.

```bash
./scripts/build.sh
```

생성 결과:
- `dist/*.html` (예: `login.html`, `main.html`, `chat.html`, `sms.html` 등)
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
