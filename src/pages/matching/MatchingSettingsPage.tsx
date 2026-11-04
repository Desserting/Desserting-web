import { useEffect, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DISTANCES,
  LIVING_AREAS,
  REGIONS,
  useMatchingStore,
} from '@/stores/matchingStore';

interface RadioOptionProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  children: ReactNode;
}

function RadioOption({
  name,
  checked,
  onChange,
  className,
  children,
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-[9px] pl-0.5',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="border-ink-muted/40 peer-checked:bg-mint peer-checked:border-mint peer-focus-visible:outline-mint-deep after:bg-ink relative size-[22px] shrink-0 rounded-full border-[1.5px] bg-white transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 after:absolute after:top-1/2 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:opacity-0 peer-checked:after:opacity-100"
      />
      {children}
    </label>
  );
}

export default function MatchingSettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = useMatchingStore((state) => state.filter);
  const setFilter = useMatchingStore((state) => state.setFilter);
  const typeParam = searchParams.get('type');

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

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px]">
      <BackButton to="/home" />
      <h1 className="text-center text-[23px] leading-6 font-bold">매칭 설정</h1>

      <h2 className="mt-[17px] text-[17px] leading-6 font-bold">지역 선택</h2>
      <div
        role="radiogroup"
        aria-label="지역 선택"
        className="mt-[7px] grid grid-cols-2 gap-[10px]"
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
                'h-[43px] cursor-pointer rounded-[14px] text-base font-bold transition-colors',
                selected ? 'bg-mint' : 'bg-chip',
              )}
            >
              {region}
            </button>
          );
        })}
      </div>

      <h2 className="mt-4 text-[17px] leading-6 font-bold">생활권 선택</h2>
      <div role="radiogroup" aria-label="생활권 선택" className="mt-1">
        {areas.map(({ id, label, districts }) => (
          <RadioOption
            key={id}
            name="area"
            checked={filter.area === id}
            onChange={() => setFilter({ area: id })}
            className="h-[47px]"
          >
            <span className="flex flex-col">
              <span className="text-base leading-5 font-bold">{label}</span>
              {districts && (
                <span className="text-my-muted text-[11px] leading-[14px]">
                  {districts}
                </span>
              )}
            </span>
          </RadioOption>
        ))}
      </div>

      <h2 className="mt-4 text-[17px] leading-6 font-bold">매칭 거리</h2>
      <div role="radiogroup" aria-label="매칭 거리" className="mt-[5px]">
        {DISTANCES.map(({ value, label }) => (
          <RadioOption
            key={value}
            name="distance"
            checked={filter.distance === value}
            onChange={() => setFilter({ distance: value })}
            className="h-9"
          >
            <span className="text-[15px] leading-5">{label}</span>
          </RadioOption>
        ))}
      </div>

      <section
        aria-label="선택된 조건"
        className="bg-mint-100 mt-[10px] mb-6 flex h-16 flex-col justify-center rounded-[14px] px-[13px]"
      >
        <p className="text-[11px] leading-4 font-bold">선택된 조건</p>
        <p className="mt-[3px] flex items-center justify-between text-[15px] leading-5 font-bold">
          <span>
            {filter.region} · {selectedArea?.label}
          </span>
          <span>{selectedDistance?.summary}</span>
        </p>
      </section>

      <Button
        type="button"
        variant="brand"
        size="xl"
        onClick={() => navigate('/matching/cards')}
        className="mt-auto mb-10"
      >
        매칭 시작
      </Button>
    </main>
  );
}
