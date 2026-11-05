import BottomNav from '@/components/BottomNav';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CAFE_AREAS } from './cafeAreas';
import CafePageHeader from './CafePageHeader';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

export default function CafeMapPage() {
  const bookingFrom = getBookingFrom(
    useLocation().state as CafeNavigationState | null,
  );
  return (
    <div className="text-ink flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex h-[clamp(112px,18dvh,151px)] shrink-0 items-end justify-center px-6 pb-[34px]">
        {bookingFrom ? (
          <div className="w-full">
            <CafePageHeader title="카페 지도" backTo={bookingFrom} />
          </div>
        ) : (
          <h1 className="text-center text-[23px] leading-[34px] font-bold">
            카페 지도
          </h1>
        )}
      </header>

      {/* Area links provide entry points until map hit areas are connected. */}
      <main
        aria-label="카페 지도 영역"
        className="bg-surface min-h-0 flex-1 overflow-y-auto p-6"
      >
        <nav aria-label="카페 거리 선택" className="flex flex-wrap gap-2">
          {CAFE_AREAS.map((area) => (
            <Button
              key={area.id}
              asChild
              variant="social"
              className="h-11 rounded-xl px-4 text-sm font-bold"
            >
              <Link
                to={`/explore/areas/${area.id}/cafes`}
                state={{ bookingFrom }}
              >
                {area.name}
              </Link>
            </Button>
          ))}
        </nav>
      </main>

      <div aria-hidden="true" className="h-3 shrink-0" />
      <BottomNav />
    </div>
  );
}
