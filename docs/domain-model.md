# Domain Model

## 문서 목적
이 문서는 edit 페이지에서 사용하는 핵심 도메인 모델을 정의한다.

이 페이지는 HTTP 기반 부하 테스트 스크립트를 시각적으로 작성, 편집, 저장, 복원, 실행할 수 있어야 한다.  
도메인 모델은 단순히 UI 표시용 구조가 아니라, 아래 요구사항을 안정적으로 표현할 수 있어야 한다.

- script 단위의 전체 시나리오 구성
- transaction 단위의 순차 실행 구조
- request-group 단위의 병렬 실행 구조
- request / data node 등 제한된 노드 타입 지원
- 선행 요청 결과를 후행 요청 파라미터에 연결하는 참조 구조
- HAR import 결과를 내부 모델로 변환하는 구조
- 서버 저장 JSON과 UI 표현 사이의 안정적인 중간 모델
- 브라우저 실행 / 서버 실행 모두가 공유할 수 있는 실행 입력 모델

이 문서에서 정의하는 모델은 **UI 레이아웃 구조가 아니라 비즈니스 의미를 가진 domain model**이다.

---

## 핵심 원칙

### 1. UI 모델과 도메인 모델을 분리한다
화면 렌더링을 위한 위치 좌표, hover 상태, selection 상태 같은 값은 도메인 모델이 아니라 editor/view model에서 관리한다.  
도메인 모델은 script의 의미와 구조를 표현해야 한다.

### 2. 서버 JSON과 도메인 모델을 분리한다
서버 저장 형식(JSON DTO)과 프론트 내부 도메인 모델은 동일하다고 가정하지 않는다.  
서버 응답은 역직렬화 과정을 거쳐 도메인 모델로 변환되어야 한다.

### 3. 실행 가능한 구조를 표현해야 한다
도메인 모델은 단순한 트리 구조가 아니라, 실제 실행 순서와 병렬 실행 의미를 표현할 수 있어야 한다.

### 4. 현재 도메인에 필요한 노드만 지원한다
범용 워크플로우 엔진처럼 무한 확장 가능한 노드 시스템으로 설계하지 않는다.  
현재는 아래 노드 타입만 지원한다.

- data node
- request node
- request-group node

### 5. 참조와 의존 관계를 표현할 수 있어야 한다
선행 노드의 결과를 후행 요청의 파라미터에서 참조할 수 있어야 하며, 이 관계를 도메인 레벨에서 표현할 수 있어야 한다.

---

## 최상위 모델 개요

최상위 구조는 다음과 같다.

~~~text
script
├─ http-settings
├─ transactions[]
│  ├─ execution units...
~~~

예시:

~~~text
script
├─ http-settings
├─ transaction1
│  ├─ request1
│  ├─ request-group1
│  │  ├─ request1
│  │  ├─ request2
│  │  └─ request3
│  └─ request-group2
│     └─ request1
└─ transaction2
~~~

### 의미
- `script`는 전체 테스트 시나리오의 루트다.
- `http-settings`는 script와 1:1 관계를 가진다.
- `transaction`은 순차 실행 단위다.
- transaction 내부 요소들은 선언 순서대로 실행된다.
- `request-group` 내부의 request들은 병렬 실행된다.
- 각 request는 HTTP 요청 단위다.
- data node는 요청 파라미터화나 변수 구성에 사용된다.

---

## 주요 엔티티

## Script
Script는 전체 테스트 시나리오를 표현하는 루트 엔티티다.

### 책임
- 전체 transaction 집합 보유
- 공통 http-settings 보유
- script 메타데이터 관리
- 저장/복원/실행의 기준 단위 제공

### 예시 타입
~~~ts
export interface Script {
  id: string;
  name: string;
  description?: string;
  httpSettings: HttpSettings;
  transactions: Transaction[];
  createdAt?: string;
  updatedAt?: string;
}
~~~

### 필드 설명
- `id`: script 식별자
- `name`: 사용자에게 표시되는 script 이름
- `description`: 선택적 설명
- `httpSettings`: 공통 HTTP 설정
- `transactions`: 순차 실행 transaction 목록

---

## HttpSettings
HttpSettings는 script에 공통 적용되는 HTTP 클라이언트 설정이다.

### 의미
`HttpSettings`는 .NET `HttpClient` 옵션 성격의 설정을 표현한다.  
실제 구현 세부사항과 1:1로 고정하기보다는, 프론트와 서버가 공통 이해할 수 있는 중립적 모델로 유지하는 것이 좋다.

