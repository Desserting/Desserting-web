# Desserting Web

Desserting 서비스의 프론트엔드 웹 애플리케이션입니다.

<!-- 서비스 소개(어떤 문제를 해결하는 서비스인지)를 여기에 한두 문장으로 추가해주세요. -->

## 기술 스택

| 구분            | 사용 기술                            |
| --------------- | ------------------------------------ |
| 프레임워크      | React 19, TypeScript, Vite           |
| 스타일링        | Tailwind CSS 4, shadcn/ui (Radix UI) |
| 라우팅          | React Router                         |
| 서버 상태       | TanStack Query, Axios                |
| 클라이언트 상태 | Zustand                              |
| 폼·검증         | React Hook Form, Zod                 |
| 실시간 통신     | STOMP (WebSocket)                    |
| 코드 품질       | ESLint, Prettier                     |

## 시작하기

### 요구 사항

- Node.js 24 (CI와 동일한 버전)
- npm
- 백엔드 서버 (기본값 `http://localhost:8080`)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Desserting/Desserting-web.git
cd Desserting-web

# 의존성 설치
npm ci

# 개발 서버 실행
npm run dev
```

### 환경 변수

`.env.development`에서 개발 환경 변수를 관리합니다.

| 변수                | 설명                   |
| ------------------- | ---------------------- |
| `VITE_API_BASE_URL` | 백엔드 API의 기본 주소 |

개인 환경에서만 값을 바꾸고 싶다면 `.env.development.local`을 만들어 사용하세요. `*.local` 파일은 Git에 올라가지 않습니다.

### 개발 서버 프록시

`vite.config.ts`에 다음 경로가 `http://localhost:8080`으로 프록시되도록 설정되어 있습니다.

- `/api`: REST API
- `/ws`: WebSocket

## 스크립트

| 명령어            | 설명                                            |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | 개발 서버 실행                                  |
| `npm run build`   | 타입 검사 후 프로덕션 빌드                      |
| `npm run preview` | 빌드 결과물을 로컬에서 미리보기                 |
| `npm run lint`    | ESLint 검사                                     |
| `npm run gen:api` | 백엔드 OpenAPI 명세로 `src/types/api.d.ts` 생성 |

`gen:api`는 백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.

## 프로젝트 구조

```
src
├── components
│   └── ui        # shadcn/ui 컴포넌트
├── lib
│   ├── axios.ts  # Axios 인스턴스
│   └── utils.ts  # 공용 유틸
├── App.tsx
├── index.css
└── main.tsx
```

`@` 별칭은 `src` 디렉터리를 가리킵니다. (예: `import { Button } from '@/components/ui/button'`)

UI 컴포넌트는 shadcn CLI로 추가합니다.

```bash
npx shadcn@latest add <component>
```

## 컨벤션

### 커밋 컨벤션

커밋 메시지는 `type: 한글 설명` 형식을 사용합니다.

| type     | 설명                                  |
| -------- | ------------------------------------- |
| feat     | 새로운 기능 추가                      |
| fix      | 버그 수정                             |
| docs     | 문서 수정                             |
| style    | 코드 포맷팅 등 로직 변경이 없는 수정  |
| refactor | 기능 변경이 없는 코드 개선과 리팩터링 |
| test     | 테스트 코드 추가·수정                 |
| chore    | 빌드 설정, 패키지 관리 등 기타 변경   |
| ci       | CI/CD 설정 변경                       |
| merge    | 브랜치 또는 PR 병합                   |

예시: `feat: 시작 화면 버튼 컴포넌트 추가`, `fix: API 요청 baseURL 누락 수정`, `chore: prettier tailwind 플러그인 추가`

### 브랜치 컨벤션

작업 브랜치는 `type/작업내용` 형식을 사용하며, 작업 내용은 영문 소문자와 하이픈으로 작성합니다.

| 브랜치       | 설명                            |
| ------------ | ------------------------------- |
| `main`       | 배포 가능한 안정 버전           |
| `feature/*`  | 기능 개발                       |
| `refactor/*` | 코드 리팩터링                   |
| `test/*`     | 테스트 코드 추가·보강           |
| `chore/*`    | 빌드 설정과 의존성 등 기타 변경 |
| `ci/*`       | CI/CD 설정 변경                 |

예시: `feature/add-start-page`, `refactor/split-axios-instance`, `chore/add-prettier-tailwind-plugin`, `ci/add-lint-step`

### 코드 스타일

- Prettier로 포맷팅합니다. (세미콜론 사용, 작은따옴표, Tailwind 클래스 자동 정렬)
- ESLint 규칙을 통과해야 합니다. 커밋 전에 `npm run lint`를 실행해주세요.

## 협업 방식

1. `main`에서 브랜치 컨벤션에 맞게 작업 브랜치를 만듭니다.
2. 커밋 컨벤션에 맞춰 작업 내용을 커밋합니다.
3. `main`을 대상으로 Pull Request를 작성합니다. PR 템플릿의 체크리스트를 확인해주세요.
4. PR을 올리면 CI(`npm ci` → `npm run build`)가 자동으로 실행됩니다. 빌드가 실패하면 원인을 해결한 뒤 다시 푸시해주세요.
5. 리뷰를 받고 머지합니다.
