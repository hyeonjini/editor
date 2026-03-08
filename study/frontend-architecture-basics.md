# Frontend Architecture Basics

이 문서는 현재 `edit` 화면 코드를 기준으로 프론트엔드 주요 개념을 이해하기 쉽게 정리한 학습용 메모다.

## 1. state란 무엇인가

`state`는 화면이 현재 기억해야 하는 값이다.  
이 값이 바뀌면 UI도 함께 바뀐다.

예시:

- 현재 선택된 transaction id
- 현재 선택된 node id
- 저장 중인지 여부
- 실행 중인지 여부
- 모달이 열려 있는지 여부
- 입력 폼에 사용자가 작성한 값

정리하면, `state`는 "변할 수 있는 현재 상태값"이다.

## 2. 이 프로젝트에서 state를 쓰는가

당연히 쓴다. 다만 성격에 따라 나눠서 쓴다.

- 페이지 전체가 함께 알아야 하는 상태
- 특정 컴포넌트 안에서만 잠깐 필요한 상태

### 페이지 전체 상태 예시

- 현재 script
- 현재 선택된 transaction
- 현재 선택된 node
- 실행 상태
- 저장 상태
- 캔버스 layout / connection 정보

관련 파일:

- `src/views/edit/model/editor-state.ts`
- `src/views/edit/model/editor-store.ts`
- `src/views/edit/model/use-edit-page-controller.ts`

### 컴포넌트 내부 local state 예시

- 모달 폼의 `name`
- 모달 폼의 `description`
- request 편집 시 `method`, `url`
- data 편집 시 `dataType`, `dataValue`

관련 파일:

- `src/features/edit-node/ui/node-action-dialog.tsx`

## 3. useState와 useReducer 차이

### useState

단순한 상태 하나를 관리할 때 적합하다.

예:

- input 값 하나
- 모달 열림 여부 하나
- 탭 선택 하나

### useReducer

서로 연결된 상태가 많고, 상태 변경 규칙이 복잡할 때 적합하다.

예:

- script가 바뀌면 dirty 상태도 바뀜
- node 선택 시 selected transaction도 연동될 수 있음
- 실행 이벤트가 오면 execution state가 여러 필드와 함께 갱신됨

현재 edit 화면은 여러 상태가 연결되어 있으므로 `useReducer`가 더 자연스럽다.

관련 파일:

- `src/views/edit/model/editor-store.ts`

## 4. hook이란 무엇인가

`hook`은 React에서 상태와 동작을 묶어 재사용하는 함수 방식이다.

React 기본 hook 예시:

- `useState`
- `useEffect`
- `useReducer`
- `useMemo`
- `useRef`

직접 만든 custom hook 예시:

- `src/views/edit/model/use-edit-page-controller.ts`

이 hook은 다음을 묶는다.

- 문서 로드
- autosave
- transaction 실행 / 중지
- 노드 추가 / 삭제 / 수정
- 선택 상태 계산
- UI에 내려줄 props와 handler 정리

즉, `hook`은 계층 이름이라기보다 React 구현 방식이다.  
이 프로젝트에서는 이런 hook을 주로 `model` 쪽에 둔다.

## 5. presentational 컴포넌트란 무엇인가

`presentational component`는 보여주는 역할만 하는 컴포넌트다.

특징:

- props를 받아 렌더링한다
- 직접 fetch를 하지 않는다
- reducer를 직접 만들지 않는다
- 유스케이스 생성이나 비즈니스 orchestration을 직접 하지 않는다

예시:

- `src/views/edit/ui/edit-page-view.tsx`
- `src/views/edit/ui/edit-page-loading.tsx`
- `src/widgets/transaction-snb/ui/transaction-snb.tsx`
- `src/widgets/main-content/ui/editor-control-panel.tsx`

이 컴포넌트들은 "어떻게 보여줄지"에 집중한다.

## 6. controller / container란 무엇인가

`controller` 또는 `container`는 상태와 행동을 연결하는 역할이다.

예시:

- `src/views/edit/model/use-edit-page-controller.ts`

이 파일은:

- 상태를 읽고
- 유스케이스를 실행하고
- 이벤트를 받고
- UI에 필요한 데이터와 handler를 조합한다

즉:

- presentational = 보여주기
- controller = 움직이기

## 7. effect와 memo는 무엇인가

### useEffect

부수 효과를 실행할 때 사용한다.

예:

- 페이지 진입 시 데이터 로드
- 구독 시작 / 해제
- autosave 예약

### useMemo

