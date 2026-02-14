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
