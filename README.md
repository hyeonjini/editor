# Editor Page

HTTP 부하 테스트 스크립트를 시각적으로 작성, 편집, 저장, 실행하기 위한 Next.js 기반 에디터 프로젝트입니다.

## 현재 범위

- `edit` 페이지 중심 구현
- React Flow 기반 노드 캔버스
- mock repository / mock runner 기반 저장 및 실행 흐름
- 이후 실제 서버 API, WebSocket 실행기로 교체 가능한 구조 유지

## 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000/edit`를 열면 현재 편집 화면을 확인할 수 있습니다.

## 검증

```bash
pnpm exec tsc --noEmit
pnpm build
```

## 주요 문서

- `docs/TODO.md`: 메인 브랜치 기준 작업 목록과 상태 관리 문서
- `docs/development-workflow.md`: 브랜치, 커밋, PR, Slack 연동 운영 규칙
- `docs/domain-model.md`: 스크립트 도메인 모델 기준
- `docs/execution-architecture.md`: 실행 계층 아키텍처 기준

## 작업 원칙

- App Router + `src` 디렉터리 기반 구성
- UI와 저장/실행 계층 분리
- 도메인 모델과 React Flow view model 분리
- mock 구현이라도 실제 서버 연동으로 쉽게 교체 가능해야 함
