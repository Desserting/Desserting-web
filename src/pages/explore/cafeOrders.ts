// Static preview receipt from Figma, not a submitted order or live store status.
export const PREVIEW_CAFE_ORDER = {
  id: 'D25891',
  cafeId: 'olive',
  steps: [
    { label: '주문 접수', time: '16:10', displayTime: '오후 4:10' },
    { label: '준비 중', time: '16:18', displayTime: '오후 4:18' },
    { label: '준비 완료', time: '16:30', displayTime: '오후 4:30' },
  ],
} as const;
