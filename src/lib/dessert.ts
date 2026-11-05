/** 서버의 디저트 종류 코드(DessertType)와 화면에 보여줄 이름 */
export const DESSERT_LABELS: Record<string, string> = {
  CAKE: '케이크',
  BAKERY: '베이커리',
  COOKIE_FINANCIER: '구움과자',
  TART_PIE: '타르트·파이',
  ICE_CREAM_BINGSU: '빙수·아이스크림',
  COFFEE: '커피',
  TEA_NON_COFFEE: '차·논커피',
  TRADITIONAL_KOREAN: '전통 디저트',
};

/** 알 수 없는 코드는 코드 그대로 보여준다 */
export const dessertLabel = (code: string) => DESSERT_LABELS[code] ?? code;
