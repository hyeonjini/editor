# Execution Architecture

## 문서 목적
이 문서는 edit 페이지에서 사용하는 실행 아키텍처를 정의한다.  
이 페이지는 HTTP 기반 부하 테스트 스크립트를 시각적으로 편집하고, 저장/복원하며, 시뮬레이션을 실행하고, 실행 결과를 실시간으로 확인할 수 있어야 한다.

특히 아래 요구사항을 만족해야 한다.

- 사용자는 스크립트를 자신의 브라우저에서 실행할지, 서버에서 실행할지 선택할 수 있어야 한다.
- 실행 위치가 어디든 edit 페이지의 상위 UI와 사용자 경험은 최대한 동일해야 한다.
- 페이지와 UI 계층은 실제 실행 주체가 브라우저인지 서버인지 알지 못해야 한다.
- 서버 실행 시에는 WebSocket 기반의 실시간 이벤트 스트림을 수신할 수 있어야 한다.
- 브라우저 실행 시에도 동일한 실행 이벤트 모델을 통해 상태를 관리할 수 있어야 한다.

---

## 핵심 원칙

### 1. 실행 주체 추상화
UI 계층은 실행이 브라우저에서 수행되는지, 서버에서 수행되는지 알지 못해야 한다.  
UI는 아래 동작만 알고 있어야 한다.

- 실행 시작
- 실행 중지
- 실행 상태 조회
- 실행 이벤트 수신
- 실행 결과 표시

실제 실행 위치에 따른 차이는 adapter 또는 driver 계층에서 흡수한다.

### 2. 공통 실행 인터페이스
브라우저 실행과 서버 실행은 동일한 상위 인터페이스를 구현해야 한다.  
상위 계층은 이 공통 인터페이스만 사용하며, 특정 실행 방식에 직접 의존하지 않는다.

### 3. 공통 이벤트 모델
실행 중 발생하는 이벤트는 브라우저 실행과 서버 실행 모두 동일한 이벤트 포맷을 사용해야 한다.  
UI는 transport 차이 없이 동일한 이벤트 스트림을 처리할 수 있어야 한다.

### 4. 저장/복원과 실행 분리
스크립트 저장/조회 책임과 실행 책임은 분리한다.  
실행은 현재 에디터의 스크립트 모델을 입력으로 받아 수행하며, 저장 여부와 강하게 결합하지 않는다.

### 5. 전송 방식과 도메인 로직 분리
HTTP API, WebSocket, Browser Runtime, Mock Runtime 등 transport 및 infra 세부사항은 domain/application 계층에서 직접 알지 않도록 분리한다.

---

## 아키텍처 개요

실행 아키텍처는 크게 다음 계층으로 나눈다.

- UI Layer
- Application Layer
- Domain Layer
- Infrastructure Layer

### UI Layer
edit 페이지와 관련 UI 컴포넌트가 포함된다.

예:
- 실행 버튼
- 중지 버튼
- 실행 위치 선택 UI
- 진행 상태 패널
- 로그 패널
- 결과 패널
- 노드별 상태 표시

UI는 실행 유스케이스를 호출하고, 상태와 이벤트를 표시한다.  
실행 방식의 구체 구현은 몰라야 한다.

### Application Layer
유스케이스와 orchestration 책임을 가진다.

예:
- `startSimulation`
- `stopSimulation`
- `subscribeSimulation`
- `saveScript`
- `loadScript`

이 계층은 domain model과 port(interface)를 이용해 흐름을 조정한다.

### Domain Layer
스크립트 구조, 실행 상태, 실행 이벤트, 결과 모델 등 핵심 도메인 타입을 정의한다.

예:
- `Script`
- `Transaction`
- `RequestNode`
- `RequestGroupNode`
- `DataNode`
- `ExecutionSession`
- `ExecutionEvent`
- `ExecutionStatus`

### Infrastructure Layer
실제 구현체가 위치한다.

예:
- Browser executor
- Server executor
- WebSocket client
- HTTP API client
- Mock repository
- JSON serializer / deserializer

---

## 목표 구조

다음과 같은 역할 분리를 목표로 한다.