### 예시 타입
~~~ts
export interface HttpSettings {
  baseUrl?: string;
  timeoutMs?: number;
  followRedirects?: boolean;
  defaultHeaders: HeaderEntry[];
  cookiePolicy?: 'inherit' | 'isolate' | 'disabled';
  connectionReuse?: boolean;
}
~~~

### 관련 타입
~~~ts
export interface HeaderEntry {
  key: string;
  value: string;
  enabled: boolean;
}
~~~

### 필드 설명
- `baseUrl`: 공통 베이스 URL
- `timeoutMs`: 기본 타임아웃
- `followRedirects`: 리다이렉트 허용 여부
- `defaultHeaders`: 공통 헤더 목록
- `cookiePolicy`: 쿠키 처리 전략
- `connectionReuse`: 연결 재사용 여부

---

## Transaction
Transaction은 script 내부의 순차 실행 단위다.

### 책임
- 실행 순서를 가지는 step 목록 보유
- 사용자에게 논리적 묶음 단위 제공
- SNB에서 동적으로 표시되는 네비게이션 단위 제공

### 예시 타입
~~~ts
export interface Transaction {
  id: string;
  name: string;
  description?: string;
  steps: TransactionStep[];
}
~~~

### 의미
- script는 여러 transaction을 가진다.
- transaction 간 순서도 중요할 수 있다.
- transaction 내부의 `steps`는 선언 순서대로 실행된다.

---

## TransactionStep
Transaction 내부에 들어가는 실행 단위다.

현재 지원하는 step은 다음 두 가지다.

- request node
- request-group node

필요 시 data node를 transaction step으로 직접 둘지, request 내부 보조 데이터로 둘지는 제품 정책에 따라 결정할 수 있다.  
현 시점에서는 data node를 독립 노드로 지원하되, 실행 노드와 보조 노드의 역할을 명확히 구분하는 것이 좋다.

### 예시 타입
~~~ts
export type TransactionStep =
  | RequestNode
  | RequestGroupNode
  | DataNode;
~~~

---

## DataNode
DataNode는 실행 자체보다는 값 정의, 파라미터 구성, 참조 가능한 데이터 제공을 위한 노드다.

### 역할
- 공통 변수 정의
- 템플릿 값 제공
- 후행 request 파라미터에서 참조할 수 있는 데이터 저장
- HAR import 이후 공통화 가능한 값 표현

### 예시 타입
~~~ts
export interface DataNode {
  id: string;
  type: 'data';
  name: string;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object';
  value: unknown;
  description?: string;
}
~~~

### 주의사항
- `value`는 넓은 타입이므로 UI 계층에서는 별도의 validation/view model이 필요할 수 있다.
- 실행 엔진은 data node 값을 resolution 가능한 형태로 읽을 수 있어야 한다.

---

## RequestNode
RequestNode는 단일 HTTP 요청을 나타내는 핵심 실행 노드다.

### 책임
- 요청 메서드, URL, 헤더, 바디, 쿼리 등 표현
- 실행 시 결과 생성
- 후행 노드가 참조할 수 있는 출력 제공

### 예시 타입
~~~ts
export interface RequestNode {
  id: string;
  type: 'request';
  name: string;
  method: HttpMethod;
  url: string;
  headers: HeaderEntry[];
  queryParams: QueryParam[];
  pathParams: PathParam[];
  body?: RequestBody;
  assertions?: AssertionRule[];
  variableBindings?: VariableBinding[];
  timeoutMs?: number;
  description?: string;
}
~~~

### 관련 타입
~~~ts
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface QueryParam {
  key: string;
  value: ValueExpression;
  enabled: boolean;
}

export interface PathParam {
  key: string;
  value: ValueExpression;
}

export interface RequestBody {
  contentType:
    | 'application/json'
    | 'application/x-www-form-urlencoded'
    | 'text/plain'
    | 'multipart/form-data'
    | 'none';
  raw?: ValueExpression;
  formEntries?: FormEntry[];
}

export interface FormEntry {
  key: string;
  value: ValueExpression;
  enabled: boolean;
}

export interface AssertionRule {
  id: string;
  kind: 'status' | 'body' | 'header' | 'json-path';
  operator:
    | 'eq'
    | 'neq'
    | 'contains'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'exists';
  expected?: string | number | boolean;
  target?: string;
}

export interface VariableBinding {
  id: string;
  source: ValueSelector;
  targetKey: string;
}
~~~

