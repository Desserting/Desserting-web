import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchPremiumStatus,
  premiumKeys,
  subscribePremium,
  type PremiumStatus,
  type PremiumSubscription,
} from '@/api/premium';
import { userKeys, type MyProfile } from '@/api/users';
import check from '@/assets/premium/check.svg';
import crown from '@/assets/premium/crown.svg';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiError } from '@/lib/axios';
import { parseServerDate } from '@/lib/datetime';

const PAYMENT_METHODS = [
  { value: 'CARD', label: '카드 결제 (모의)' },
  { value: 'EASY_PAY', label: '간편 결제 (모의)' },
] as const;

function formatExpiry(value: string) {
  const date = parseServerDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export default function PremiumPassPage() {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: premiumKeys.status,
    queryFn: fetchPremiumStatus,
    refetchOnMount: 'always',
  });
  const [showNotice, setShowNotice] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PremiumSubscription['paymentMethod']>('CARD');
  const submitting = useRef(false);
  const purchase = useMutation({
    mutationFn: subscribePremium,
    retry: false,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: userKeys.me }),
        queryClient.cancelQueries({ queryKey: premiumKeys.status }),
      ]);
      queryClient.setQueryData<MyProfile>(userKeys.me, (profile) =>
        profile ? { ...profile, isPremium: true } : profile,
      );
      queryClient.setQueryData<PremiumStatus>(premiumKeys.status, (current) =>
        current
          ? { ...current, premium: true, expiresAt: result.expiresAt }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      void queryClient.invalidateQueries({ queryKey: premiumKeys.status });
      void queryClient.invalidateQueries({
        queryKey: premiumKeys.subscriptions,
      });
    },
    onError: () => {
      // 응답이 끊겨도 이용권이 지급됐을 수 있으므로 현재 상태를 다시 조회한다.
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      void queryClient.invalidateQueries({ queryKey: premiumKeys.status });
      void queryClient.invalidateQueries({
        queryKey: premiumKeys.subscriptions,
      });
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const canPurchase = status.isSuccess && !status.data.premium;
  const submitPurchase = () => {
    if (!canPurchase || submitting.current || purchase.isSuccess) return;
    submitting.current = true;
    purchase.mutate({ paymentMethod });
  };

  return (
    <main className="premium-page text-ink flex min-h-dvh flex-col bg-white px-6">
      <PageHeader
        title="프리미엄 패스"
        backTo="/my"
        backLabel="마이페이지로 돌아가기"
      />
      <div className="premium-emblem bg-premium-emblem flex shrink-0 items-center justify-center self-center rounded-full">
        <img src={crown} alt="" />
      </div>
      {status.isPending && (
        <div role="status" className="premium-benefits flex flex-col">
          <span className="sr-only">프리미엄 정보를 불러오는 중이에요</span>
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="bg-chip h-[37px] animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}
      {status.isError && (
        <div role="alert" className="premium-benefits text-center">
          <p>프리미엄 정보를 불러오지 못했어요.</p>
          <Button
            type="button"
            variant="brand"
            disabled={status.isFetching}
            onClick={() => void status.refetch()}
            className="mt-3"
          >
            {status.isFetching ? '불러오는 중…' : '다시 시도'}
          </Button>
        </div>
      )}
      {status.isSuccess && (
        <ul
          aria-label="프리미엄 혜택"
          className="premium-benefits flex flex-col"
        >
          {status.data.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex min-h-[37px] items-center gap-4 px-2"
            >
              <img src={check} alt="" className="shrink-0" />
              <span className="text-[17px] leading-6 font-bold break-keep">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-6">
        {status.isSuccess && status.data.premium && (
          <p role="status" className="text-mint-deep mb-3 text-center text-sm">
            프리미엄 이용 중
            {status.data.expiresAt && (
              <>
                <br />
                <time dateTime={status.data.expiresAt}>
                  {formatExpiry(status.data.expiresAt)}
                </time>
                까지
              </>
            )}
          </p>
        )}
        <p className="bg-premium-price flex h-[70px] items-center justify-center rounded-[15px] text-[25px] font-bold">
          {status.isSuccess
            ? `월 ${status.data.monthlyPrice.toLocaleString('ko-KR')}원`
            : '—'}
        </p>
        <p className="text-my-muted mt-3 text-center text-xs leading-5">
          {status.isSuccess && `${status.data.periodDays}일 이용 · `}
          모의 결제로 실제 금액은 청구되지 않아요.
        </p>
        <Button
          variant="brand"
          size="xl"
          disabled={!canPurchase || purchase.isPending}
          onClick={() => {
            purchase.reset();
            setShowNotice(true);
          }}
          className="premium-purchase-button cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          {status.data?.premium ? '프리미엄 이용 중' : '구매하기'}
        </Button>
      </div>
      <Dialog
        open={showNotice}
        onOpenChange={(open) => {
          if (!purchase.isPending) setShowNotice(open);
        }}
      >
        <DialogContent
          className="max-w-[345px]"
          showCloseButton={!purchase.isPending}
        >
          <DialogTitle>
            {purchase.isSuccess
              ? '프리미엄 패스 구매 완료'
              : '프리미엄 패스 구매 확인'}
          </DialogTitle>
          {purchase.isSuccess ? (
            <>
              <DialogDescription>
                프리미엄 패스를 이용할 수 있어요.
                <br />
                이용 만료:{' '}
                <time dateTime={purchase.data.expiresAt}>
                  {formatExpiry(purchase.data.expiresAt)}
                </time>
                <br />
                모의 결제 금액: ₩{purchase.data.amount.toLocaleString('ko-KR')}
              </DialogDescription>
              <Button asChild variant="brand">
                <Link to="/my">마이페이지에서 확인</Link>
              </Button>
            </>
          ) : (
            <>
              <DialogDescription>
                {status.data?.periodDays}일 이용 · ₩
                {status.data?.monthlyPrice.toLocaleString('ko-KR')}
                <br />
                모의 결제로 진행되며 실제 금액은 청구되지 않아요.
              </DialogDescription>
              <fieldset disabled={purchase.isPending} className="grid gap-2">
                <legend className="mb-2 font-bold">결제 수단</legend>
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="premium-payment-method"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="peer sr-only"
                    />
                    <span className="border-line peer-checked:border-mint peer-checked:bg-premium-price peer-focus-visible:outline-mint-deep flex h-11 items-center rounded-xl border px-3 peer-focus-visible:outline-2">
                      {method.label}
                    </span>
                  </label>
                ))}
              </fieldset>
              {purchase.isError && (
                <p role="alert" className="text-destructive text-sm">
                  {getApiError(purchase.error)?.message ??
                    '결제 결과를 확인하지 못했어요. 마이페이지에서 프리미엄 상태를 확인해 주세요.'}
                </p>
              )}
              <Button
                type="button"
                variant="brand"
                disabled={
                  !canPurchase ||
                  purchase.isPending ||
                  (purchase.isError && !getApiError(purchase.error))
                }
                onClick={submitPurchase}
              >
                {purchase.isPending ? '결제 중…' : '모의 결제하기'}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary" disabled={purchase.isPending}>
                  닫기
                </Button>
              </DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
