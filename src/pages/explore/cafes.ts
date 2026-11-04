import olivePhoto from '@/assets/cafes/olive.png';

export type Cafe = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  photo: string;
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
  },
];

export function findCafe(id: string | undefined) {
  return CAFES.find((cafe) => cafe.id === id);
}