### 의미
- `variableBindings`는 실행 결과에서 특정 값을 추출해 후속 요청에서 쓸 수 있게 만드는 규칙이다.
- `assertions`는 요청 결과 검증 규칙이다.
- `url`, `queryParams`, `body` 등은 정적 문자열이 아니라 참조 표현식을 포함할 수 있다.

---

## RequestGroupNode
RequestGroupNode는 하위 request들을 병렬로 실행하는 노드다.

### 책임
- 병렬 실행 그룹 표현
- 그룹 단위 메타데이터 보유
- 내부 request 목록 보유

### 예시 타입
~~~ts
export interface RequestGroupNode {
  id: string;
  type: 'request-group';
  name: string;
  requests: RequestNode[];
  description?: string;
}
~~~

### 의미
- request-group 내부 request들은 순서에 의존하지 않는다.
- 모두 병렬로 실행된다.
- request-group 자체는 transaction 내부의 하나의 step이다.
- transaction은 group 이전/이후 step들과 순차 관계를 가진다.

### 예시
~~~text
transaction
├─ request A
├─ request-group B
│  ├─ request B-1
│  ├─ request B-2
│  └─ request B-3
└─ request C
~~~

실행 의미:
1. request A 실행
2. request-group B 내부 요청 병렬 실행
3. B 그룹 종료 후 request C 실행

---

## 참조 모델

## ValueExpression
요청의 URL, 파라미터, 바디 값은 고정값일 수도 있고, 다른 노드 결과를 참조하는 동적 표현식일 수도 있다.  
이를 위해 값 표현을 별도 모델로 둔다.

### 예시 타입
~~~ts
export type ValueExpression =
  | StaticValueExpression
  | ReferenceValueExpression
  | TemplateValueExpression;

export interface StaticValueExpression {
  kind: 'static';
  value: string;
}

export interface ReferenceValueExpression {
  kind: 'reference';
  selector: ValueSelector;
}

export interface TemplateValueExpression {
  kind: 'template';
  template: string;
  references: ValueSelector[];
}
~~~

### 의미
- `static`: 고정값
- `reference`: 다른 노드 결과를 직접 참조
- `template`: 문자열 템플릿 안에서 여러 참조 사용

---

## ValueSelector
ValueSelector는 다른 노드의 어떤 값을 참조하는지 표현한다.

### 예시 타입
~~~ts
export interface ValueSelector {
  nodeId: string;
  sourceType: 'request-response' | 'request-binding' | 'data-node';
  path: string;
}
~~~

### 예시 의미
- 특정 request의 response body json path 참조
- 특정 request의 binding 결과 참조
- 특정 data node의 값 참조

예시:
- `requestA.response.body.user.id`
- `requestA.binding.token`
- `dataNode1.value.baseUrl`

실제 저장 형식은 path string 기반으로 단순화할 수 있다.

---

## 실행 의미 모델

도메인 모델은 실행 순서를 계산할 수 있어야 한다.  
실행기는 아래 규칙을 기반으로 동작한다.

### Script 실행 규칙
- script는 transaction 목록을 가진다.
- transaction은 순차적으로 실행된다.

### Transaction 실행 규칙
- transaction 내부의 `steps`는 선언 순서대로 실행된다.

### RequestGroup 실행 규칙
- request-group 내부 `requests`는 병렬로 실행된다.
- 그룹 내 모든 request가 종료되어야 다음 transaction step으로 이동할 수 있다.

### DataNode 실행 규칙
- data node는 실행 자체보다는 값 공급자로 동작한다.
- 실행 엔진은 data node를 context에 적재하거나 참조 가능한 값으로 해석한다.

---

## 식별자 규칙

각 주요 노드는 안정적인 식별자를 가져야 한다.

### 원칙
- `script.id`, `transaction.id`, `node.id`는 모두 고유해야 한다.
- UI 재렌더링이나 drag/drop 이후에도 가능하면 유지되어야 한다.
- 참조 모델(ValueSelector)은 id 기반으로 연결된다.
- 이름(name)이 바뀌어도 참조가 깨지지 않도록 id 중심으로 설계한다.

### 권장
- UUID 또는 prefix 기반 unique id 사용

예:
- `script_xxx`
- `txn_xxx`
- `req_xxx`
- `group_xxx`
- `data_xxx`

---

## 서버 저장 모델과의 관계

서버 저장 형식은 JSON이 될 예정이지만, 프론트 내부 도메인 모델과 반드시 동일할 필요는 없다.

### 권장 계층
- Server DTO
- Domain Model
- Editor/View Model

