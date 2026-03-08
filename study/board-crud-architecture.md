# Board CRUD Architecture Study

이 문서는 `/board` 예제를 기준으로 현재 프로젝트의 CRUD 아키텍처와 동작 흐름을 학습하기 위한 메모다.

## 1. 목적

`/board` 페이지는 단순한 게시판처럼 보이지만, 실제 목적은 다음 구조를 작게 체험하는 것이다.

`API client -> repository/adapter -> use case -> controller/store -> UI`

즉:

- UI가 데이터를 직접 저장하지 않는다
- controller가 사용자 행동과 use case를 연결한다
- store는 현재 화면 상태를 보관한다
- repository는 데이터를 어디서 가져오고 저장할지 감춘다
- mock과 http 구현을 바꿔 끼울 수 있다

## 2. 라우트 진입점

페이지 진입점:

- `src/app/board/page.tsx`

이 파일은 매우 얇다.

- `/board` 라우트 진입
- 실제 페이지 조립은 `views/board`에 위임

이런 식으로 Next.js `app` 레이어는 엔트리만 담당하게 두는 편이 좋다.

## 3. Entity

게시판의 핵심 데이터 모델은 `BoardPost`다.

관련 파일:

- `src/entities/board-post/model/board-post.ts`
- `src/entities/board-post/lib/board-post-id.ts`

여기서 정의하는 것:

- 게시글 구조
- 생성 입력값 구조
- 상태값(`draft`, `published`)
- ID 생성 규칙

즉 entity는 "이 도메인에서 무엇이 게시글인가"를 정의하는 레이어다.

## 4. API DTO

서버와 통신할 때는 보통 내부 모델을 그대로 쓰지 않고 DTO를 둔다.

관련 파일:

- `src/shared/api/dto/board-post.dto.ts`
- `src/shared/api/dto/board-post-api.dto.ts`

구분:

- `BoardPostDto`
  게시글 단건 직렬화 형태
- `ListBoardPostsResponseDto`
  목록 응답 형태
- `CreateBoardPostRequestDto`
  생성 요청 형태
- `CreateBoardPostResponseDto`
  생성 응답 형태
- `UpdateBoardPostRequestDto`
  수정 요청 형태
- `UpdateBoardPostResponseDto`
  수정 응답 형태

이렇게 request/response를 나눠 두면 나중에 서버 계약이 바뀌어도 영향 범위를 줄일 수 있다.

## 5. Repository Port

CRUD의 핵심 계약은 repository interface다.

관련 파일:

- `src/shared/ports/board-post-repository.port.ts`

여기서 정의하는 것:

- `list`
- `create`
- `update`
- `remove`

중요한 점:

- UI는 mock인지 http인지 모른다
- use case도 구현체를 모른다
- 오직 port만 안다

## 6. Serializer

도메인 모델과 DTO 사이를 오가는 역할이다.

관련 파일:

- `src/shared/ports/board-post-serializer.port.ts`
- `src/shared/infra/serializer/board-post-json.serializer.ts`

역할:

- `BoardPost` -> `BoardPostDto`
- `BoardPostDto` -> `BoardPost`

serializer가 있으면 repository가 DTO 세부 구조를 다 처리해도, 상위 계층은 내부 모델 기준으로 일할 수 있다.

## 7. API Client

가장 아래에서 HTTP 요청을 다루는 공통 계층이다.

관련 파일:

- `src/shared/api/http-client.ts`

역할:

- `fetch` 감싸기
- body 직렬화
- header 세팅
- 공통 에러 처리

여기서는 도메인 의미를 모른다.

- 게시글을 저장하는지
- 스크립트를 저장하는지
- HAR를 가져오는지

전혀 모른다.

그냥 "HTTP 요청"만 책임진다.

## 8. Repository Adapter

port를 실제로 구현하는 계층이다.

관련 파일:

- `src/shared/infra/repository/mock-board-post.repository.ts`
- `src/shared/infra/repository/http-board-post.repository.ts`
- `src/shared/infra/repository/board-post.repository.factory.ts`

### MockBoardPostRepository

역할:

- 메모리 기반 저장소
- 현재 서버가 없어도 CRUD를 보여줄 수 있음

### HttpBoardPostRepository

역할:

- 실제 API endpoint 호출
- DTO request/response 사용
- serializer를 통해 모델 변환

### board-post.repository.factory.ts

역할:

- `mock` 또는 `http` 구현 선택
- controller나 use case 바깥에서 구현체 조립

이 지점이 중요하다.

상위 계층은:

- "어떤 repository를 쓸지" 결정하지 않고
- "이미 선택된 repository"를 받아서 사용한다

## 9. Use Case

게시글 기능은 use case로 쪼개져 있다.

관련 파일:

- `src/features/board-post-crud/model/list-board-posts.usecase.ts`
- `src/features/board-post-crud/model/create-board-post.usecase.ts`
- `src/features/board-post-crud/model/update-board-post.usecase.ts`
- `src/features/board-post-crud/model/delete-board-post.usecase.ts`

역할:

- repository 호출을 기능 단위로 감싼다
- UI가 repository 메서드를 직접 부르지 않게 한다

즉:

- UI는 "생성"을 요청
- use case가 그 의미를 수행