기존 state로부터 계산된 값을 재사용할 때 사용한다.

예:

- 선택된 transaction 찾기
- transaction 목록을 표시용 데이터로 변환
- 저장용 document 형태 조합

중요한 점:

- `state`는 원본 값
- `memo` 값은 state에서 계산한 파생값

## 8. 이 프로젝트의 레이어를 쉬운 말로 보기

### app

Next.js 라우트 진입점

예:

- `src/app/edit/page.tsx`

### views

페이지 단위 화면 조립

예:

- `src/views/edit/ui/edit-page.tsx`
- `src/views/edit/ui/edit-page-view.tsx`

### widgets

화면에서 덩어리로 보이는 UI 블록

예:

- transaction SNB
- control panel
- editor canvas

관련 예:

- `src/widgets/transaction-snb/ui/transaction-snb.tsx`
- `src/widgets/main-content/ui/editor-control-panel.tsx`
- `src/widgets/editor-canvas/ui/editor-canvas.tsx`

### features

사용자 기능 단위

예:

- 노드 편집
- 문서 저장
- 시뮬레이션 실행

관련 예:

- `src/features/edit-node`
- `src/features/editor-document-save`
- `src/features/simulation-run`

### entities

핵심 도메인 데이터 모델

예:

- script
- transaction
- request node
- execution state

관련 예:

- `src/entities/script`
- `src/entities/execution`

### shared

공용 코드

예:

- 공용 UI
- mock infra
- 공용 모델
- 공용 유틸

관련 예:

- `src/shared/ui`
- `src/shared/infra`

## 9. 현재 edit 화면 구조

```text
/edit
└─ EditRoutePage
   ├─ EditHeader
   └─ EditPage
      ├─ useEditPageController
      ├─ EditPageLoading
      └─ EditPageView
         └─ EditLayout
            ├─ TransactionSnb
            ├─ MainContent
            │  ├─ EditorControlPanel
            │  └─ EditorCanvas
            └─ NodeActionDialog
```

조금 더 자세히 보면:

```text
EditRoutePage
├─ EditHeader
└─ EditPage
   ├─ useEditPageController
   ├─ EditPageLoading
   └─ EditPageView
      ├─ EditLayout
      │  ├─ TransactionSnb
      │  │  └─ StatusBadge
      │  └─ MainContent
      │     ├─ EditorControlPanel
      │     └─ EditorCanvas
      │        ├─ RequestFlowNode
      │        ├─ RequestGroupFlowNode
      │        └─ DataFlowNode
      └─ NodeActionDialog
         ├─ RequestNodeEditSheet
         ├─ RequestGroupNodeEditSheet
         ├─ DataNodeEditSheet
         └─ AppDialog
```

## 10. store란 무엇인가

`store`는 여러 컴포넌트가 함께 써야 하는 상태를 한 곳에 모아 관리하는 방식이다.

예를 들어 아래 값들은 store 후보가 되기 쉽다.

- 현재 script
- 현재 선택 상태
- 실행 상태
- 저장 상태

현재 프로젝트는 아직 별도 전역 store 라이브러리 대신, 페이지 내부에서 `useReducer` 기반으로 화면 상태를 관리하고 있다.

즉 현재 구조는:

- page-level local store 같은 형태
- 전역 store 라이브러리를 아직 도입하지 않은 상태

## 11. Zustand를 여기에 적용할 수 있는가

가능하다. 충분히 적용할 수 있다.

지금 `useEditPageController` 안에 들어 있는 `editorState + dispatch + handler` 구조를
`zustand store`로 옮기면 된다.

예를 들어 store 안으로 옮기기 좋은 것:

- `editorState`
- transaction 선택
- node 선택
- script 업데이트
- execution 이벤트 반영
- save 상태 업데이트

반대로 store에 넣지 않아도 되는 것:

- 모달 폼 입력값
- hover 상태처럼 특정 컴포넌트에서만 잠깐 쓰는 값
- 아주 짧은 UI 내부 임시 값

## 12. Zustand를 적용할 때의 장점

- prop drilling이 줄어든다
- 여러 컴포넌트가 같은 상태를 쉽게 공유할 수 있다
- 다른 프로젝트의 store 스타일과 맞추기 쉽다
- page controller를 더 얇게 만들 수 있다

## 13. Zustand를 적용할 때 주의할 점

- 모든 걸 store에 넣으면 오히려 복잡해진다
- 폼 입력 같은 local state까지 store에 넣으면 과해질 수 있다
- domain 로직과 UI 임시 상태가 한 store에 섞이면 관리가 어려워진다

