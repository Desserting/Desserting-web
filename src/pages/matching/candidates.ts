import matchPhoto from '@/assets/matching/match-photo.png';

export interface MatchCandidate {
  id: number;
  nickname: string;
  age: number;
  location: string;
  distanceKm: number;
  interests: string[];
  photo: string;
}

// TODO: 매칭 API 연동 시 교체 (현재는 디자인 시안 기반 임시 데이터)
export const MOCK_CANDIDATES: MatchCandidate[] = [
  {
    id: 1,
    nickname: '딸기케이크러버',
    age: 24,
    location: '대구',
    distanceKm: 5,
    interests: ['케이크', '마카롱', '카페투어'],
    photo: matchPhoto,
  },
  {
    id: 2,
    nickname: '마카롱수집가',
    age: 26,
    location: '대구',
    distanceKm: 8,
    interests: ['마카롱', '쿠키', '타르트'],
    photo: matchPhoto,
  },
  {
    id: 3,
    nickname: '빙수장인',
    age: 23,
    location: '경북',
    distanceKm: 10,
    interests: ['빙수', '음료', '카페투어'],
    photo: matchPhoto,
  },
];
