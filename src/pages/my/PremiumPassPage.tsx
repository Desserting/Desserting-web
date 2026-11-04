import { useState } from 'react';
import { Link } from 'react-router-dom';
import back from '@/assets/premium/back.svg';
import check from '@/assets/premium/check.svg';
import crown from '@/assets/premium/crown.svg';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const BENEFITS = [
  '원하는 상대에게 직접 대화 요청',
  '하트 차감 없이 연결 가능',
  '나를 좋아한 사람 확인',
  '프로필 상단 노출',
];

export default function PremiumPassPage() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <main className="premium-page text-ink flex min-h-dvh flex-col bg-white px-6">
      <header className="relative flex h-8 shrink-0 items-center justify-center">
        <Link
          to="/my"
          aria-label="마이페이지로 돌아가기"
          className="focus-visible:outline-mint-deep absolute -left-2 flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
        >
          <img src={back} alt="" />
        </Link>
        <h1 className="text-[23px] leading-8 font-bold">프리미엄 패스</h1>
      </header>
      <div className="premium-emblem bg-premium-emblem flex shrink-0 items-center justify-center self-center rounded-full">
        <img src={crown} alt="" />
      </div>
      <ul aria-label="프리미엄 혜택" className="premium-benefits flex flex-col">
        {BENEFITS.map((benefit) => (
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
      <div className="mt-auto pt-6">
        <p className="bg-premium-price flex h-[70px] items-center justify-center rounded-[15px] text-[25px] font-bold">
          월 9,900원
        </p>
        <Button
          variant="brand"
          size="xl"
          onClick={() => setShowNotice(true)}
          className="premium-purchase-button cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          구매하기
        </Button>
      </div>
      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>프리미엄 패스 구매 안내</DialogTitle>
          <DialogDescription>
            프리미엄 패스는 월 9,900원이에요.
            <br />
            결제 기능은 준비 중이에요. 현재 결제되거나 구독이 시작되지 않습니다.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
