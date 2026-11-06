import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, MapPin } from 'lucide-react';
import type { ThemeStreet } from '@/api/cafeBooking';
import { Button } from '@/components/ui/button';

/**
 * 지도 아래에 붙는 테마거리 선택 패널. 지도를 가리거나 조작을 막지 않도록
 * 오버레이 없이 지도 영역 위로 살짝 겹쳐 올라온다.
 */
export default function ThemeStreetDrawer({
  children,
}: {
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="선택한 테마거리"
      className="relative z-10 -mt-5 shrink-0 rounded-t-3xl bg-white px-5 pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? '테마거리 패널 접기' : '테마거리 패널 펼치기'}
        onClick={() => setExpanded((value) => !value)}
        className="focus-visible:outline-mint-deep mx-auto flex h-6 w-16 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2"
      >
        <span aria-hidden className="bg-hairline h-1 w-10 rounded-full" />
      </button>
      <h2 className="text-ink mt-1 text-xl leading-7 font-bold">
        테마거리를 선택하세요
      </h2>
      <div hidden={!expanded}>{children}</div>
    </section>
  );
}

function storeCountLabel(area: ThemeStreet, fallback: number | null) {
  const count = area.storeCount ?? fallback;
  return count === null ? '제휴매장 —' : `제휴매장 ${count}곳`;
}

export function ThemeStreetPicker({
  areas,
  selected,
  onSelect,
  listPath,
  selectedStoreCount = null,
  notice,
}: {
  areas: ThemeStreet[];
  selected?: ThemeStreet;
  onSelect: (id: number) => void;
  listPath: string;
  /** 거리 목록 응답에 매장 수가 없을 때 선택한 거리의 매장 목록 길이로 대신한다 */
  selectedStoreCount?: number | null;
  /** 선택한 거리의 매장 조회 오류 안내 */
  notice?: ReactNode;
}) {
  const list = useRef<HTMLUListElement>(null);
  const selectedId = selected?.id;

  useEffect(() => {
    // 지도에서 거리를 고르면 카드 목록도 같은 거리로 가로 스크롤한다.
    const container = list.current;
    const card = container?.querySelector<HTMLElement>(
      `[data-theme-id="${selectedId}"]`,
    );
    if (!container || !card) return;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    container.scrollTo({
      left: card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [selectedId]);

  return (
    <>
      <p className="text-my-muted mt-0.5 text-[13px] leading-5">
        거리를 누르면 지도가 이동하고, 제휴매장을 볼 수 있어요.
      </p>
      <ul
        ref={list}
        aria-label="테마거리 목록"
        className="relative -mx-5 mt-4 flex snap-x scroll-px-5 [scrollbar-width:none] gap-2.5 overflow-x-auto px-5 py-0.5 [&::-webkit-scrollbar]:hidden"
      >
        {areas.map((area) => {
          const active = area.id === selectedId;
          return (
            <li
              key={area.id}
              data-theme-id={area.id}
              className="w-[156px] shrink-0 snap-start"
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(area.id)}
                className={`focus-visible:outline-mint-deep flex h-[140px] w-full cursor-pointer flex-col items-start rounded-2xl border p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'border-mint-deep bg-mint-100 border-[1.5px]' : 'border-hairline bg-white'}`}
              >
                <span className="flex w-full items-start justify-between">
                  <span
                    className={`grid size-9 place-items-center rounded-full ${active ? 'bg-mint-deep text-white' : 'bg-mint-100 text-mint-deep'}`}
                  >
                    <MapPin aria-hidden className="size-[18px]" />
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="bg-mint text-mint-deep grid size-6 place-items-center rounded-full"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="text-ink mt-3 line-clamp-2 text-sm leading-5 font-bold break-keep">
                  {area.name}
                </span>
                <span className="text-mint-deep mt-auto text-xs font-bold">
                  {storeCountLabel(area, active ? selectedStoreCount : null)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {notice}
      {selected ? (
        <Button
          asChild
          variant="brand"
          className="mt-4 h-12 w-full rounded-2xl text-base font-bold"
        >
          <Link to={listPath}>{selected.name} 제휴매장 보기</Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="brand"
          disabled
          className="mt-4 h-12 w-full rounded-2xl text-base font-bold"
        >
          거리를 선택해 주세요
        </Button>
      )}
    </>
  );
}
