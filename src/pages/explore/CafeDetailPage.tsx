import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cafeKeys, fetchCafeDetail, positiveId } from '@/api/cafeBooking';
import { dessertLabel } from '@/lib/dessert';
import { Button } from '@/components/ui/button';
import CafeImage from './CafeImage';
import CafeRequestState from './CafeRequestState';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

export default function CafeDetailPage() {
  const { cafeId } = useParams();
  const storeId = positiveId(cafeId);
  const detail = useQuery({
    queryKey: cafeKeys.detail(storeId),
    queryFn: () => fetchCafeDetail(storeId),
    enabled: !!storeId,
  });
  const location = useLocation();
  const navigationState = location.state as CafeNavigationState | null;
  const from = navigationState?.from;
  const bookingFrom = getBookingFrom(navigationState);
  const backTo =
    from?.startsWith('/') && !from.startsWith('//') ? from : '/home';
  const cafe = detail.data;

  if (!storeId) {
    return <CafeNotFound backTo={backTo} />;
  }

  if (detail.isPending || detail.isError)
    return (
      <main className="text-ink min-h-dvh px-6 pt-16">
        <CafePageHeader
          title="매장 상세"
          backTo={backTo}
          backState={{ bookingFrom }}
        />
        <CafeRequestState
          pending={detail.isPending}
          error={detail.error}
          onRetry={() => void detail.refetch()}
        />
      </main>
    );
  if (!cafe) return <CafeNotFound backTo={backTo} />;

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="매장 상세"
        backTo={backTo}
        backState={{ bookingFrom }}
      />

      <section aria-labelledby="cafe-name" className="mt-[33px]">
        <CafeImage
          src={cafe.coverImageUrl}
          alt={`${cafe.name} 매장`}
          className="aspect-[345/245] w-full rounded-[17px] object-cover"
        />
        <h2
          id="cafe-name"
          className="mt-7 text-[26px] leading-[38px] font-bold"
        >
          {cafe.name}
        </h2>
        <p className="mt-1.5 text-base leading-6">
          {cafe.dessertTypes.map(dessertLabel).join(' · ')}
        </p>
        <p className="mt-[13px] text-base leading-6">
          <span aria-hidden="true">⌖ </span>
          {cafe.address ?? '주소 정보를 준비 중이에요.'}
        </p>
        {cafe.businessHours && (
          <p className="mt-3 text-base">영업시간 · {cafe.businessHours}</p>
        )}
        {cafe.contact && (
          <p className="mt-3 text-base">전화 · {cafe.contact}</p>
        )}
        {cafe.partnerDiscountNotice && (
          <p className="text-mint-deep mt-4 text-sm">
            {cafe.partnerDiscountNotice}
          </p>
        )}
      </section>

      {bookingFrom && (
        <div className="mt-auto pt-8">
          <Button
            asChild
            variant="brand"
            size="xl"
            className="cursor-pointer rounded-[13px] pb-0 text-lg"
          >
            <Link
              to={`/explore/cafes/${cafe.storeId}/reservation`}
              state={{ from: backTo, bookingFrom }}
            >
              예약하기
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
