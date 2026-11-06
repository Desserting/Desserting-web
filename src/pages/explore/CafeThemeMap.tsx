import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CafeStore, ThemeStreet } from '@/api/cafeBooking';
import mapImage from '@/assets/explore/map/theme-map.svg';
import streetPin from '@/assets/explore/map/street-pin.svg';
import storePin from '@/assets/explore/map/store-pin.svg';
import recenter from '@/assets/explore/map/recenter.svg';
import oliveLabel from '@/assets/explore/map/olive-label.svg';
import bakeryLabel from '@/assets/explore/map/bakeroom-label.svg';

const STREETS = [
  {
    match: '앞산',
    label: '앞산 카페거리',
    x: 24,
    y: 174,
    width: 235,
    pin: null,
  },
  {
    match: '수성못',
    label: '수성못 거리',
    x: 240,
    y: 78,
    width: 140,
    pin: { x: 295, y: 112 },
  },
  {
    match: '동성로',
    label: '동성로 거리',
    x: 248,
    y: 458,
    width: 140,
    pin: { x: 303, y: 493 },
  },
] as const;

/** 피그마의 개념 지도 좌표계. 실제 GPS 위치를 나타내는 지도는 아니다. */
export default function CafeThemeMap({
  areas,
  selected,
  stores,
  onSelect,
  onReset,
  from,
  bookingFrom,
}: {
  areas: ThemeStreet[];
  selected?: ThemeStreet;
  stores: CafeStore[];
  onSelect: (id: number) => void;
  onReset: () => void;
  from: string;
  bookingFrom?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.max(0.1, Math.min(width / 393, height / 449)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={viewport}
      className="relative min-h-0 flex-1 [scrollbar-width:none] overflow-x-hidden overflow-y-auto bg-[#f3f5f3] [&::-webkit-scrollbar]:hidden"
      aria-label="테마거리 개념 지도"
    >
      <div className="relative" style={{ height: 581 * scale }}>
        <div
          className="absolute top-0 left-1/2 h-[581px] w-[393px] origin-top"
          style={{ transform: `translateX(-50%) scale(${scale})` }}
        >
          <img
            src={mapImage}
            alt=""
            width={393}
            height={581}
            className="pointer-events-none absolute top-0 left-0 max-w-none"
          />
          {areas.find((area) => area.name.includes('앞산')) && (
            <button
              type="button"
              aria-label="앞산 카페거리 구역 선택"
              onClick={() => {
                const area = areas.find((item) => item.name.includes('앞산'));
                if (area) onSelect(area.id);
              }}
              className="focus-visible:outline-mint-deep absolute top-[235px] left-[43px] h-[214px] w-[245px] cursor-pointer rounded-xl focus-visible:outline-2"
            />
          )}
          {STREETS.map((street) => {
            const area = areas.find((item) => item.name.includes(street.match));
            const active = area !== undefined && area.id === selected?.id;
            return (
              <div key={street.match}>
                <button
                  type="button"
                  disabled={!area}
                  aria-pressed={active}
                  onClick={() => area && onSelect(area.id)}
                  className={`focus-visible:outline-mint-deep absolute cursor-pointer rounded-lg font-bold outline-offset-4 focus-visible:outline-2 disabled:cursor-default ${street.match === '앞산' ? 'text-center text-[22px]' : 'text-left text-[17px]'}`}
                  style={{ left: street.x, top: street.y, width: street.width }}
                >
                  {street.label}
                </button>
                {active && (
                  <span
                    className="text-mint-deep absolute rounded-full bg-[#d9f5eb] px-[9px] py-[5px] text-[10px] font-bold"
                    style={{
                      left: street.match === '앞산' ? 78 : street.x,
                      top: street.y + 32,
                    }}
                  >
                    ✓ 선택한 테마거리
                  </span>
                )}
                {street.pin && (
                  <button
                    type="button"
                    disabled={!area}
                    aria-label={`${street.label} 선택`}
                    onClick={() => area && onSelect(area.id)}
                    className="focus-visible:outline-mint-deep absolute cursor-pointer rounded-full focus-visible:outline-2"
                    style={{ left: street.pin.x, top: street.pin.y }}
                  >
                    <img
                      src={streetPin}
                      alt=""
                      width={27}
                      height={27}
                      className="max-w-none"
                    />
                  </button>
                )}
              </div>
            );
          })}
          {/* 도안의 두 핀은 선택한 거리의 대표 매장을 안내한다. */}
          {stores.slice(0, 2).map((store, index) => (
            <Link
              key={store.storeId}
              to={`/explore/cafes/${store.storeId}`}
              state={{ from, bookingFrom }}
              aria-label={`${store.name} 매장 상세보기`}
              className="focus-visible:outline-mint-deep absolute block h-[70px] w-[112px] rounded-xl focus-visible:outline-2"
              style={{
                left: index === 0 ? 92 : 164,
                top: index === 0 ? 310 : 343,
              }}
            >
              <img
                src={storePin}
                alt=""
                width={34}
                height={44}
                className={`absolute top-0 max-w-none ${index === 0 ? 'left-0' : 'left-[33px]'}`}
              />
              <span
                className={`absolute ${index === 0 ? 'top-0 left-6' : 'top-11 left-0'}`}
              >
                <img
                  src={index === 0 ? oliveLabel : bakeryLabel}
                  alt=""
                  width={index === 0 ? 68.5 : 55.5}
                  height={26}
                  className="max-w-none"
                />
                <span className="absolute top-[5px] left-2 max-w-[92px] rounded-full bg-white px-0.5 text-[11px] font-bold whitespace-nowrap text-[#142929]">
                  {store.name}
                </span>
              </span>
            </Link>
          ))}
          <span className="absolute top-[550px] left-4 text-[10px]">
            개념 지도
          </span>
          <button
            type="button"
            onClick={() => {
              viewport.current?.scrollTo({ top: 0, behavior: 'smooth' });
              onReset();
            }}
            aria-label="기본 테마거리로 돌아가기"
            className="focus-visible:outline-mint-deep absolute top-[522px] left-[332px] grid size-[43px] cursor-pointer place-items-center rounded-full bg-white focus-visible:outline-2"
          >
            <img
              src={recenter}
              alt=""
              width={25}
              height={25}
              className="max-w-none"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
