import { useNavigate } from 'react-router-dom';
import chevron from '@/assets/matching/icon-chevron.svg';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DISTANCES,
  REGIONS,
  useMatchingStore,
  type MatchType,
} from '@/stores/matchingStore';

const MATCH_TYPES: { id: MatchType; label: string }[] = [
  { id: 'same', label: '같은 취향' },
  { id: 'different', label: '다른 취향' },
];

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-[17px] leading-6 font-bold">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border-field h-[54px] w-full cursor-pointer appearance-none rounded-xl border bg-white px-[15px] pr-12 text-[17px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <img
          src={chevron}
          alt=""
          className="pointer-events-none absolute top-4 right-[21px]"
        />
      </div>
    </div>
  );
}

export default function MatchingSettingsPage() {
  const navigate = useNavigate();
  const filter = useMatchingStore((state) => state.filter);
  const setFilter = useMatchingStore((state) => state.setFilter);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px]">
      <BackButton to="/signup/profile" />
      <h1 className="text-center text-[23px] leading-6 font-bold">매칭 설정</h1>

      <section className="mt-[59px] flex flex-col gap-5">
        <h2 className="text-[19px] leading-6 font-bold">매칭 타입</h2>
        <div className="grid grid-cols-2 gap-3">
          {MATCH_TYPES.map(({ id, label }) => {
            const selected = filter.type === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter({ type: id })}
                className={cn(
                  'h-14 cursor-pointer rounded-[13px] border text-lg font-bold transition-colors',
                  selected
                    ? 'bg-mint-100 border-mint border-[1.5px]'
                    : 'bg-surface border-line',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-[52px] flex flex-col gap-5">
        <h2 className="text-xl font-bold">주변 사람 필터</h2>
        <FilterSelect
          id="region"
          label="지역"
          value={filter.region}
          options={REGIONS.map((region) => ({ value: region, label: region }))}
          onChange={(region) => setFilter({ region })}
        />
        <FilterSelect
          id="distance"
          label="거리"
          value={filter.distance}
          options={DISTANCES.map((distance) => ({
            value: distance,
            label: `${distance} 이내`,
          }))}
          onChange={(distance) => setFilter({ distance })}
        />
        <p className="text-ink-muted text-xs leading-6">
          * 위치 권한 이용 시 주변 사람과 매칭됩니다.
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
