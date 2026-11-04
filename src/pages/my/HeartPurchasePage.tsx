import { useState } from 'react';
import { Link } from 'react-router-dom';
import back from '@/assets/hearts/back.svg';
import heart from '@/assets/hearts/heart.svg';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const PACKAGES = [
  { count: 5, price: 1000 },
  { count: 10, price: 2000 },
  { count: 30, price: 5500 },
] as const;

export default function HeartPurchasePage() {
  const [selected, setSelected] = useState<(typeof PACKAGES)[number]>(
    PACKAGES[0],
  );
  const [showNotice, setShowNotice] = useState(false);

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,9dvh,76px)] pb-[max(24px,env(safe-area-inset-bottom))]">
      <header className="relative flex h-8 shrink-0 items-center justify-center">
        <Link
          to="/my"
          aria-label="마이페이지로 돌아가기"
          className="focus-visible:outline-mint-deep absolute -left-2 flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
        >
          <img src={back} alt="" />
        </Link>
        <h1 className="text-[23px] leading-8 font-bold">하트 구매</h1>
      </header>

      <fieldset className="mt-[clamp(32px,7.7dvh,65px)] flex flex-col gap-5">
        <legend className="sr-only">구매할 하트 수량</legend>
        {PACKAGES.map((pack) => (
          <label key={pack.count} className="relative block cursor-pointer">
            <input
              type="radio"
              name="heart-package"
              value={pack.count}
              checked={selected.count === pack.count}
              onChange={() => setSelected(pack)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'peer-focus-visible:outline-mint-deep flex h-[98px] items-center gap-[18px] rounded-2xl border-[1.5px] px-[17px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4',
                selected.count === pack.count
                  ? 'border-mint bg-heart-selected'
                  : 'border-heart-border hover:bg-mint-50 bg-white',
              )}
            >
              <img src={heart} alt="" className="shrink-0" />
              <span className="text-[23px] font-bold">{pack.count}개</span>
              <span className="ml-auto text-xl font-bold">
                ₩{pack.price.toLocaleString('ko-KR')}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <p className="text-heart-muted mt-12 text-[13px] leading-[18px]">
        * 하트 가격은 추후 변경될 수 있습니다.
        <br />
        <span className="pl-1">(200원 또는 500원당 변동 예정)</span>
      </p>
      <div className="mt-auto pt-8 pb-[22px]">
        <Button
          variant="brand"
          size="xl"
          onClick={() => setShowNotice(true)}
          className="cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          구매하기
        </Button>
      </div>

      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>하트 구매 안내</DialogTitle>
          <DialogDescription>
            하트 {selected.count}개 · ₩{selected.price.toLocaleString('ko-KR')}
            을 선택하셨어요.
            <br />
            결제 기능은 준비 중이에요. 결제되거나 하트가 지급되지 않습니다.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
