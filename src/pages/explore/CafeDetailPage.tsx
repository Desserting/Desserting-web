import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { findCafe } from './cafes';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';

export default function CafeDetailPage() {
  const { cafeId } = useParams();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const backTo =
    from?.startsWith('/') && !from.startsWith('//') ? from : '/home';
  const cafe = findCafe(cafeId);
  const [showOrderNotice, setShowOrderNotice] = useState(false);

  if (!cafe) {
    return <CafeNotFound backTo={backTo} />;
  }

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader title="매장 상세" backTo={backTo} />

      <section aria-labelledby="cafe-name" className="mt-[33px]">
        <img
          src={cafe.photo}
          alt={`${cafe.name}의 햇살이 들어오는 창가 좌석과 디저트 진열대`}
          className="aspect-[345/245] w-full rounded-[17px] object-cover"
        />
        <h2
          id="cafe-name"
          className="mt-7 text-[26px] leading-[38px] font-bold"
        >
          {cafe.name}
        </h2>
        <p className="mt-1.5 text-base leading-6">{cafe.category}</p>
        <p
          className="mt-[25px] text-lg leading-[27px] font-bold"
          aria-label={`평점 5점 만점에 ${cafe.rating}점, 리뷰 ${cafe.reviewCount.toLocaleString('ko-KR')}개`}
        >
          <span aria-hidden="true">
            ★ {cafe.rating.toFixed(1)} (
            {cafe.reviewCount.toLocaleString('ko-KR')})
          </span>
        </p>
        <p className="mt-[13px] text-base leading-6">
          <span aria-hidden="true">⌖ </span>
          {cafe.address}
        </p>
      </section>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button
          asChild
          variant="brand"
          size="xl"
          className="cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          <Link
            to={`/explore/cafes/${cafe.id}/reservation`}
            state={{ from: backTo }}
          >
            예약하기
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="xl"
          className="bg-cafe-action text-ink hover:bg-cafe-action/80 cursor-pointer rounded-[13px] pb-0 text-lg"
          onClick={() => setShowOrderNotice(true)}
        >
          메뉴 주문하기
        </Button>
      </div>

      <Dialog open={showOrderNotice} onOpenChange={setShowOrderNotice}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>메뉴 주문 안내</DialogTitle>
          <DialogDescription>
            {cafe.name} 메뉴 주문 기능은 준비 중이에요.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
