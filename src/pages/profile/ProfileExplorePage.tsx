import { Heart, MapPin } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { useMatchingStore } from '@/stores/matchingStore';
import { MOCK_CANDIDATES } from '@/pages/matching/candidates';

const TABS = [
  { id: 'explore', label: '프로필 탐색' },
  { id: 'liked', label: '좋아요 누른 프로필 보기' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const EMPTY_MESSAGES: Record<TabId, string> = {
  explore: '탐색할 수 있는 프로필이 아직 없어요',
  liked: '아직 좋아요를 누른 프로필이 없어요',
};

export default function ProfileExplorePage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const likedIds = useMatchingStore((state) => state.likedIds);
  const toggleLike = useMatchingStore((state) => state.toggleLike);

  // 프로필을 보고 돌아와도 보던 탭이 유지되도록 URL에 둔다
  const tab: TabId = searchParams.get('tab') === 'liked' ? 'liked' : 'explore';
  const candidates =
    tab === 'liked'
      ? MOCK_CANDIDATES.filter(({ id }) => likedIds.includes(`mock-${id}`))
      : MOCK_CANDIDATES;

  const selectTab = (next: TabId) =>
    setSearchParams(next === 'explore' ? {} : { tab: next }, { replace: true });

  return (
    <>
      <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-6">
        <BackButton to="/home" />
        <h1 className="sr-only">프로필 보기</h1>

        <div role="tablist" className="mt-[46px] grid grid-cols-2 gap-2">
          {TABS.map(({ id, label }) => {
            const selected = id === tab;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTab(id)}
                className={cn(
                  'relative flex h-14 cursor-pointer items-center justify-center rounded-2xl px-2 text-[15px] font-bold whitespace-nowrap',
                  selected ? 'bg-mint-100' : 'bg-chip',
                )}
              >
                {label}
                {selected && (
                  <span
                    aria-hidden
                    className="bg-mint absolute bottom-[3px] left-1/2 h-[3px] w-[60px] -translate-x-1/2 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {candidates.length === 0 ? (
          <p className="text-ink-muted mt-32 text-center text-[15px] leading-6">
            {EMPTY_MESSAGES[tab]}
          </p>
        ) : (
          <>
            <p className="text-ink-muted mt-6 text-sm leading-5">
              {tab === 'liked' ? '내가 좋아요한' : '내 주변'} 프로필{' '}
              <b className="text-mint-deep">{candidates.length}명</b>
            </p>
            <ul role="tabpanel" className="mt-3 flex flex-col gap-3">
              {candidates.map((candidate, candidateIndex) => {
                const liked = likedIds.includes(`mock-${candidate.id}`);
                return (
                  <li
                    key={candidate.id}
                    style={{ animationDelay: `${candidateIndex * 60}ms` }}
                    className={cn(
                      'motion-safe:animate-card-in relative rounded-[20px] border bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)] transition-transform has-[a:active]:scale-[0.98]',
                      liked ? 'border-mint' : 'border-hairline',
                    )}
                  >
                    <Link
                      to={`/profile/${candidate.id}`}
                      state={{ from: location.pathname + location.search }}
                      className="flex items-center gap-4 py-4 pr-[68px] pl-4"
                    >
                      <img
                        src={candidate.photo}
                        alt=""
                        className="ring-mint-100 size-[72px] shrink-0 rounded-full object-cover ring-[3px]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[19px] leading-7 font-bold">
                          {candidate.nickname}, {candidate.age}
                        </span>
                        <span className="text-ink-muted mt-0.5 flex items-center gap-1 text-[14px] leading-5">
                          <MapPin aria-hidden className="size-3.5" />
                          {candidate.location} · {candidate.distanceKm}km
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {candidate.interests.map(
                            (interest, interestIndex) => (
                              <span
                                key={interest}
                                className={cn(
                                  'rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium',
                                  interestIndex === 0
                                    ? 'bg-mint-100 text-mint-deep'
                                    : 'bg-chip text-ink-muted',
                                )}
                              >
                                {interest}
                              </span>
                            ),
                          )}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`${candidate.nickname} 좋아요`}
                      aria-pressed={liked}
                      onClick={() => toggleLike(`mock-${candidate.id}`)}
                      className={cn(
                        'absolute top-1/2 right-3.5 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-colors',
                        liked ? 'bg-mint-100' : 'bg-chip hover:bg-chip/70',
                      )}
                    >
                      <Heart
                        aria-hidden
                        className={cn(
                          'size-[22px] stroke-[1.8]',
                          liked &&
                            'fill-mint-deep text-mint-deep motion-safe:animate-heart-pop',
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <BottomNav activePath="/home" />
    </>
  );
}
