import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchHeartPackages,
  heartKeys,
  purchaseHearts,
  type HeartPackageCode,
  type HeartPaymentMethod,
} from '@/api/hearts';
import { fetchMe, userKeys, type MyProfile } from '@/api/users';
import heart from '@/assets/hearts/heart.svg';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getApiError } from '@/lib/axios';

const PAYMENT_METHODS = [
  { value: 'CARD', label: '카드 결제 (모의)' },
  { value: 'EASY_PAY', label: '간편 결제 (모의)' },
] as const;

export default function HeartPurchasePage() {
  const queryClient = useQueryClient();
  const packages = useQuery({
    queryKey: heartKeys.packages,
    queryFn: fetchHeartPackages,
  });
  const me = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  const [selectedCode, setSelectedCode] = useState<HeartPackageCode | null>(
    null,
  );
  const selected =
    packages.data?.find((pack) => pack.packageCode === selectedCode) ??
    packages.data?.[0];
  const [paymentMethod, setPaymentMethod] =
    useState<HeartPaymentMethod>('CARD');
  const [showNotice, setShowNotice] = useState(false);
  const submitting = useRef(false);
  const purchase = useMutation({
    mutationFn: purchaseHearts,
    retry: false,
    onSuccess: async (result) => {
      await queryClient.cancelQueries({ queryKey: userKeys.me });
      queryClient.setQueryData<MyProfile>(userKeys.me, (profile) =>
        profile ? { ...profile, heartCount: result.heartCountAfter } : profile,
      );
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      void queryClient.invalidateQueries({ queryKey: heartKeys.history });
      void queryClient.invalidateQueries({ queryKey: heartKeys.purchases });
    },
    onError: () => {
      // 응답이 끊긴 경우에도 이미 충전됐을 수 있으므로 잔액을 다시 조회한다.
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      void queryClient.invalidateQueries({ queryKey: heartKeys.history });
      void queryClient.invalidateQueries({ queryKey: heartKeys.purchases });
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const canPurchase =
    !!selected && packages.isSuccess && me.isSuccess && !me.data.isPremium;
  const submitPurchase = () => {
    if (!selected || !canPurchase || submitting.current || purchase.isSuccess)
      return;
    submitting.current = true;
    purchase.mutate({ packageCode: selected.packageCode, paymentMethod });
  };

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
      <PageHeader
        title="하트 구매"
        backTo="/my"
        backLabel="마이페이지로 돌아가기"
      />

      <fieldset
        disabled={purchase.isPending}
        className="mt-[clamp(32px,7.7dvh,65px)] flex flex-col gap-5"
      >
        <legend className="sr-only">구매할 하트 수량</legend>
        {packages.isPending && (
          <div role="status" className="grid gap-5">
            <span className="sr-only">하트 상품을 불러오는 중이에요</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                aria-hidden="true"
                className="bg-chip h-[98px] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        )}
        {packages.isError && (
          <div role="alert" className="text-center">
            <p>하트 상품을 불러오지 못했어요.</p>
            <Button
              type="button"
              variant="brand"
              disabled={packages.isFetching}
              onClick={() => void packages.refetch()}
              className="mt-3"
            >
              {packages.isFetching ? '불러오는 중…' : '다시 시도'}
            </Button>
          </div>
        )}
        {packages.isSuccess && packages.data.length === 0 && (
          <p className="text-my-muted text-center">
            구매 가능한 하트 상품이 없어요.
          </p>
        )}
        {!packages.isError &&
          packages.data?.map((pack) => (
            <label
              key={pack.packageCode}
              className="relative block cursor-pointer"
            >
              <input
                type="radio"
                name="heart-package"
                value={pack.packageCode}
                checked={selected?.packageCode === pack.packageCode}
                onChange={() => setSelectedCode(pack.packageCode)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'peer-focus-visible:outline-mint-deep flex h-[98px] items-center gap-[18px] rounded-2xl border-[1.5px] px-[17px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4',
                  selected?.packageCode === pack.packageCode
                    ? 'border-mint bg-heart-selected'
                    : 'border-heart-border hover:bg-mint-50 bg-white',
                )}
              >
                <img src={heart} alt="" className="shrink-0" />
                <span className="text-[23px] font-bold">{pack.quantity}개</span>
                <span className="ml-auto text-xl font-bold">
                  ₩{pack.price.toLocaleString('ko-KR')}
                </span>
              </span>
            </label>
          ))}
      </fieldset>

      {me.isError && (
        <div role="alert" className="mt-4 text-sm">
          <p>계정 정보를 불러오지 못했어요.</p>
          <Button
            type="button"
            variant="link"
            disabled={me.isFetching}
            onClick={() => void me.refetch()}
          >
            {me.isFetching ? '불러오는 중…' : '다시 시도'}
          </Button>
        </div>
      )}
      {me.data?.isPremium && (
        <p role="status" className="text-mint-deep mt-4 text-sm">
          프리미엄 회원은 하트가 무제한으로 제공되어 구매할 필요가 없어요.
        </p>
      )}

      <p className="text-heart-muted mt-12 text-[13px] leading-[18px]">
        * 실제 결제 없이 하트가 지급되는 모의 결제입니다.
        <br />
        <span className="pl-1">실제 금액은 청구되지 않아요.</span>
      </p>
      <div className="mt-auto pt-8 pb-[22px]">
        <Button
          variant="brand"
          size="xl"
          disabled={!canPurchase || purchase.isPending}
          onClick={() => {
            purchase.reset();
            setShowNotice(true);
          }}
          className="cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          구매하기
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
            {purchase.isSuccess ? '하트 충전 완료' : '하트 구매 확인'}
          </DialogTitle>
          {purchase.isSuccess ? (
            <>
              <DialogDescription>
                하트 {purchase.data.quantity}개가 충전됐어요.
                <br />
                보유 하트: {purchase.data.heartCountAfter}개
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
                하트 {selected?.quantity}개 · ₩
                {selected?.price.toLocaleString('ko-KR')}
                <br />
                모의 결제로 진행되며 실제 금액은 청구되지 않아요.
              </DialogDescription>
              <fieldset disabled={purchase.isPending} className="grid gap-2">
                <legend className="mb-2 font-bold">결제 수단</legend>
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="heart-payment-method"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="peer sr-only"
                    />
                    <span className="border-line peer-checked:border-mint peer-checked:bg-heart-selected peer-focus-visible:outline-mint-deep flex h-11 items-center rounded-xl border px-3 peer-focus-visible:outline-2">
                      {method.label}
                    </span>
                  </label>
                ))}
              </fieldset>
              {purchase.isError && (
                <p role="alert" className="text-destructive text-sm">
                  {getApiError(purchase.error)?.message ??
                    '결제 결과를 확인하지 못했어요. 마이페이지에서 잔액을 확인해 주세요.'}
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