### 예시 흐름
~~~text
Server JSON DTO
→ deserialize
→ Domain Model
→ Editor State / View Model
→ UI
~~~

### 저장 시
~~~text
Editor State
→ Domain Model
→ serialize
→ Server JSON DTO
~~~

### 장점
- 서버 포맷 변경에 대한 영향 최소화
- UI 상태와 저장 모델의 결합 완화
- HAR import도 동일한 domain model로 수렴 가능

---

## HAR import와의 관계

HAR 파일은 곧바로 UI에 뿌리는 것이 아니라, 내부 도메인 모델로 변환되어야 한다.

### 권장 흐름
~~~text
HAR file
→ parse HAR
→ map to Domain Model
→ Script / Transaction / RequestNode 생성
→ Editor State 반영
~~~

### 매핑 원칙
- HAR entry 하나가 request node 하나로 변환될 수 있다.
- HAR의 페이지/타이밍/그룹 정보가 있으면 transaction 또는 request-group 후보로 활용할 수 있다.
- 공통 헤더/베이스 URL은 http-settings 후보로 승격할 수 있다.
- HAR에 없는 개념(assertion, variable binding 등)은 기본값 또는 빈 값으로 초기화한다.

---

## 에디터 상태와의 관계

도메인 모델은 UI 상태를 직접 포함하지 않는다.  
에디터는 별도의 상태 모델을 가진다.

예:
~~~ts
export interface EditorState {
  script: Script;
  selectedTransactionId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}
~~~

### 분리 이유
- selection, hover, modal open 여부는 domain이 아니라 UI 상태다.
- domain model은 저장/복원/실행의 기준이어야 한다.
- editor state는 domain model + 편집 부가 상태를 조합한 구조여야 한다.

---

## 검증 규칙

도메인 모델에는 최소한의 정합성 검사가 필요하다.

### Script 수준
- transaction이 0개일 수 있는지 정책 결정 필요
- http-settings는 항상 존재해야 하는지 정책 결정 필요

### Transaction 수준
- `steps` 내 id 중복 금지
- 빈 transaction 허용 여부 정책 결정 필요

### RequestNode 수준
- method 필수
- url 필수
- body와 content type 정합성 필요
- variable binding의 source selector 유효성 필요

### RequestGroupNode 수준
- 내부 request 1개 이상인지 정책 결정 필요
- group 내부 request id 중복 금지

### Reference 수준
- selector가 참조하는 node가 존재해야 함
- request 결과 참조 시 path 유효성은 런타임 검증 또는 저장 전 검증 가능
- 순환 참조 허용 여부 정책 필요

---

## 권장 타입 구조 예시

~~~ts
export interface Script {
  id: string;
  name: string;
  description?: string;
  httpSettings: HttpSettings;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  name: string;
  description?: string;
  steps: TransactionStep[];
}

export type TransactionStep =
  | DataNode
  | RequestNode
  | RequestGroupNode;

export interface DataNode {
  id: string;
  type: 'data';
  name: string;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'object';
  value: unknown;
  description?: string;
}

export interface RequestNode {
  id: string;
  type: 'request';
  name: string;
  method: HttpMethod;
  url: string;
  headers: HeaderEntry[];
  queryParams: QueryParam[];
  pathParams: PathParam[];
  body?: RequestBody;
  assertions?: AssertionRule[];
  variableBindings?: VariableBinding[];
  timeoutMs?: number;
  description?: string;
}

export interface RequestGroupNode {
  id: string;
  type: 'request-group';
  name: string;
  requests: RequestNode[];
  description?: string;
}
~~~

---

## 비목표

현재 도메인 모델 문서에서는 아래를 직접 다루지 않는다.

- 실행 이벤트 스트림 상세 모델
- WebSocket transport payload
- UI 좌표계 및 그래프 레이아웃 모델
- 인증 정보 저장 모델
- 협업 편집 모델
- 서버 내부 실행 엔진 모델

이 항목들은 별도 문서에서 정의한다.

---

## 최종 목표
이 도메인 모델의 목표는 다음과 같다.

- edit 페이지가 HTTP 부하 테스트 스크립트를 안정적으로 표현할 수 있다.
- 저장/복원/실행/시뮬레이션이 모두 같은 모델을 기준으로 동작할 수 있다.
- 브라우저 실행과 서버 실행이 동일한 입력 모델을 공유할 수 있다.
- HAR import 결과를 일관된 내부 구조로 수용할 수 있다.
- UI 구조와 저장 포맷의 변화가 있어도 핵심 도메인 구조는 안정적으로 유지된다.