- UI는 `SimulationService` 또는 `SimulationRunner` 같은 공통 진입점만 사용한다.
- Application은 실행 방식에 따라 적절한 runner를 선택한다.
- Runner 구현체는 브라우저 실행 또는 서버 실행을 담당한다.
- 이벤트는 공통 `ExecutionEvent` 형태로 application 계층에 전달된다.
- UI 상태는 실행 위치와 무관하게 동일한 방식으로 갱신된다.

---

## 실행 흐름

### 1. 실행 시작
사용자가 실행 버튼을 누르면 다음 순서로 동작한다.

1. 현재 에디터 상태에서 실행 가능한 script model을 가져온다.
2. 사용자가 선택한 실행 위치(browser 또는 server)를 확인한다.
3. Application Layer에서 적절한 runner를 선택한다.
4. runner는 실행 세션을 생성하고 실행을 시작한다.
5. 실행 시작 이벤트를 공통 이벤트 스트림으로 전달한다.
6. UI는 세션 상태를 실행 중으로 변경한다.

### 2. 실행 중 이벤트 수신
실행 중에는 runner가 공통 이벤트를 발행한다.

예:
- script started
- transaction started
- request started
- request finished
- log emitted
- warning emitted
- error occurred
- execution completed

UI는 이 이벤트를 구독하여 진행 상태, 노드 상태, 로그, 결과 패널을 갱신한다.

### 3. 실행 중지
사용자가 중지 버튼을 누르면 Application Layer가 현재 session id를 기반으로 runner에 중지 요청을 보낸다.  
runner는 실행 방식에 맞는 방식으로 중지를 처리한다.

- browser 실행: local executor 중지
- server 실행: 중지 API 호출 또는 WebSocket 제어 메시지 전송

### 4. 실행 종료
실행이 정상 종료되거나 실패하면 runner는 종료 이벤트를 발행한다.  
UI는 상태를 완료 또는 실패로 변경하고 결과를 표시한다.

---

## 실행 위치별 동작 방식

## Browser Execution
브라우저 실행은 사용자의 현재 브라우저 환경에서 직접 시뮬레이션을 수행하는 방식이다.

### 목적
- 사용자의 로컬 개발 환경 또는 외부에서 접근 불가능한 dev server를 테스트할 수 있어야 한다.
- 서버 인프라 없이 빠르게 검증할 수 있어야 한다.

### 특징
- 브라우저 내부 executor가 script model을 직접 순회하고 실행한다.
- 실행 중 발생하는 상태 변화는 즉시 공통 이벤트 스트림으로 변환된다.
- 서버 실행과 동일한 이벤트 모델을 사용해야 한다.

### 고려사항
- 브라우저 보안 제약(CORS, 쿠키, 인증, 네트워크 접근성) 영향을 받을 수 있다.
- 장시간 실행이나 고부하 테스트에는 부적합할 수 있다.
- 서버 실행과 가능한 한 동일한 도메인 이벤트를 보장해야 한다.

---

## Server Execution
서버 실행은 script model을 서버에 전달하고, 서버가 실행을 담당하는 방식이다.

### 목적
- 장시간 실행, 다수의 가상 사용자, 중앙 관리형 실행을 지원한다.
- 브라우저 환경과 무관하게 안정적인 시뮬레이션을 수행한다.

### 특징
- 실행 시작 시 script model과 실행 옵션을 서버로 전달한다.
- 서버는 execution session을 생성한다.
- 실행 상태와 결과는 WebSocket을 통해 실시간 이벤트로 전달한다.
- UI는 서버 이벤트를 공통 이벤트 모델로 변환하여 처리한다.

### 고려사항
- WebSocket 연결/재연결 처리 필요
- 서버 세션 식별자 관리 필요
- 네트워크 오류와 실행 오류를 구분해 처리해야 함
- 브라우저 실행과 동일한 상위 UX를 유지해야 함

---

## 공통 인터페이스 설계

다음은 개념적인 인터페이스 예시다.

```ts
export type ExecutionTarget = 'browser' | 'server';

export interface StartExecutionInput {
  script: ScriptModel;
  target: ExecutionTarget;
  options?: ExecutionOptions;
}

export interface ExecutionSession {
  sessionId: string;
  target: ExecutionTarget;
  startedAt: string;
}

export interface SimulationRunner {
  start(input: StartExecutionInput): Promise<ExecutionSession>;
  stop(sessionId: string): Promise<void>;
  subscribe(
    sessionId: string,
    listener: (event: ExecutionEvent) => void
  ): () => void;
}
```

