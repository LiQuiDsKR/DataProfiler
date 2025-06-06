# Javaweb Profiler

Javaweb Profiler는 Core와 Task 형태의 성능 분석 데이터를 업로드하여, DB에 저장하고 시각화하는 웹 기반 프로파일링 도구입니다.  
사용자는 `.txt` 형식의 데이터를 업로드하고, Core 또는 Task 기준으로 차트를 선택하여 평균, 최소, 최대 사용량을 확인할 수 있습니다.

## 프로젝트 구조

```
root/
├── app.js
├── config/
│   └── config.json           # Sequelize DB 설정 (비공개 처리)
├── models/
│   ├── index.js              # Sequelize 초기화 및 유틸 함수
│   └── profile.js            # 동적 테이블용 모델 클래스
├── routes/
│   ├── index.js              # 메인 페이지 라우터
│   └── profiles.js           # 파일 업로드 및 데이터 API 라우터
├── views/
│   ├── index.html            # 메인 템플릿
│   └── error.html            # 에러 발생 시 출력 템플릿
├── public/
│   └── sequelize.js          # 클라이언트 사이드 인터랙션 및 차트 로직
└── package.json
```

## 기능 설명

### 1. 파일 업로드

- 사용자는 `.txt` 파일을 다중 선택하여 업로드할 수 있습니다.
- 업로드된 파일은 다음과 같은 구조여야 합니다:

```
core1  core2  core3
task1  10     12     14
task2  20     25     22
task3  30     28     35
```

- 업로드 시 중복 파일명은 자동 필터링되며, 새로 업로드된 데이터는 Sequelize를 통해 테이블로 생성되어 DB에 저장됩니다.

### 2. 데이터 시각화

- 업로드된 각 테이블에 대해:
  - Core 또는 Task 기준으로 분석이 가능합니다.
  - 차트 종류는 `line`, `bar`, `polarArea`가 제공됩니다.
  - Chart.js 라이브러리를 통해 시각화됩니다.

### 3. 테이블 관리

- 좌측 목록에서 DB에 존재하는 테이블들을 확인할 수 있습니다.
- 클릭 시 해당 데이터가 로딩되고 차트로 시각화됩니다.
- 삭제 버튼을 통해 테이블을 DB에서 제거할 수 있습니다.

## 폴더별 상세 설명

### routes/

- `index.js`  
  메인 페이지에서 테이블 리스트를 불러와 렌더링합니다.

- `profiles.js`  
  다음과 같은 API를 제공합니다:

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/profiles` | 프로파일 데이터 업로드 및 저장 |
| `GET`  | `/profiles` | 테이블 리스트 반환 |
| `GET`  | `/profiles/data/:tableName` | 테이블 내 전체 데이터 + core/task 목록 반환 |
| `DELETE` | `/profiles/drop/:tableName` | 테이블 삭제 |
| `GET`  | `/profiles/coredata/:tableName/:core` | 특정 Core의 Task별 사용량 통계 |
| `GET`  | `/profiles/taskdata/:tableName/:task` | 특정 Task의 Core별 사용량 통계 |

### models/

- `index.js`  
  DB 연결, 동적 테이블 생성/삭제, 테이블 리스트 반환 등의 유틸 함수 제공

- `profile.js`  
  Nunjucks에서 지정한 테이블명을 기반으로 Sequelize 모델을 런타임에 동적으로 정의하는 클래스

### views/

- `index.html`  
  업로드 UI, 테이블 목록, 차트 시각화, 사용 방법 모달 등을 포함한 메인 템플릿

- `error.html`  
  에러 발생 시 사용자에게 메시지를 출력하는 용도의 템플릿

### public/

- `sequelize.js`  
  클라이언트 상의 모든 상호작용을 담당하는 스크립트  
  업로드, 삭제, 테이블 선택, Core/Task 선택, 차트 렌더링까지 이 파일에서 수행됩니다.

## 기술 스택

- Express.js
- Sequelize (MySQL)
- Nunjucks
- Chart.js
- Bootstrap 5
- Vanilla JS (Axios, FileReader 등)

## 실행 방법

1. `.env` 또는 `config/config.json`을 환경에 맞게 작성 (비공개)
2. MySQL에서 지정된 데이터베이스 생성
3. 다음 명령어로 서버 실행:

```bash
npm install
node app.js
```

접속: http://localhost:3000

## 주의사항

- `.txt` 파일 이외의 형식은 업로드할 수 없습니다.
- 동일한 파일명이 DB에 존재하는 경우, 업로드가 자동으로 무시됩니다.
- 서버 재시작 시 기존 테이블은 유지됩니다. 필요 시 수동 삭제 바랍니다.