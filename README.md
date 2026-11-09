# Desserting

> **디저트와 소개팅이 만나, 디저팅이 되다.**
> 디저트 취향으로 상대를 연결하고, 그 취향에 맞는 카페까지 제안하는 소셜 매칭 서비스

<p align="center">
  <img src="https://github.com/user-attachments/assets/d0f09183-61d0-4ae6-a40d-2ebfedd78a4f" alt="Desserting — 디저트로 연결되는 특별한 만남" width="800" />
</p>

2026 단디톤 · Team 원투쓰리

- 배포 주소: https://desserting-web.vercel.app
- 백엔드 저장소: https://github.com/Desserting/Desserting-was
- 프론트엔드 저장소: https://github.com/Desserting/Desserting-web

## 목차

1. [서비스 소개](#서비스-소개)
2. [핵심 기능](#핵심-기능)
3. [기술 스택](#기술-스택)
4. [실행 방법](#실행-방법)
5. [프로젝트 구조](#프로젝트-구조)
6. [아키텍처와 설계 결정](#아키텍처와-설계-결정)
7. [코드 작성 원칙](#코드-작성-원칙)
8. [컨벤션과 협업 방식](#컨벤션과-협업-방식)

## 서비스 소개

<p align="center">
  <img src="https://github.com/user-attachments/assets/d9ca1d76-9d55-4fe2-a0ee-c5880fa89b21" alt="디저트 + 소개팅 = 디저팅" width="800" />
</p>

Desserting은 **"좋아하는 디저트"라는 가벼운 공통점**으로 첫 대화를 엽니다.

1. **만나다**: 좋아하는 디저트를 고르면, 같은 취향 또는 다른 취향의 상대를 지역·거리 조건 안에서 추천받습니다.
2. **대화하다**: 마음에 드는 상대에게 하트 1개로 대화를 요청하고, 수락되면 바로 실시간 채팅을 시작합니다.
3. **가다**: 채팅 안에서 AI가 두 사람에게 어울리는 카페를 제안하고, 예약·주문까지 이어집니다.

> 아래는 아이디어를 발전시킨 네 가지 질문 **WHY LOCAL → WHY PEOPLE → WHY SERVICE → FOR WHOM**에 대한 우리의 답입니다.

### 1. WHY LOCAL? 왜 대구·경북인가

**대구·경북은 카페에 가는 것이 일상인 지역입니다.**

<p align="center">
  <img src="https://github.com/user-attachments/assets/f5e2bd1b-f1ad-4736-8694-ca008a6ccb97" alt="왜 대구·경북인가" width="800" />
</p>

- **이미 큰 카페 시장**: 커피음료점 **10,495곳**, 월 카드 결제액 약 **875억 원**(연 1조 원 규모)
- **전국보다 빠른 성장**: 전년 동월 대비 카드 결제액 증가율 대구 +15.2%, 경북 +17.4%로 전국 평균(+14.1%)을 웃돕니다.
- **사람이 모이는 카페 문화**: 2026 대구 음식산업박람회·커피&카페페스타에 3일간 약 **4만 1천 명**이 다녀갔습니다.

한 매장이 아니라 **거리 전체가 목적지**가 됩니다. 포항 영일대, 경주 황리단길, 구미 금리단길, 대구 김광석길과 앞산 카페거리처럼 카페와 디저트를 즐기러 가는 거리가 대구 도심부터 경북 각 도시까지 이어져 있습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/85110413-607b-490b-a9b3-d4d9998ede9e" alt="대구·경북의 특색 있는 카페 거리와 문화" width="800" />
</p>

카페와 사람은 이미 충분합니다. 비어 있는 것은 **둘을 만남으로 이어 줄 서비스**입니다.

### 2. WHY PEOPLE? 그 가치는 사람들에게 왜 필요한가

카페 거리에서 우리가 얻는 것은 커피 한 잔이 아니라, **좋아하는 것을 함께 즐길 사람과 편하게 마주 앉는 경험**입니다.

- 디저트는 2030의 일상이자 이야깃거리입니다. 주 3회 이상 디저트를 먹는 비율이 20대 54.2%, 30대 54.9%로, 두 명 중 한 명 이상이 디저트를 일상처럼 즐깁니다.[^1]
- 카페는 좋은 첫 만남 장소입니다. 카페에서 첫 만남을 가졌을 때 애프터 성사율은 51%로, 저녁 식사(39%)보다 12%p 높습니다.[^2]

그런데 카페에서 만나기까지의 과정은 순탄하지 않습니다.

1. 사진과 스펙 중심의 매칭에 피로감을 느낍니다.
2. 매칭이 되어도 할 말이 없어 대화가 끊깁니다.
3. 어느 카페로 갈지 정하는 일조차 부담이 됩니다.

**부담 없는 설렘**과 **같은 취향에서 오는 친밀감**은 대구·경북 사람에게만 필요한 것이 아닙니다. 사진·스펙 중심의 만남에 지친 누구에게나 필요하고, 그래서 지역을 넘어 전달할 수 있는 가치입니다. 강릉 안목해변, 서울 성수, 부산 전포동, 청주 수암골, 전주 한옥마을, 제주 애월처럼 카페 거리는 전국 곳곳에 있습니다.

### 3. WHY SERVICE? 경험이 만들어지는 원리를 서비스로

> **"디저트는 사람을 만나는 이유가 된다."**

지역의 카페·디저트 경험을 *장소*가 아니라 *만남의 계기*로 재해석했습니다. 지역의 모습을 그대로 옮기는 대신, 그 경험이 **만들어지는 원리**를 뽑아 서비스로 다시 설계했습니다.

| 카페 거리에서 경험이 만들어지는 원리 | 디저팅으로 재설계한 방식 |
| --- | --- |
| 같은 거리에 모인 사람은 **취향이 이미 겹친다** | **디저트 취향**으로 상대를 추천합니다. 같은 취향(공감)과 다른 취향(새로운 발견) 중 고를 수 있습니다. |
| **가까워서** 부담 없이 만난다 | **생활권·거리 반경** 안에서 실제로 만날 수 있는 사람만 추천합니다. |
| 장소가 **대화의 소재**가 된다 | 채팅 안에서 **AI가 어울리는 카페**와 메뉴를 제안하거나 직접 카페·시간을 제안할 수 있고, 예약·결제까지 이어집니다. |

기존에는 카페가 "만나서 가는 곳"이었다면, Desserting에서는 **디저트 취향이 먼저 만나고**, 카페는 그 취향을 이어가는 **다음 단계**가 됩니다.

### 4. FOR WHOM? 누구에게 가치가 있는가

#### To User

- 디저트라는 공통점으로 어색함 없이 대화를 시작합니다.
- 채팅부터 예약·방문까지 끊김 없이, 웨이팅 걱정 없이 이어집니다.
- 하루 무료 하트 5개 · 추가 하트 개당 200원 · 무제한 월 9,900원

#### To Store

- 입점비 0원으로 부담 없이 시작합니다. (월 2만 원 + 결제 수수료 7%)
- 새로운 고객이 들어오는 채널을 얻습니다.
- 선결제 시스템으로 노쇼가 줄어듭니다.

### 5. 비즈니스 모델

| 수익원 | 내용 | 상태 |
| --- | --- | --- |
| **하트(재화)** | 대화 요청에 쓰는 하트(요청 1회당 1개)를 수량별 상품으로 판매 | 화면 구현 완료 (현재 모의 결제) |
| **프리미엄 패스** | 월 단위 이용권. 프리미엄 회원은 하트 무제한 (혜택 목록은 서버에서 제공) | 화면 구현 완료 (현재 모의 결제) |
| **제휴 매장** | 제휴 카페 노출, 예약·주문 연계 수수료 월 20,000원 + 수수료 7% | 매장 목록·예약·주문 화면 구현 |

### 6. 전국 확장 가능성

취향이 겹치는 사람, 가까운 거리, 대화 소재가 되는 장소라는 원리는 대구에만 있는 것이 아닙니다. 이미 구미·경주·포항처럼 경북 각 도시에도 같은 구조의 카페 거리가 있고, 부산 서면·전주 한옥마을처럼 디저트 거리가 뚜렷한 지역이라면 그대로 적용할 수 있습니다.

[^1]: 픽플리, 2025-2026 디저트 소비자 경험 데이터 분석
[^2]: Bumble, 글로벌 데이팅 트렌드 분석 리포트(2024)

---

## 핵심 기능

### 만나다: 디저트 취향으로 만나요

> 사진과 스펙 대신, **좋아하는 디저트**로 상대를 찾아요.

<p align="center">
  <img src="https://github.com/user-attachments/assets/6582d83d-e26a-4da7-85c0-1b0fcd4491d1" alt="핵심 기능 만나다 — 취향 선택, 랜덤 매칭, 프로필 확인" width="800" />
</p>

| 단계 | 동작 |
| --- | --- |
| **① 취향 선택** | 가입할 때 케이크·베이커리·구움과자·타르트&파이·빙수&아이스크림·커피·차&논커피·전통 디저트, **8개 카테고리 중 여러 개**를 고릅니다. |
| **② 랜덤 매칭** | 홈에서 **같은 취향**(입맛이 꼭 닮은 사람) 또는 **다른 취향**(새로운 맛을 알려줄 사람)을 고르고, 지역과 거리를 설정하면 조건에 맞는 후보를 랜덤으로 추천받습니다. |
| **③ 프로필 확인** | 상대의 닉네임·나이, 지역·거리, 좋아하는 디저트, 한 줄 소개를 보고 **좋아요**를 누르거나 **하트 1개**를 써서 대화를 요청합니다. |

### 대화하다: 대화를 읽고 카페를 제안하는 AI

> 두 사람의 대화를 읽고, 어울리는 **카페와 메뉴**를 골라 드려요.

<p align="center">
  <img src="https://github.com/user-attachments/assets/cfeb3f70-ded6-471b-b46a-f9051850fb0e" alt="핵심 기능 대화하다 — 채팅 시작, AI 대화 분석, 카페와 메뉴 제안" width="800" />
</p>

| 단계 | 동작 |
| --- | --- |
| **① 채팅 시작** | 대화 요청이 수락되면 채팅 목록에 대화방이 생기고, 바로 실시간 대화를 시작합니다. |
| **② AI 대화 분석** | 채팅 중 **카페 방문 제안하기**에서 **AI가 추천해 줘요**를 고르면, 서버가 대화 내용을 보고 두 사람 취향에 맞는 **제휴 카페와 메뉴**를 고릅니다. **직접 고를래요**를 선택해 매장과 날짜·시간을 직접 정해 보낼 수도 있습니다. |
| **③ 카페와 메뉴 제안** | 매장 이름·주소, 추천 메뉴, 추천 이유가 담긴 카드가 **"일시 미정"** 상태로 채팅방에 도착합니다. 카드를 본 뒤 **일정 제안하기**나 **카페 방문 예약하기**로 이어집니다. |

예를 들어 대화에서 "앞산 쪽에 아눅 앞산이라고 있던데"라는 말이 나오면, AI는 **아눅 앞산**을 골라 대표 메뉴인 **바스크 치즈케이크·피스타치오 크루키**와 함께 제안합니다.

- **왜 AI인가**: 처음 만난 두 사람에게 가장 어려운 질문인 "어디서 볼까?"를 대신 풀어, 대화에서 만남으로 넘어가는 순간을 쉽게 만듭니다. 인기순이 아니라 대화 맥락에 맞춰 고른다는 점이 지도·리뷰 앱과 다릅니다.
- **구현 방식**: 클라이언트는 추천을 요청(`POST /v1/chats/rooms/{roomId}/ai-recommendation`)만 하고, 추천 카드는 서버가 STOMP로 **양쪽 모두에게** 보냅니다. 두 사람이 같은 카드를 같은 시점에 보게 하기 위해서입니다.
- **안정성**: 응답의 `source`로 추천 엔진을 구분합니다(`OLLAMA_LOCAL_QWEN` / `SMART_KEYWORD_FALLBACK`). 로컬 AI가 느리거나 실패하면 키워드 기반 추천으로 대체됩니다. 로컬 모델 응답을 고려해 요청 대기 시간을 40초로 두고, 대기 중에는 시트를 닫지 못하게 해 카드가 갑자기 도착하는 혼란을 막았습니다.

### 가다: 지도에서 찾고, 예약·결제까지 한 번에

> 만날 카페를 **테마 거리 지도**에서 고르고, 예약과 주문까지 앱 안에서 끝내요.

<p align="center">
  <img src="https://github.com/user-attachments/assets/f56006e3-1611-4fa4-9f54-70e56cbb4bf6" alt="핵심 기능 가다 — 테마거리 선택, 제휴매장 탐색, 날짜·시간 선택, 메뉴 담기, 예약 완료" width="800" />
</p>

| 단계 | 동작 |
| --- | --- |
| **① 테마거리 선택** | 카페 지도에서 김광석 다시그리기길, 삼덕동 카페골목 같은 테마 거리를 고르면 지도가 그 거리로 이동하고, 거리 경계와 제휴매장 수를 보여줍니다. |
| **② 제휴매장 탐색** | 거리와 디저트 종류로 매장을 걸러 보고, 매장마다 거리, 대표 메뉴, **디저팅 회원 혜택**(예: 특정 메뉴 주문 시 디저트 증정)을 확인합니다. |
| **③ 날짜·시간 선택** | 달력에서 방문 날짜를 고르고, 예약 가능한 시간대 중 하나를 선택합니다. |
| **④ 메뉴 담기** | 디저트·음료·세트 탭에서 메뉴와 수량을 고르면 총 수량과 금액이 바로 계산됩니다. 품절 메뉴는 따로 표시됩니다. |
| **⑤ 예약 완료** | 매장, 예약 날짜, 시간을 확인하고, **예약/주문 내역**에서 다시 볼 수 있습니다. |

### 전체 기능

| 영역 | 설명 |
| --- | --- |
| 회원가입 | 이메일 가입 → 관심 디저트 선택 → 프로필 입력의 단계별 플로우 |
| 매칭 | 같은 취향 / 다른 취향 중 선택해 랜덤 후보 카드를 받고, 좋아요·대화 요청을 보냄 |
| 채팅 | 대화 요청 수락·거절, STOMP(WebSocket) 기반 실시간 채팅, AI 카페 추천 또는 직접 장소·일정 제안 |
| 카페 탐색 | NAVER 지도의 테마거리 위에서 매장을 탐색하고 메뉴 조회·주문·예약 |
| 제휴 매장 | 매장 목록과 내 위치 기준 거리 표시, 상세 정보 |
| 마이페이지 | 프로필 수정, 하트(재화) 구매, 프리미엄 패스, 주문 내역 |

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | ![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) |
| 스타일링 | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) ![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radixui&logoColor=white) |
| 라우팅 | ![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white) |
| 서버 상태 | ![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) |
| 클라이언트 상태 | ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logoColor=white) |
| 폼·검증 | ![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white) |
| 실시간 통신 | ![STOMP](https://img.shields.io/badge/STOMP%20(WebSocket)-010101?style=for-the-badge&logoColor=white) |
| 지도 | ![NAVER Maps](https://img.shields.io/badge/NAVER%20Maps-03C75A?style=for-the-badge&logo=naver&logoColor=white) |
| 코드 품질 | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |
| 배포 | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) |

## 실행 방법

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

`.env.development`에서 개발 환경 변수를 관리합니다. 개인 환경에서만 값을 바꾸려면 `.env.development.local`을 만들어 사용하세요. `*.local` 파일은 Git에 올라가지 않습니다.

| 변수                       | 필수 | 설명                                                            |
| -------------------------- | ---- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | O    | 백엔드 API 기본 주소. 개발 환경 기본값은 Vite 프록시용 `/api`   |
| `VITE_NAVER_MAP_CLIENT_ID` | 지도 | NAVER Maps Client ID. 없으면 지도 화면에 안내와 재시도 버튼 표시 |

```dotenv
# .env.development.local
VITE_NAVER_MAP_CLIENT_ID=발급받은_Client_ID
```

### 개발 서버 프록시

`vite.config.ts`에서 다음 경로를 `http://localhost:8080`으로 프록시합니다. 개발 중에는 CORS 설정 없이 백엔드와 통신할 수 있습니다.

- `/api`: REST API
- `/ws`: WebSocket

### 스크립트

| 명령어            | 설명                                            |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | 개발 서버 실행                                  |
| `npm run build`   | 타입 검사 후 프로덕션 빌드                      |
| `npm run preview` | 빌드 결과물을 로컬에서 미리보기                 |
| `npm run lint`    | ESLint 검사                                     |
| `npm run gen:api` | 백엔드 OpenAPI 명세로 `src/types/api.d.ts` 생성 |

`gen:api`는 백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.

<details>
<summary><b>NAVER 지도 설정 / 배포 환경 설정</b></summary>

#### NAVER 지도 Client ID 발급

1. [네이버 클라우드 콘솔](https://console.ncloud.com/)에서 **Application Services → Maps → Application**을 등록하고 **Dynamic Map**을 선택합니다.
2. Web 서비스 URL에 `http://localhost`, `http://127.0.0.1`, `https://desserting-web.vercel.app` 등 실제 사용하는 호스트를 등록합니다. (포트와 경로는 제외, Preview 주소도 쓸 경우 별도 등록)
3. 발급받은 **Client ID**를 `.env.development.local`과 Vercel 환경변수의 `VITE_NAVER_MAP_CLIENT_ID`에 설정합니다. **Client Secret은 프론트에 넣지 않습니다.**
4. 개발 서버를 재시작하고 Vercel은 다시 배포합니다.

SDK는 `ncpKeyId`로 로드합니다. 하단 탭이 있는 화면에서 SDK를 미리 준비하고, 실제 지도는 탐색 화면에서 생성합니다.

공식 문서: [Client ID 발급](https://navermaps.github.io/maps.js.en/docs/tutorial-1-Getting-Client-ID.html), [SDK 로드](https://navermaps.github.io/maps.js.en/docs/tutorial-2-Getting-Started.html), [Web 서비스 URL 등록](https://www.ncloud.com/support/faq/all/1047?searchKeyword=map)

#### Vercel 배포

개발 환경의 `/api`는 Vite 개발 서버 프록시용이라 배포 환경에서는 쓸 수 없습니다. Vercel 프로젝트의 환경 변수에 `VITE_API_BASE_URL`을 백엔드 전체 주소(예: `https://{백엔드 호스트}/api`)로 설정하세요. 실시간 채팅 주소는 이 값의 호스트를 기준으로 `wss://{백엔드 호스트}/ws`로 만들어집니다.

</details>

## 프로젝트 구조

화면(`pages`)은 **기능 단위 폴더**로 나누고, 서버 통신(`api`)·전역 상태(`stores`)·공용 코드(`components`, `lib`)는 역할별로 분리했습니다.

```
src
├── api                  # 서버 통신. 도메인(auth, chat, matching ...)별 파일 + 응답 타입
├── components           # 여러 화면이 함께 쓰는 공용 컴포넌트
│   └── ui               # shadcn/ui 기반 기본 UI 요소 (Button, Dialog, Input ...)
├── lib                  # 특정 화면에 속하지 않는 유틸 (axios 인스턴스, 날짜, 지도 SDK 로더)
├── pages                # 라우트 단위 화면. 기능별 폴더로 묶고, 그 기능에서만 쓰는 코드는 같은 폴더에 둠
│   ├── chat             #   채팅방·대화 요청 + useChatSocket(STOMP 연결 훅)
│   ├── explore          #   카페 지도·메뉴·주문·예약 + 지도 카메라/라벨 로직
│   ├── home / login / signup / matching / profile / stores / my / notifications
├── stores               # Zustand 전역 상태 (auth, matching, signup, cafe, notification)
├── App.tsx              # 라우트 정의
└── main.tsx             # QueryClient·Router 설정과 앱 진입점
```

`@` 별칭은 `src` 디렉터리를 가리킵니다. (예: `import { Button } from '@/components/ui/button'`)

UI 컴포넌트는 shadcn CLI로 추가합니다.

```bash
npx shadcn@latest add <component>
```

## 아키텍처와 설계 결정

### 계층과 데이터 흐름

<p align="center">
  <img src="https://github.com/user-attachments/assets/21b3fa38-cb41-4a77-ba9d-c3e96a6ca403" alt="계층과 데이터 흐름 " width="800" />
</p>

화면은 서버 주소·헤더·토큰 같은 통신 세부사항을 모르고, `api/*`의 함수와 타입만 사용합니다.

### 주요 설계 결정

| 결정                           | 이유                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 서버 상태 / 클라이언트 상태 분리 | 서버에서 온 데이터는 TanStack Query(캐싱·재시도), 화면 간 공유가 필요한 클라이언트 값(로그인 토큰, 가입 진행 상태, 매칭 조건)은 Zustand로 나눠 역할이 섞이지 않게 했습니다. |
| API 계층 분리              | 요청 함수와 응답 타입을 `api/<도메인>.ts`에 모아, 엔드포인트가 바뀌어도 수정 범위가 한 파일로 제한됩니다. 백엔드 OpenAPI 명세로 타입을 생성(`npm run gen:api`)해 명세와 어긋나는 것을 빌드에서 잡습니다. |
| 인증 처리를 axios 인터셉터에 집중 | 요청마다 토큰을 붙이고, 401이면 토큰을 재발급해 원 요청을 한 번만 재시도합니다. 동시에 여러 요청이 만료돼도 재발급 요청은 하나로 합쳐지고, 실패하면 로그아웃 처리합니다. |
| 에러는 HTTP 상태가 아닌 에러 코드로 분기 | 백엔드 공통 응답(`ApiResponse` / `ApiErrorBody`)의 `code`를 `getApiError`로 꺼내 쓰므로 화면마다 에러 파싱 로직이 중복되지 않습니다.                                  |
| 실시간 연결을 커스텀 훅으로 캡슐화 | `useChatSocket`이 STOMP 연결·구독·재연결·토큰 갱신을 담당하고, 채팅 화면은 `onMessage` 콜백과 연결 상태만 다룹니다.                                              |
| 기능 단위 폴더 + 코로케이션 | 한 기능에서만 쓰는 컴포넌트·훅·상수(예: `explore/cafeMapCamera.ts`, `chat/MessageItem.tsx`)는 해당 `pages/<기능>/` 안에 두어, 기능을 추가·삭제할 때 영향 범위가 폴더 안에 머뭅니다. |
| 외부 SDK 지연 로딩         | NAVER Maps SDK는 `lib/naverMaps.ts`의 TanStack Query 옵션으로 필요할 때 로드하고, 키 누락·로딩 실패 시 재시도 UI를 보여줍니다.                                                                  |
| 서버 코드 ↔ 화면 문구 매핑을 한곳에  | 디저트 종류 같은 서버 코드값은 `lib/dessert.ts`에서 화면용 이름으로 변환하고, 모르는 코드는 원문을 그대로 보여줘 서버가 값을 추가해도 화면이 깨지지 않습니다.              |

## 코드 작성 원칙

- 이름으로 의도를 드러냅니다. 컴포넌트·페이지는 `PascalCase`(`ChatRoomPage`), 훅은 `use` 접두사(`useChatSocket`), 서버 연동 타입은 도메인 용어(`RandomCandidate`, `ApiErrorBody`)를 그대로 씁니다.
- 주석은 "무엇"이 아니라 "왜"를 적습니다. 코드만으로 알기 어려운 서버 규칙·예외 처리 이유를 JSDoc/한 줄 주석으로 남깁니다. (예: 토큰 재발급을 한 번만 보내는 이유, `canRequest`가 false인 경우의 의미)
- 한 파일은 한 가지 책임만 갖습니다. 화면이 커지면 하위 컴포넌트·훅·순수 함수 파일로 분리합니다. (`ChatRoomPage` → `MessageItem`, `PlaceProposalSheet`, `useChatSocket`)
- 타입으로 계약을 표현합니다. `noUnusedLocals`/`noUnusedParameters` 등 TypeScript 검사를 켜고(`npm run build`에서 `tsc -b` 수행), 서버 응답은 인터페이스로 정의합니다.
- 스타일은 도구가 통일합니다. Prettier(세미콜론, 작은따옴표, Tailwind 클래스 정렬)와 ESLint(React Hooks 규칙 포함)를 사용합니다.

## 컨벤션과 협업 방식

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
| merge    | 브랜치 병합 (PR 번호 포함)            |

예시: `feat: 시작 화면 버튼 컴포넌트 추가`, `fix: API 요청 baseURL 누락 수정`, `merge: 회원가입 플로우 추가 #12`

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

예시: `feature/add-start-page`, `refactor/split-axios-instance`, `ci/add-lint-step`

### 협업 방식

1. `main`에서 브랜치 컨벤션에 맞게 작업 브랜치를 만듭니다.
2. 커밋 컨벤션에 맞춰 작업 내용을 커밋합니다. 커밋 전에 `npm run lint`를 실행합니다.
3. `main`을 대상으로 Pull Request를 작성합니다. PR 템플릿의 체크리스트를 확인해주세요.
4. PR을 올리면 CI(`npm ci` → `npm run build`)가 자동으로 실행됩니다. 빌드가 실패하면 원인을 해결한 뒤 다시 푸시해주세요.
5. 기본적으로 스스로 검토하되, 필요시 리뷰 요청 및 승인 후 머지합니다.