권장 방향:

- 공유 상태만 store로
- 폼 입력 / 임시 UI 상태는 local state로
- 유스케이스 호출은 store action 또는 controller hook에서 명확히 관리

## 14. 지금 구조를 한 줄로 요약

- `state`는 많이 쓰고 있다
- 작은 state는 local state로 쓴다
- 큰 state는 store로 묶어 쓴다
- `hook`은 상태와 동작을 묶는 React 방식이다
- `presentational`은 보여주기, `controller`는 연결하기 역할이다
- 현재 edit 페이지는 실제로 `zustand store` 기반으로 동작한다

## 15. 현재 구현은 어떻게 Zustand를 쓰고 있는가

현재 edit 페이지는 `useReducer` 기반 구조에서 `zustand store` 구조로 전환되었다.

핵심 파일:

- `src/views/edit/model/editor-store.ts`
- `src/views/edit/model/use-edit-page-controller.ts`

### editor-store.ts 역할

`editor-store.ts`는 두 가지 역할을 가진다.

1. 순수 상태 변경 규칙 보관
2. Zustand store 정의

즉, 예전 reducer 역할을 완전히 버린 것이 아니라,
reducer 성격의 순수 함수는 유지하고 store 안에서 재사용한다.

이 방식의 장점:

- 상태 변경 규칙이 한 곳에 남는다
- 테스트하기 쉽다
- store 구현과 상태 전이 규칙을 분리할 수 있다

### useEditPageController 역할

`useEditPageController`는 이제 상태 저장소 역할보다 orchestration 역할에 더 집중한다.

예:

- 문서 로드
- autosave 예약
- 시뮬레이션 시작 / 중지
- 구독 시작 / 해제
- 노드 추가 / 삭제 / 편집 흐름 연결

즉:

- 상태 저장 = Zustand store
- 비동기 흐름 orchestration = controller hook

이렇게 책임이 갈린다.

## 16. 왜 모든 state를 store에 넣지 않는가

이 부분이 중요하다.

store는 강력하지만, 모든 state를 store로 보내면 오히려 복잡해질 수 있다.

### store에 넣기 좋은 것

- 현재 script
- 현재 선택된 transaction / node
- execution 상태
- save 상태
- canvas layout / connections

이 값들은 여러 컴포넌트가 함께 알아야 한다.

### local state로 남기는 것이 좋은 것

- 노드 편집 모달 input 값
- 일시적인 폼 검증 상태
- 특정 컴포넌트 내부에서만 쓰는 select 값
- hover처럼 매우 짧고 국소적인 UI 상태

이 값들은 굳이 전역 공유할 필요가 없다.

정리하면:

- 여러 곳에서 같이 쓰는 값 = store
- 한 컴포넌트 안에서만 잠깐 쓰는 값 = local state

## 17. 현재 edit 페이지 흐름을 Zustand 기준으로 다시 보기

```text
EditPage
└─ useEditPageController
   ├─ useEditorStore()로 상태 조회
   ├─ useEditorStore() action 호출
   ├─ 문서 load / save orchestration
   ├─ simulation subscribe / unsubscribe
   └─ EditPageView에 props 전달
```

실제 역할 분해:

- `useEditorStore`
  상태 저장소
- `reduceEditorState`
  상태 변경 규칙
- `useEditPageController`
  비동기 흐름과 유스케이스 연결
- `EditPageView`
  화면 렌더링

## 18. Zustand를 쓸 때의 실무적 장점

현재 구조에서 Zustand를 쓰면 다음 장점이 있다.

- 페이지 내부 state 관리가 명시적이다
- 다른 프로젝트의 store 패턴과 맞추기 쉽다
- 상태 접근이 단순해진다
- reducer + dispatch만 아는 구조보다 UI 연결이 간결해진다
- 이후 서버 연동 시 store action 또는 controller에서 확장하기 쉽다

## 19. 앞으로 더 개선할 수 있는 방향

현재 구조도 프로덕션 수준으로 사용할 수 있지만, 더 다듬을 수 있는 방향은 있다.

- store selector를 더 세분화해 불필요한 렌더를 줄이기
- async action 일부를 store 바깥 service로 더 분리하기
- store 테스트 추가
- persist / devtools 미들웨어 적용 여부 검토

다만 지금 단계에서는 과도한 전역화보다
"공유 상태만 store로, UI 임시 상태는 local로" 유지하는 것이 더 건강한 구조다.
