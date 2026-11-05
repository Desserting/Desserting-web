import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Info, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchRandomMatch } from '@/api/matching';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiError } from '@/lib/axios';
import { cn } from '@/lib/utils';
import {
  DISTANCES,
  LIVING_AREAS,
  REGIONS,
  useMatchingStore,
} from '@/stores/matchingStore';
import {
  getLocationPermission,
  saveMyLocation,
  toMatchParams,
} from './matchRequest';

interface SectionTitleProps {
  step: number;
  children: ReactNode;
  aside?: ReactNode;
}

function SectionTitle({ step, children, aside }: SectionTitleProps) {
  return (
    <h2 className="flex items-center gap-2 text-[17px] leading-6 font-bold">
      <span
        aria-hidden
        className="bg-mint-100 text-mint-deep flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {step}
      </span>
      {children}
      {aside && (
        <span className="text-mint-deep ml-auto text-sm font-bold">
          {aside}
        </span>
      )}
    </h2>
  );
}

interface DistanceSliderProps {
  value: string;
  onChange: (value: string) => void;
}

function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const last = DISTANCES.length - 1;
  const index = Math.max(
    0,
    DISTANCES.findIndex((distance) => distance.value === value),
  );
  const percent = (i: number) => `${(i / last) * 100}%`;

  const selectByX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = Math.round(ratio * last);
    if (next !== index) onChange(DISTANCES[next].value);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    selectByX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      selectByX(event.clientX);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next += 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next -= 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    next = Math.min(last, Math.max(0, next));
    if (next !== index) onChange(DISTANCES[next].value);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="매칭 거리"
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={index}
      aria-valuetext={DISTANCES[index].summary}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className="focus-visible:outline-mint-deep relative mx-6 mt-1 h-16 cursor-pointer touch-none rounded-md select-none focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="bg-chip absolute inset-x-0 top-[22px] h-1.5 rounded-full" />
      <div
        className="bg-mint absolute top-[22px] left-0 h-1.5 rounded-full transition-[width]"
        style={{ width: percent(index) }}
      />
      <div
        aria-hidden
        className="bg-mint border-mint-deep absolute top-[13px] size-6 -translate-x-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1.5px_var(--color-mint-deep)] transition-[left]"
        style={{ left: percent(index) }}
      />
      {DISTANCES.map(({ value: tick, label }, i) => (
        <span
          key={tick}
          aria-hidden
          className={cn(
            'absolute top-11 -translate-x-1/2 text-xs whitespace-nowrap',
            i === index ? 'text-mint-deep font-bold' : 'text-my-muted',
          )}
          style={{ left: percent(i) }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function MatchingSettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = useMatchingStore((state) => state.filter);
  const setFilter = useMatchingStore((state) => state.setFilter);
  const startMatching = useMatchingStore((state) => state.startMatching);
  const typeParam = searchParams.get('type');

  const locationPrompted = useMatchingStore((state) => state.locationPrompted);
  const setLocationPrompted = useMatchingStore(
    (state) => state.setLocationPrompted,
  );
  const [locationOpen, setLocationOpen] = useState(false);

  // 위치를 쓰기로 했으면 서버에 저장한 뒤, 첫 상대를 받아 카드 화면으로 넘어간다
  const start = useMutation({
    mutationFn: async (useLocation: boolean) => {
      if (useLocation) await saveMyLocation();
      return fetchRandomMatch(toMatchParams(filter));
    },
    onSuccess: (first) => {
      startMatching(first);
      navigate('/matching/cards');
    },
  });

  // 위치 권한을 아직 묻지 않았으면 브라우저 권한 창 전에 우리 안내를 먼저 보여준다
  const handleStart = async () => {
    const permission = await getLocationPermission();
    if (permission === 'prompt' && !locationPrompted) {
      setLocationOpen(true);
      return;
    }
    start.mutate(permission === 'granted');
  };

  const answerLocation = (allow: boolean) => {
    setLocationPrompted();
    setLocationOpen(false);
    start.mutate(allow);
  };

  useEffect(() => {
    if (typeParam === 'same' || typeParam === 'different') {
      setFilter({ type: typeParam });
    }
  }, [typeParam, setFilter]);

  const areas = LIVING_AREAS[filter.region];
  const selectedArea = areas.find((area) => area.id === filter.area);
  const selectedDistance = DISTANCES.find(
    (distance) => distance.value === filter.distance,
  );
  const isUnlimited = filter.distance === 'unlimited';

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px]">
      <BackButton to="/home" />
      <h1 className="text-center text-[23px] leading-6 font-bold">매칭 설정</h1>

      <section className="mt-5">
        <SectionTitle step={1}>지역</SectionTitle>
        <div
          role="radiogroup"
          aria-label="지역 선택"
          className="bg-chip mt-2.5 grid grid-cols-2 gap-[3px] rounded-[14px] p-[3px]"
        >
          {REGIONS.map((region) => {
            const selected = filter.region === region;
            return (
              <button
                key={region}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setFilter({ region, area: LIVING_AREAS[region][0].id })
                }
                className={cn(
                  'h-9 cursor-pointer rounded-[11px] text-sm transition-colors',
                  selected ? 'bg-mint font-bold' : 'text-ink-muted',
                )}
              >
                {region}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle step={2}>생활권</SectionTitle>
        <div
          role="radiogroup"
          aria-label="생활권 선택"
          className="mt-2.5 flex flex-col gap-2"
        >
          {areas.map(({ id, label, districts }) => {
            const selected = filter.area === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFilter({ area: id })}
                className={cn(
                  'flex min-h-[58px] cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-4 py-2.5 text-left transition-colors',
                  selected ? 'bg-mint border-mint' : 'border-field bg-white',
                )}
              >
                <span className="flex flex-col">
                  <span className="text-base leading-5 font-bold">{label}</span>
                  {districts && (
                    <span
                      className={cn(
                        'text-[13px] leading-4',
                        selected ? 'text-mint-deep' : 'text-my-muted',
                      )}
                    >
                      {districts}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'ml-auto flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                    selected
                      ? 'text-mint-deep border-white bg-white'
                      : 'border-field',
                  )}
                >
                  {selected && <Check className="size-4" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle
          step={3}
          aside={isUnlimited ? '생활권 내 무제한' : selectedDistance?.summary}
        >
          매칭 거리
        </SectionTitle>
        <DistanceSlider
          value={filter.distance}
          onChange={(distance) => setFilter({ distance })}
        />
        {isUnlimited && (
          <p className="bg-mint-100 text-mint-deep -mt-1 flex items-start gap-2 rounded-[12px] px-3 py-2.5 text-[13px] leading-5">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              {selectedArea?.label} 안에서는 거리 제한 없이 매칭돼요. 다른
              생활권은 포함되지 않아요.
            </span>
          </p>
        )}
      </section>

      <div className="border-hairline mt-auto border-t pt-3">
        <p
          aria-label="선택된 조건"
          className="mb-2.5 flex items-baseline justify-between gap-3"
        >
          <span className="text-my-muted shrink-0 text-xs">선택한 조건</span>
          <span className="text-right text-[13px] font-bold">
            {selectedArea?.label} · {selectedDistance?.summary}
          </span>
        </p>
        {start.isError && (
          <p role="alert" className="text-destructive mb-2 text-[13px]">
            {getApiError(start.error)?.message ??
              '매칭을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.'}
          </p>
        )}
        <Button
          type="button"
          variant="brand"
          size="xl"
          disabled={start.isPending}
          onClick={() => void handleStart()}
          className="mb-10"
        >
          {start.isPending ? '상대를 찾는 중...' : '매칭 시작'}
        </Button>
      </div>

      <Dialog open={locationOpen} onOpenChange={setLocationOpen}>
        <DialogContent
          showCloseButton={false}
          className="text-ink max-w-[calc(100%-48px)] gap-0 rounded-3xl bg-white p-6 text-center sm:max-w-[340px]"
        >
          <div className="bg-mint-100 mx-auto flex size-16 items-center justify-center rounded-full">
            <MapPin
              aria-hidden
              className="text-mint-deep size-8 stroke-[1.8]"
            />
          </div>
          <DialogTitle className="mt-5 text-[19px] leading-7 font-bold">
            내 위치를 사용할까요?
          </DialogTitle>
          <DialogDescription className="text-ink-muted mt-2 text-[15px] leading-6 break-keep">
            가까운 사람을 찾기 위해 현재 위치를 사용해요. 상대에게는 정확한 위치
            대신 &lsquo;3km 이내&rsquo;처럼 대략적인 거리만 보여요.
          </DialogDescription>
          <p className="bg-chip text-ink-muted mt-4 rounded-[12px] px-3 py-2 text-[13px] leading-5 break-keep">
            허용하지 않으면 선택한 지역을 기준으로 찾아요.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="xl"
              onClick={() => answerLocation(false)}
              className="bg-chip text-ink hover:bg-chip/80 h-12 rounded-xl pb-0 text-base"
            >
              허용 안 함
            </Button>
            <Button
              type="button"
              variant="brand"
              size="xl"
              onClick={() => answerLocation(true)}
              className="h-12 rounded-xl pb-0 text-base"
            >
              허용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
