# Design Assets

이 폴더는 `login.html`의 디자인 관련 소스를 정리하기 위한 공간입니다.

## 구성
- `design-tokens.css`: 색상/타이포/간격 등 공통 디자인 토큰
- `external-sources.txt`: 외부 디자인 CDN 소스 목록

## 참고
현재 실행 환경에서 외부 CDN 다운로드가 차단(HTTP 403)되어,
원본 CDN 파일은 직접 내려받지 못했습니다. 대신 페이지에서 사용하는 스타일은
`css/login.css`로 로컬 분리하여 동작하도록 정리했습니다.
