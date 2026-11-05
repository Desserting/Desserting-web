import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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

  if (!cafe) {
    return <CafeNotFound backTo={backTo} />;
  }

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader title="매장 상세" backTo={backTo} />

      <section aria-labelledby="cafe-name" className="mt-[33px]">
        <img
          src={cafe.photo}
          alt={cafe.photoAlt}
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
          aria-label={
            cafe.rating !== undefined && cafe.reviewCount !== undefined
              ? `평점 5점 만점에 ${cafe.rating}점, 리뷰 ${cafe.reviewCount.toLocaleString('ko-KR')}개`
              : undefined
          }
        >
          <span
            aria-hidden={
              cafe.rating !== undefined && cafe.reviewCount !== undefined
                ? true
                : undefined
            }
          >
            {cafe.rating !== undefined && cafe.reviewCount !== undefined
              ? `★ ${cafe.rating.toFixed(1)} (${cafe.reviewCount.toLocaleString('ko-KR')})`
              : '평점 정보를 준비 중이에요.'}
          </span>
        </p>
        <p className="mt-[13px] text-base leading-6">
          <span aria-hidden="true">⌖ </span>
          {cafe.address ?? '주소 정보를 준비 중이에요.'}
        </p>
      </section>

      <div className="mt-auto pt-8">
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
      </div>
    </main>
  );
}