이 단계가 있으면 나중에 생성 전에 validation이나 정책이 붙어도 use case에서 자연스럽게 확장할 수 있다.

## 10. Store

현재 화면 상태는 zustand store에 있다.

관련 파일:

- `src/views/board/model/board-page-store.ts`

store에 들어 있는 상태:

- 게시글 목록
- 현재 선택된 게시글 id
- load 상태
- mutation 상태
- 에러 메시지
- 성공 메시지

store action 예시:

- `loadStarted`
- `loadSucceeded`
- `postSelected`
- `createSucceeded`
- `updateSucceeded`
- `deleteSucceeded`

즉 store는 "현재 화면이 기억해야 하는 값"을 담당한다.

## 11. Controller Hook

실제 orchestration 중심은 controller hook이다.

관련 파일:

- `src/views/board/model/use-board-page-controller.ts`

이 파일이 하는 일:

- 페이지 최초 로드 시 목록 조회
- 현재 선택 게시글 계산
- draft 관리
- create/update/delete 버튼 클릭 흐름 연결
- 성공/실패 시 store action 호출

중요:

- repository 직접 호출은 controller 안에서 하지 않는다
- use case를 통해 호출한다

controller는 다음을 연결한다.

- 사용자 이벤트
- use case
- store 업데이트
- UI props

## 12. UI

UI는 presentational 성격으로 나뉜다.

관련 파일:

- `src/views/board/ui/board-page.tsx`
- `src/views/board/ui/board-page-loading.tsx`
- `src/views/board/ui/board-page-view.tsx`
- `src/widgets/board-post-list/ui/board-post-list.tsx`
- `src/widgets/board-post-editor/ui/board-post-editor.tsx`

구조:

```text
/board
└─ BoardPage
   ├─ useBoardPageController
   ├─ BoardPageLoading
   └─ BoardPageView
      ├─ EditHeader
      ├─ EditLayout
      │  ├─ BoardPostList
      │  └─ BoardPostEditor
```

### BoardPostList

역할:

- 목록 표시
- 선택
- 새 글 작성 시작

### BoardPostEditor

역할:

- 현재 draft 표시
- 입력값 수정
- 생성/수정/삭제 버튼 표시

즉 UI는 "어떻게 보일지"에 집중하고, 실제 CRUD 흐름 결정은 controller와 use case 쪽이 담당한다.

## 13. 실제 CRUD 동작 흐름

### 조회(Read)

```text
BoardPage mount
-> useBoardPageController useEffect
-> ListBoardPostsUseCase.execute()
-> BoardPostRepository.list()
-> MockBoardPostRepository or HttpBoardPostRepository
-> 결과 반환
-> zustand store loadSucceeded
-> UI 목록 렌더링
```

### 생성(Create)

```text
사용자 입력
-> BoardPostEditor
-> handleSubmit
-> CreateBoardPostUseCase.execute(input)
-> BoardPostRepository.create(input)
-> 저장 결과 반환
-> zustand store createSucceeded
-> 선택 상태 갱신
-> UI 재렌더링
```

### 수정(Update)

```text
선택된 게시글 수정
-> handleSubmit
-> UpdateBoardPostUseCase.execute(post)
-> BoardPostRepository.update(post)
-> 저장 결과 반환
-> zustand store updateSucceeded
-> UI 재렌더링
```

### 삭제(Delete)

```text
삭제 버튼 클릭
-> handleDelete
-> DeleteBoardPostUseCase.execute(postId)
-> BoardPostRepository.remove(postId)
-> zustand store deleteSucceeded
-> 다음 게시글 선택
-> UI 재렌더링
```

## 14. 왜 이런 구조가 좋은가

장점:

- UI가 단순해진다
- mock과 http를 쉽게 교체할 수 있다
- 테스트가 쉬워진다
- 도메인 규칙을 use case에 넣기 쉽다
- 상태 저장 책임과 데이터 접근 책임이 섞이지 않는다

특히 지금 같은 학습 단계에서는:

- repository가 뭔지
- use case가 왜 필요한지
- store가 어떤 역할인지

를 아주 명확히 볼 수 있다.

## 15. 중요한 구분

### API client

- HTTP 공통 처리
- fetch wrapper

### repository

- 게시글 CRUD 의미를 아는 계층

### use case

- 기능 단위 행동

### controller

- 화면 이벤트와 use case 연결

### store

- 현재 화면 상태 저장

### UI

- 렌더링과 입력 표시

## 16. 학습할 때 보면 좋은 순서

아래 순서로 보면 이해가 가장 빠르다.

1. `src/app/board/page.tsx`
2. `src/views/board/ui/board-page.tsx`
3. `src/views/board/model/use-board-page-controller.ts`
4. `src/views/board/model/board-page-store.ts`
5. `src/features/board-post-crud/*`
6. `src/shared/ports/board-post-repository.port.ts`
7. `src/shared/infra/repository/mock-board-post.repository.ts`
8. `src/shared/infra/repository/http-board-post.repository.ts`
9. `src/shared/api/http-client.ts`

이 순서로 보면 상위에서 하위로 구조가 보인다.

## 17. 한 줄 요약

`/board`는 단순한 게시판이 아니라, 현재 프로젝트가 지향하는 프론트엔드 아키텍처를 작은 CRUD 예제로 보여주는 페이지다.