실제 구현에서는 하나의 runner가 target에 따라 내부 분기할 수도 있고, 아래처럼 target별 구현체를 둘 수도 있다.
```ts
export interface TargetedSimulationRunner {
  readonly target: ExecutionTarget;
  start(input: StartExecutionInput): Promise<ExecutionSession>;
  stop(sessionId: string): Promise<void>;
  subscribe(
    sessionId: string,
    listener: (event: ExecutionEvent) => void
  ): () => void;
}
```
권장 방식은 target별 구현체를 분리하고, 상위 factory 또는 service가 선택하는 방식이다.

### 실행 이벤트 모델

실행 이벤트는 UI가 실행 위치를 몰라도 되도록 공통 포맷으로 정의해야 한다.

예시:
```ts
export type ExecutionEvent =
  | {
      type: 'execution.started';
      sessionId: string;
      target: 'browser' | 'server';
      timestamp: string;
    }
  | {
      type: 'transaction.started';
      sessionId: string;
      transactionId: string;
      timestamp: string;
    }
  | {
      type: 'request.started';
      sessionId: string;
      nodeId: string;
      timestamp: string;
    }
  | {
      type: 'request.finished';
      sessionId: string;
      nodeId: string;
      statusCode: number;
      durationMs: number;
      success: boolean;
      timestamp: string;
    }
  | {
      type: 'log.appended';
      sessionId: string;
      level: 'info' | 'warn' | 'error';
      message: string;
      timestamp: string;
    }
  | {
      type: 'execution.failed';
      sessionId: string;
      reason: string;
      timestamp: string;
    }
  | {
      type: 'execution.completed';
      sessionId: string;
      timestamp: string;
    };
```
### 이벤트 설계 원칙
- transport에 종속된 필드를 직접 노출하지 않는다.
- UI가 필요로 하는 최소 정보만 담는다.
- 브라우저 실행/서버 실행 모두 같은 타입으로 발행한다.
- timestamp, node id, transaction id, status code 등 UI 표시와 추적에 필요한 키를 포함한다.

### 실행 상태 모델
UI는 이벤트를 직접 화면에만 반영하지 말고, 실행 상태 store 또는 state model로 축적해야 한다.

예시 상태:
```ts
export interface ExecutionState {
  sessionId: string | null;
  target: 'browser' | 'server' | null;
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'completed' | 'failed';
  activeTransactionId: string | null;
  activeNodeId: string | null;
  logs: ExecutionLogItem[];
  nodeStatuses: Record<string, NodeExecutionStatus>;
  startedAt: string | null;
  endedAt: string | null;
  errorMessage: string | null;
}
```

### 상태 모델 목적
- 노드별 상태 표시
- 진행률 표시
- 로그 출력
- 에러 메시지 표시
- 실행 완료 결과 요약
- 재실행 가능 상태 관리

### 실행 방식 선택 전략
UI는 실행 위치를 직접 분기하지 않고, ExecutionTarget만 전달해야 한다.
예:

- 사용자가 browser 선택
- 사용자가 server 선택

이후 선택된 target에 따라 Application Layer가 적절한 구현체를 선택한다.
예시 흐름:
```ts
const runner = simulationRunnerFactory.get(target);
const session = await runner.start({ script, target, options });
const unsubscribe = runner.subscribe(session.sessionId, handleExecutionEvent);
```

### 장점

- UI가 runner 구현 세부사항을 모른다.
- browser/server 구현 교체가 쉽다.
- mock runner 도입이 쉽다.
- 테스트가 쉬워진다.

## 저장 및 복원과의 관계
실행은 저장과 직접 결합하지 않는다.
다만 edit 페이지에서는 실행 전에 최신 script model을 기준으로 동작해야 한다.

### 저장 요구사항
- debounce 기반 자동 저장
- 페이지 이탈 시 저장
- 명시적 저장 버튼 저장
- 서버에서 JSON 형식으로 저장
- 재방문 시 JSON을 다시 로드하여 화면을 복원

