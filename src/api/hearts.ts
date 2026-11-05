import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

export type HeartHistoryType =
  | 'WELCOME_BONUS'
  | 'DAILY_CHARGE'
  | 'REQUEST_DEDUCT'
  | 'REQUEST_REFUND'
  | 'PURCHASE'
  | 'ADMIN_GRANT';

export interface HeartHistoryItem {
  id: number;
  /** 변동 수량. 차감은 음수 */
  amount: number;
  balanceAfter: number;
  type: HeartHistoryType;
  /** 상대 닉네임이 들어간 안내 문구 (차감·거절 환불·만료 환불) */
  description?: string;
  createdAt: string;
}

export const heartKeys = {
  history: ['hearts', 'history'] as const,
  packages: ['hearts', 'packages'] as const,
  purchases: ['hearts', 'purchases'] as const,
};

export type HeartPackageCode = 'HEARTS_5' | 'HEARTS_10' | 'HEARTS_30';
export type HeartPaymentMethod = 'CARD' | 'EASY_PAY';

export interface HeartPackage {
  packageCode: HeartPackageCode;
  quantity: number;
  unitPrice: number;
  price: number;
}

export interface HeartPurchase {
  purchaseId: number;
  packageCode: HeartPackageCode;
  quantity: number;
  unitPrice: number;
  amount: number;
  paymentMethod: HeartPaymentMethod;
  paymentKey: string;
  heartCountAfter: number;
  paidAt: string;
}

export async function fetchHeartPackages(): Promise<HeartPackage[]> {
  const { data } = await api.get<ApiResponse<HeartPackage[]>>(
    '/v1/hearts/packages',
  );
  return data.data;
}

/** 실제 청구 없이 하트를 충전하는 모의 결제. 자동 재시도하지 않는다. */
export async function purchaseHearts(request: {
  packageCode: HeartPackageCode;
  paymentMethod: HeartPaymentMethod;
}): Promise<HeartPurchase> {
  const { data } = await api.post<ApiResponse<HeartPurchase>>(
    '/v1/hearts/purchase',
    request,
  );
  return data.data;
}

export async function fetchHeartHistory(): Promise<HeartHistoryItem[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/hearts/history');
  return toList<HeartHistoryItem>(data.data, ['history', 'content', 'items']);
}

/** description이 없을 때 쓰는 기본 문구 */
export const HEART_TYPE_LABELS: Record<HeartHistoryType, string> = {
  WELCOME_BONUS: '가입 선물로 하트를 받았어요',
  DAILY_CHARGE: '오늘의 하트가 충전됐어요',
  REQUEST_DEDUCT: '대화 요청으로 하트를 사용했어요',
  REQUEST_REFUND: '하트가 환불됐어요',
  PURCHASE: '하트를 구매했어요',
  ADMIN_GRANT: '운영자가 하트를 지급했어요',
};
