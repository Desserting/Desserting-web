import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, MapPin } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { toggleLike as sendLike } from '@/api/matching';
import {
  fetchLikedProfiles,
  fetchMe,
  fetchProfiles,
  userKeys,
} from '@/api/users';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import DessertAvatar from '@/components/DessertAvatar';
import { Button } from '@/components/ui/button';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';
import { serverCandidateKey, useMatchingStore } from '@/stores/matchingStore';

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
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const likedIds = useMatchingStore((state) => state.likedIds);
  const toggleLike = useMatchingStore((state) => state.toggleLike);
  const syncLiked = useMatchingStore((state) => state.syncLiked);

  // 프로필을 보고 돌아와도 보던 탭이 유지되도록 URL에 둔다
  const tab: TabId = searchParams.get('tab') === 'liked' ? 'liked' : 'explore';
  const isLikedTab = tab === 'liked';

  // 탐색 목록에는 나도 들어 있어서 내 userId로 걸러낸다
  const me = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  const explore = useQuery({
    queryKey: userKeys.profiles,
    queryFn: fetchProfiles,
    enabled: !isLikedTab,
    refetchOnMount: 'always',
  });
  const likes = useQuery({
    queryKey: userKeys.likesSent,
    queryFn: fetchLikedProfiles,
    enabled: isLikedTab,
    refetchOnMount: 'always',
  });

  // 서버가 알려준 좋아요 여부를 화면 상태에 맞춘다. 새로고침해도 하트가 유지된다
  useEffect(() => {
    if (explore.data) syncLiked(explore.data);
  }, [explore.data, syncLiked]);
  useEffect(() => {
    if (likes.data) {
      syncLiked(likes.data.map(({ userId }) => ({ userId, liked: true })));
    }
  }, [likes.data, syncLiked]);

  const query = isLikedTab ? likes : explore;
  const isLiked = (userId: number) =>
    likedIds.includes(serverCandidateKey(userId));
  const candidates = (query.data ?? []).filter(({ userId }) =>
    // 좋아요 탭에서는 방금 취소한 프로필이 바로 빠지도록 현재 상태로 한 번 더 거른다
    isLikedTab ? isLiked(userId) : userId !== me.data?.userId,
  );
  // 내 정보를 불러오기 전에 목록을 그리면 내 카드가 잠깐 보였다 사라진다
  const loading = query.isPending || (!isLikedTab && me.isPending);

  const like = useMutation({
    mutationFn: (userId: number) => sendLike(userId),
    onError: (_error, userId) => {
      // 서버에 반영하지 못하면 화면도 원래대로 돌린다
      toggleLike(serverCandidateKey(userId));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.likesSent });
    },
  });

  const onToggleLike = (userId: number) => {
    toggleLike(serverCandidateKey(userId));
    like.mutate(userId);
  };

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

        {loading && (
          <div role="status" className="mt-6 flex flex-col gap-3">
            <span className="sr-only">프로필을 불러오는 중이에요</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                aria-hidden
                className="border-hairline flex animate-pulse items-center gap-4 rounded-[20px] border p-4"
              >
                <div className="bg-chip size-[72px] shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="bg-chip h-5 w-2/5 rounded-full" />
                  <div className="bg-chip h-4 w-3/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {query.isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <p className="text-ink-muted text-[16px] leading-6">
              프로필을 불러오지 못했어요.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void query.refetch()}
              className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
            >
              다시 시도
            </Button>
          </div>
        )}

        {!loading && query.isSuccess && candidates.length === 0 && (
          <p className="text-ink-muted mt-32 text-center text-[15px] leading-6">
            {EMPTY_MESSAGES[tab]}
          </p>
        )}

        {!loading && candidates.length > 0 && (
          <>
            <p className="text-ink-muted mt-6 text-sm leading-5">
              {isLikedTab ? '내가 좋아요한' : '내 주변'} 프로필{' '}
              <b className="text-mint-deep">{candidates.length}명</b>
            </p>
            <ul role="tabpanel" className="mt-3 flex flex-col gap-3">
              {candidates.map((candidate, candidateIndex) => {
                const liked = isLiked(candidate.userId);
                return (
                  <li
                    key={candidate.userId}
                    style={{ animationDelay: `${candidateIndex * 60}ms` }}
                    className={cn(
                      'motion-safe:animate-card-in relative rounded-[20px] border bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)] transition-transform has-[a:active]:scale-[0.98]',
                      liked ? 'border-mint' : 'border-hairline',
                    )}
                  >
                    <Link
                      to={`/profile/${candidate.userId}`}
                      state={{ from: location.pathname + location.search }}
                      className="flex items-center gap-4 py-4 pr-[68px] pl-4"
                    >
                      <DessertAvatar
                        src={candidate.dessertAvatarUrl}
                        className="ring-mint-100 size-[72px] ring-[3px]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[19px] leading-7 font-bold">
                          {candidate.nickname}, {candidate.age}
                        </span>
                        <span className="text-ink-muted mt-0.5 flex items-center gap-1 text-[14px] leading-5">
                          <MapPin aria-hidden className="size-3.5 shrink-0" />
                          <span className="truncate">{candidate.region}</span>
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {candidate.dessertTags.map((tag, tagIndex) => (
                            <span
                              key={tag}
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium',
                                tagIndex === 0
                                  ? 'bg-mint-100 text-mint-deep'
                                  : 'bg-chip text-ink-muted',
                              )}
                            >
                              {dessertLabel(tag)}
                            </span>
                          ))}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`${candidate.nickname} 좋아요`}
                      aria-pressed={liked}
                      onClick={() => onToggleLike(candidate.userId)}
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
