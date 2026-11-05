import olivePhoto from '@/assets/cafes/olive.png';
import cakePhoto from '@/assets/cafes/strawberry-cake.png';
import bakeRoomPhoto from '@/assets/cafes/bake-room.png';
import type { CafeAreaId, CafeFilter } from './cafeAreas';

export type Cafe = {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  photo: string;
  photoAlt: string;
  listPhoto: string;
  areaId: CafeAreaId;
  filters: CafeFilter[];
  distanceKm: number;
  roundedThumbnail?: boolean;
};

// Figma preview data; replace this lookup with the cafe API when it is connected.
const CAFES: Cafe[] = [
  {
    id: 'olive',
    name: '카페 올리브',
    category: '디저트 · 카페',
    rating: 4.8,
    reviewCount: 928,
    address: '대구 남구 앞산로 123',
    photo: olivePhoto,
    photoAlt: '카페 올리브의 햇살이 들어오는 창가 좌석과 디저트 진열대',
    listPhoto: cakePhoto,
    areaId: 'apsan',
    filters: ['CAKE', 'COFFEE'],
    distanceKm: 0.8,
  },
  {
    id: 'bake-room',
    name: '베이크룸',
    category: '베이커리',
    photo: bakeRoomPhoto,
    photoAlt: '접시에 담긴 크루아상',
    listPhoto: bakeRoomPhoto,
    areaId: 'apsan',
    filters: ['BAKERY'],
    distanceKm: 1.2,
    roundedThumbnail: true,
  },
  {
    id: 'dessert-house',
    name: '디저트하우스',
    category: '디저트',
    photo: cakePhoto,
    photoAlt: '딸기가 올라간 생크림 케이크',
    listPhoto: cakePhoto,
    areaId: 'apsan',
    filters: ['CAKE'],
    distanceKm: 1.5,
  },
];

export function findCafe(id: string | undefined) {
  return CAFES.find((cafe) => cafe.id === id);
}

export function getCafesByArea(areaId: CafeAreaId) {
  return CAFES.filter((cafe) => cafe.areaId === areaId);
}