### 설계 원칙
- 저장용 repository와 실행용 runner를 분리한다.
- 서버 JSON은 곧바로 UI에서 소비하지 않고 domain model로 변환한다.
- HAR import도 동일하게 domain model로 변환한다.
- 화면 렌더링 기준은 항상 domain model 또는 editor state model이어야 한다.

### 데이터 흐름

### 저장 흐름
1. 사용자 편집
2. editor state 변경
3. debounce 또는 명시적 저장 발생
4. application save use case 호출
5. repository를 통해 JSON 직렬화 및 저장

### 복원 흐름
1. edit 페이지 진입
2. script id 기반 조회
3. repository를 통해 JSON 수신
4. domain model로 역직렬화
5. editor state 구성
6. UI 렌더링

### 실행 흐름
1. 현재 editor state에서 script model 추출
2. target 선택
3. runner start 호출
4. session 생성
5. event subscribe
6. execution state 갱신
7. UI 반영

## WebSocket 처리 원칙
서버 실행 시 WebSocket 통신을 사용하더라도, UI는 WebSocket 세부사항을 몰라야 한다.

### WebSocket adapter 책임
- 연결 생성
- session 기준 이벤트 구독
- 재연결 정책
- 연결 종료
- raw payload 파싱
- raw event를 공통 ExecutionEvent로 매핑

### 주의사항
- 재연결 시 중복 이벤트 처리 방지
- session mismatch 방지
- 연결 종료와 실행 종료를 구분
- 서버 에러와 네트워크 에러를 구분
- 구독 해제 시 리스너 정리

## Mock 전략

현재 서버와 실행기가 완성되지 않았더라도, 아키텍처는 실제 연동을 고려해 미리 분리해야 한다.

## Mock 구성 예시
- MockScriptRepository
- MockBrowserSimulationRunner
- MockServerSimulationRunner
- MockExecutionEventStream

## 목적
- UI와 상태 흐름을 먼저 검증
- 저장/복원 흐름 검증
- 실행 상태 전이 검증
- WebSocket 없이도 실시간 이벤트 UI 검증

### 추천 폴더 구조 예시
``` 
src/
  pages/
    edit/
      ui/
      model/
  widgets/
    editor-canvas/
    transaction-snb/
    execution-panel/
    simulation-log-panel/
  features/
    run-simulation/
    stop-simulation/
    save-script/
    import-har/
    edit-node/
  entities/
    script/
    transaction/
    request-node/
    request-group-node/
    data-node/
    execution/
  shared/
    api/
    lib/
    config/
    mock/
    ui/
  infrastructure/
    execution/
      browser-runner/
      server-runner/
      ws-client/
    repository/
      script-repository/
```

프로젝트 상황에 따라 infrastructure를 shared/api 또는 각 entity/model 내부로 배치할 수도 있다.
다만 실행 adapter와 저장 adapter는 UI 계층과 분리되어야 한다.

### 비목표
- 이번 아키텍처 문서 범위에서 아래 항목은 직접 다루지 않는다.
- 인증/인가
- 멀티 사용자 동시 편집
- 서버 배포 전략
- 실제 부하 생성 엔진의 내부 구현
- 결과 데이터 장기 보관 전략
- 운영 모니터링 시스템 연동

### 권장 구현 순서

1. Domain model 정의
2. Execution event model 정의
3. Execution state model 정의
4. SimulationRunner 인터페이스 정의
5. Mock browser/server runner 구현
6. UI와 execution state 연결
7. Script repository 인터페이스 정의
8. Mock save/load 구현
9. 이후 실제 API/WebSocket adapter 연결

## 최종 목표
이 아키텍처의 목표는 edit 페이지가 다음 조건을 만족하도록 만드는 것이다.

- 사용자는 동일한 UI에서 script를 편집, 저장, 복원, 실행할 수 있다.
- 실행 위치가 브라우저든 서버든 사용자 경험은 최대한 동일하다.
- UI는 실행 위치와 transport 세부사항을 모른다.
- 실제 서버 연동 전에도 mock 기반으로 동작 흐름을 검증할 수 있다.
- 이후 API, WebSocket, 브라우저 실행기와 쉽게 연결할 수 있다.