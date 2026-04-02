# Dugout Note

모바일 우선 야구 다이어리 + KBO 순위판 버전입니다.

## 포함 기능
- 마이팀 설정
- KBO 일자별 팀 순위 불러오기
- 오늘의 기록 작성
- GPT 욕 순화 기능 (`OPENAI_API_KEY` 필요)

## Vercel 환경변수
- `OPENAI_API_KEY`

## 폴더 구조
- `index.html`
- `styles.css`
- `app.js`
- `api/standings.js`
- `api/soften.js`
- `fonts/` (선택)

## 폰트
Pretendard CDN을 기본으로 사용합니다.
원하면 `fonts/`에 직접 폰트 파일을 넣어 CSS를 바꿔서 사용할 수 있습니다.
