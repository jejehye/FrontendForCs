# FrontendForCs

정적 HTML 페이지 모음 프로젝트입니다.

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
