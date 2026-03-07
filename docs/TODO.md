# TODO

이 문서는 `main` 브랜치에서 관리하는 단일 작업 목록입니다.

## 규칙

- 모든 작업은 TODO ID를 먼저 발급한 뒤 시작합니다.
- 하나의 브랜치는 하나의 TODO만 처리합니다.
- 상태 값은 아래 다섯 가지 중 하나만 사용합니다.
- `todo`
- `in-progress`
- `in-review`
- `done`
- `blocked`

## 보드

| ID | Title | Status | Branch | Owner | PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| EDT-013 | Migrate edit state architecture to Zustand store | done | task/EDT-013-zustand-editor-store | codex | - | edit 페이지 상태를 zustand store로 전환하고 controller는 orchestration 중심으로 정리 |
| EDT-012 | Transaction run split and typed edit dialogs | done | main | codex | - | transaction별 Run, 현재 편집 transaction Run, 제어 패널 요소 추가, request/request-group/data 전용 모달 분리 |
| EDT-011 | Edit canvas polish and node interaction refinement | in-progress | task/EDT-011-editor-polish | codex | - | 해상도 대응 레이아웃, 캔버스 대비 개선, hover 액션 UI, 노드 설정 패널, hover 깜빡임 수정, React Flow attribution 검토 |
| EDT-010 | Edit page shell layout and MainContent split | in-progress | task/EDT-010-shell-layout-maincontent | codex | - | layout 기준으로 상단 헤더, 좌측 SNB, 상단 제어패널, 하단 노드 편집 영역을 공백 없이 밀착 배치 |
| EDT-001 | Edit page scaffold baseline | done | task/EDT-001-edit-scaffold | codex | - | 초기 구조, mock repository, mock runner |
| EDT-002 | React Flow canvas scaffold | done | task/EDT-002-reactflow-canvas | codex | - | transaction 분리 캔버스, custom node, 수동 배치 |
| EDT-003 | Node action modal and insertion flow | done | task/EDT-003-node-action-flow | codex | - | inspect, edit, add-after |
| EDT-004 | Transaction isolated canvas and edge control | done | task/EDT-004-transaction-canvas | codex | - | request-group summary node, 사용자 연결 제어 |
| EDT-005 | Canvas hover action buttons and edge validation | done | task/EDT-005-canvas-actions | codex | - | 캔버스 직접 액션, cycle 방지 |
| EDT-006 | Request form validation and error UX | in-review | task/EDT-006-request-validation | codex | - | request 편집 모달 validation 추가 |
| EDT-007 | Save on page leave | todo | - | - | - | beforeunload 저장과 복원 정책 정리 |
| EDT-008 | Request-group detail editor | todo | - | - | - | group 내부 request 일괄 편집 모달 |
| EDT-009 | DTO policy for persisted editor view state | todo | - | - | - | 서버 저장 DTO 경계 정의 |

## 새 작업 추가 템플릿

```md
| EDT-014 | Short task title | todo | - | - | - | Brief acceptance note |
```

## 상태 업데이트 정책

- 브랜치를 만들면 `Status`를 `in-progress`로 바꿉니다.
- PR을 열면 `Status`를 `in-review`로 바꿉니다.
- 머지되면 `Status`를 `done`으로 바꿉니다.
- 진행 불가 사유가 생기면 `Status`를 `blocked`로 바꾸고 `Notes`에 이유를 적습니다.
