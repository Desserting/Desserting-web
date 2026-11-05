import { api, type ApiResponse } from '@/lib/axios';

export interface PremiumStatus {
  premium: boolean;
  expiresAt: string | null;
  monthlyPrice: number;
  periodDays: number;
  benefits: string[];
}

export interface PremiumSubscription {
  subscriptionId: number;
  amount: number;
  paymentMethod: 'CARD' | 'EASY_PAY';
  paymentKey: string;
  startedAt: string;
  expiresAt: string;
}

export const premiumKeys = {
  status: ['premium', 'status'] as const,
  subscriptions: ['premium', 'subscriptions'] as const,
};

export async function fetchPremiumStatus(): Promise<PremiumStatus> {
  const { data } = await api.get<ApiResponse<PremiumStatus>>('/v1/premium');
  return data.data;
}

/** 실제 청구 없이 프리미엄 이용권을 지급하는 모의 결제. */
export async function subscribePremium(request: {
  paymentMethod: PremiumSubscription['paymentMethod'];
}): Promise<PremiumSubscription> {
  const { data } = await api.post<ApiResponse<PremiumSubscription>>(
    '/v1/premium/subscribe',
    request,
  );
  return data.data;
}
