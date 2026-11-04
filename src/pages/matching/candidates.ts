import matchPhoto from '@/assets/matching/match-photo.png';

export interface MatchCandidate {
  id: number;
  nickname: string;
  age: number;
  location: string;
  distanceKm: number;
  /** 첫 번째 항목을 "나와 같은/다른 ○○ 취향" 칩에 강조해서 보여준다 */
  interests: string[];
  bio: string;
  photo: string;
  gallery: string[];
}

// TODO: 매칭 API 연동 시 교체 (현재는 디자인 시안 기반 임시 데이터)
export const MOCK_CANDIDATES: MatchCandidate[] = [
  {
    id: 1,
    nickname: '크루아상러버',
    age: 26,
    location: '대구',
    distanceKm: 8,
    interests: ['베이커리', '카페투어'],
    bio: '바삭한 크루아상과 커피를 좋아해요.\n주말에 같이 카페 투어 해요!',
    photo: matchPhoto,
    gallery: [matchPhoto, matchPhoto],
  },
  {
    id: 2,
    nickname: '딸기케이크러버',
    age: 24,
    location: '대구',
    distanceKm: 5,
    interests: ['케이크', '카페투어'],
    bio: '딸기가 듬뿍 올라간 케이크를 좋아해요.\n주말에 같이 카페 투어 해요!',
    photo: matchPhoto,
    gallery: [matchPhoto, matchPhoto],
  },
  {
    id: 3,
    nickname: '빙수장인',
    age: 23,
    location: '경북',
    distanceKm: 10,
    interests: ['빙수&아이스크림', '커피'],
    bio: '여름엔 빙수, 겨울에도 빙수!\n맛있는 빙수집 알고 있으면 알려주세요.',
    photo: matchPhoto,
    gallery: [matchPhoto, matchPhoto],
  },
  {
    id: 4,
    nickname: '마카롱좋아',
    age: 25,
    location: '경산',
    distanceKm: 10,
    interests: ['베이커리', '커피'],
    bio: '알록달록한 마카롱을 모으는 게 취미예요.\n맛있는 디저트 카페 추천해 주세요!',
    photo: matchPhoto,
    gallery: [matchPhoto, matchPhoto],
  },
  {
    id: 5,
    nickname: '쿠키매니아',
    age: 27,
    location: '구미',
    distanceKm: 6,
    interests: ['베이커리', '카페투어'],
    bio: '갓 구운 쿠키에 우유 한 잔이면 행복해요.\n같이 쿠키 맛집 탐방 가요!',
    photo: matchPhoto,
    gallery: [matchPhoto, matchPhoto],
  },
];

export function findCandidate(id: number) {
  return MOCK_CANDIDATES.find((candidate) => candidate.id === id);
}
