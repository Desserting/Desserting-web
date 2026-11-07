import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import iconClose from '@/assets/matching/icon-close.svg';
import iconProfile from '@/assets/matching/icon-profile.svg';
import ConfirmDialog from '@/components/ConfirmDialog';
import DessertAvatar from '@/components/DessertAvatar';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';
import { useMatchingStore } from '@/stores/matchingStore';
import { fetchNextCandidate, toMatchParams } from './matchRequest';

const ACTION_BUTTON =
  'flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[17px] font-bold transition-transform active:scale-95';

const BACK_FACE =
  'absolute inset-0 rounded-[20px] [backface-visibility:hidden] [transform:rotateY(180deg)]';

// index.css의 --animate-card-out 시간과 맞춘다
const CARD_OUT_MS = 420;

export default function MatchingCardsPage() {
  const navigate = useNavigate();
  const filter = useMatchingStore((state) => state.filter);
  const current = useMatchingStore((state) => state.current);
  const shownCount = useMatchingStore((state) => state.shownCount);
  const seenIds = useMatchingStore((state) => state.seenIds);
  const showNextMatch = useMatchingStore((state) => state.showNextMatch);
  const markDealt = useMatchingStore((state) => state.markDealt);
  // 프로필을 보고 돌아왔을 때는 카드를 다시 섞지 않는다
  const [playDeal] = useState(() => !useMatchingStore.getState().dealt);
  const [leaving, setLeaving] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSameTaste = filter.type === 'same';

  // 서버는 호출할 때마다 다음 상대를 주므로, 넘기기를 누를 때 다시 부른다
  const next = useMutation({
    mutationFn: () => fetchNextCandidate(toMatchParams(filter), seenIds),
  });

  useEffect(() => {
    markDealt();
  }, [markDealt]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // 설정 화면을 거치지 않고 들어왔거나 새로고침해서 매칭 결과가 없으면 설정으로 보낸다
  if (!current) return <Navigate to="/matching" replace />;

  const showNext = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      // 카드가 넘어가는 애니메이션과 다음 상대 요청을 같이 기다린다
      const [result] = await Promise.all([
        next.mutateAsync(),
        new Promise<void>((resolve) => {
          leaveTimer.current = setTimeout(resolve, CARD_OUT_MS);
        }),
      ]);
      showNextMatch(result);
    } catch {
      // 실패하면 카드가 돌아오고, 아래에 오류 문구를 보여준다
    } finally {
      setLeaving(false);
    }
  };

  const candidate = current.found ? current.candidate : null;

  if (!candidate) {
    return (
      <main className="text-ink flex flex-1 flex-col items-center justify-center gap-6 bg-white px-6 text-center">
        <p className="text-xl leading-8 font-bold break-keep">
          {current.guide ?? (
            <>
              추천 후보를
              <br />
              모두 확인했어요
            </>
          )}
        </p>
        <Button asChild variant="brand" size="xl">
          <Link to="/matching">조건 다시 설정하기</Link>
        </Button>
      </main>
    );
  }

  const tags = candidate.dessertTags.map(dessertLabel);
  // 같은 취향이면 둘의 공통 취향을, 다른 취향이면 상대의 대표 취향을 보여준다
  const highlight = isSameTaste
    ? (candidate.commonDessertTags[0] ?? candidate.dessertTags[0])
    : candidate.dessertTags[0];
  const notice = current.guide
    ? current.guide
    : current.recycled
      ? '오늘 추천을 모두 봐서 처음부터 다시 보여드려요.'
      : null;

  return (
    <main className="text-ink relative flex flex-1 flex-col overflow-x-clip bg-white px-6 pb-[98px]">
      <PageHeader
        title={`${isSameTaste ? '같은' : '다른'} 취향 랜덤`}
        left={
          <button
            type="button"
            aria-label="랜덤 매칭 종료"
            onClick={() => setExitOpen(true)}
            className="block size-6 cursor-pointer"
          >
            <ArrowLeft className="size-6" aria-hidden />
          </button>
        }
      />
      <p className="text-my-muted mt-[15px] text-right text-[13px] leading-[18px]">
        오늘의 추천 {shownCount}번째
      </p>
      {notice && (
        <p
          role="status"
          className="bg-mint-100 text-mint-deep mt-2 rounded-[12px] px-3 py-2 text-[13px] leading-5"
        >
          {notice}
        </p>
      )}

      <div className="mt-[19px] [perspective:1200px]">
        <div
          key={`${candidate.userId}-${shownCount}`}
          className={cn(
            'relative [transform-style:preserve-3d] motion-reduce:animate-none',
            leaving
              ? 'animate-card-out origin-bottom'
              : shownCount === 1 && playDeal
                ? 'animate-deal'
                : 'animate-card-in',
          )}
        >
          <article className="[backface-visibility:hidden]">
            {/* 사진 대신 서버가 취향으로 만든 디저트 아바타를 보여준다 */}
            <div className="bg-mint-100 flex h-[315px] w-full items-center justify-center rounded-[20px]">
              <DessertAvatar
                src={candidate.dessertAvatarUrl}
                className="size-[200px] bg-white"
              />
            </div>
            <h2 className="mt-4 text-2xl leading-8 font-bold">
              {candidate.nickname}, {candidate.age}
            </h2>
            <p className="mt-4 flex items-center gap-[11px] text-[15px] leading-5">
              <span>
                {candidate.region}
                {candidate.approxDistanceKm != null &&
                  ` · ${candidate.approxDistanceKm}km 이내`}
              </span>
              {tags.length > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>{tags.join(' / ')}</span>
                </>
              )}
            </p>
            {highlight && (
              <p className="bg-mint-100 mt-5 inline-flex h-[42px] min-w-[243px] items-center justify-center rounded-full px-6 text-sm font-bold">
                나와 {isSameTaste ? '같은' : '다른'} {dessertLabel(highlight)}{' '}
                취향
              </p>
            )}
          </article>
          <div aria-hidden className={cn(BACK_FACE, 'bg-mint p-3')}>
            <div className="flex size-full items-center justify-center rounded-[14px] border-2 border-white/70 text-[28px] font-bold text-white">
              Desserting
            </div>
          </div>
        </div>
      </div>

      {next.isError && !leaving && (
        <p role="alert" className="text-destructive mt-3 text-[13px]">
          {getApiError(next.error)?.message ??
            '다음 상대를 불러오지 못했어요. 다시 시도해 주세요.'}
        </p>
      )}

      <div className="relative mt-auto grid grid-cols-2 gap-[19px] pt-6">
        <button
          type="button"
          onClick={() => void showNext()}
          disabled={leaving}
          className={cn(ACTION_BUTTON, 'bg-chip')}
        >
          <img src={iconClose} alt="" className="size-[22px]" />
          넘기기
        </button>
        <Link
          to={`/profile/${candidate.userId}`}
          state={{ from: '/matching/cards' }}
          className={cn(ACTION_BUTTON, 'bg-mint')}
        >
          <img src={iconProfile} alt="" className="size-[22px]" />
          프로필 보기
        </Link>
      </div>

      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="랜덤 매칭을 종료하시겠습니까?"
        description="같은 사람과 다시 매칭되지 않을 수 있습니다."
        onConfirm={() => navigate('/home')}
      />
    </main>
  );
}
