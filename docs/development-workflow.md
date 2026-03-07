# Development Workflow

이 문서는 이 저장소에서 `Codex + Git + Slack`으로 작업하는 기본 운영 방식을 정의합니다.

## 목표

- TODO는 `main` 브랜치의 `docs/TODO.md`에서 관리합니다.
- 실제 구현은 TODO 단위 브랜치에서 진행합니다.
- 작업 결과는 커밋, 푸시, PR 기준으로 검토합니다.
- Slack은 Codex 작업 요청과 진행 추적의 진입점으로 사용합니다.

## 브랜치 규칙

브랜치 이름은 아래 형식을 사용합니다.

```text
task/<TODO-ID>-<short-slug>
```

예시:

```text
task/EDT-006-request-validation
task/EDT-007-save-beforeunload
```

- 하나의 브랜치에는 하나의 TODO만 연결합니다.
- 여러 TODO를 한 브랜치에 섞지 않습니다.

## 커밋 규칙

- 커밋 메시지 앞에 TODO ID를 붙입니다.

```text
EDT-006 Add request modal validation
EDT-007 Save editor document on page leave
```

- 커밋 전 최소 검증 기준:
- `pnpm exec tsc --noEmit`
- `pnpm build`

## PR 규칙

- PR 제목에 TODO ID를 포함합니다.

```text
[EDT-006] Add request modal validation
```

- PR 본문에는 아래 내용을 반드시 넣습니다.
- What changed
- Why
- Validation
- TODO status update

## Slack 운영 방식

Slack에서는 아래 형식으로 Codex에 요청합니다.

```text
@Codex
TODO: EDT-006
Branch: task/EDT-006-request-validation
Request:
- request edit modal validation 추가
- docs/TODO.md 상태를 in-review 직전까지 맞출 것
Done when:
- pnpm exec tsc --noEmit 통과
- pnpm build 통과
- commit and push 완료
- PR 생성 또는 PR 준비 상태 정리
```

## Slack 확인 흐름

- 작업 시작: Slack에서 TODO ID와 브랜치를 지정해 Codex에 요청합니다.
- 작업 완료: Codex가 커밋/푸시 결과와 PR 링크를 Slack에 남깁니다.
- 리뷰 요청: Slack에서 merge 준비를 Codex에 다시 요청합니다.
- 머지 후: Slack에서 `docs/TODO.md`를 `done`으로 업데이트하도록 Codex에 요청합니다.

## 추천 Slack 명령 예시

### 1. 작업 시작

```text
@Codex
TODO: EDT-008
Branch: task/EDT-008-request-group-editor
Start this task.
```

### 2. 기존 브랜치 이어서 작업

```text
@Codex
TODO: EDT-008
Branch: task/EDT-008-request-group-editor
Continue work from the current branch state.
```

### 3. 리뷰 준비

```text
@Codex
TODO: EDT-008
Branch: task/EDT-008-request-group-editor
Finish the task, run validation, push commits, and prepare merge review.
```

### 4. 머지 후 TODO 정리

```text
@Codex
TODO: EDT-008
The PR was merged.
Update docs/TODO.md to done on main.
```

## GitHub + Slack 연동 원칙

- Slack의 Codex는 작업 요청 진입점입니다.
- 커밋, PR, 머지 상태 확인은 GitHub Slack 앱 알림을 함께 쓰는 것이 좋습니다.
- 권장 채널:
- `#editor-dev`
- `#editor-review`

## 리뷰 체크리스트

- TODO ID와 브랜치명이 일치하는가
- `docs/TODO.md` 상태가 현재 단계와 맞는가
- `pnpm exec tsc --noEmit`를 통과했는가
- `pnpm build`를 통과했는가
- 구현 범위가 현재 TODO만 다루는가

## main 브랜치 운영 원칙

- `main`에는 직접 기능 커밋을 넣지 않습니다.
- 예외는 아래 두 경우만 허용합니다.
- TODO 문서 업데이트
- 운영 문서 업데이트

## 권장 추가 설정

- GitHub 보호 브랜치에서 `main` 직접 푸시 제한
- GitHub Slack 앱에서 PR/merge 알림 채널 연결
- PR 템플릿에 TODO ID 항목 추가
