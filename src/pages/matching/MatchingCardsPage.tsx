import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import iconClose from '@/assets/matching/icon-close.svg';
import iconHeart from '@/assets/matching/icon-heart.svg';
import iconHeartOutline from '@/assets/matching/icon-heart-outline.svg';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useMatchingStore } from '@/stores/matchingStore';
import { MOCK_CANDIDATES } from './candidates';

const ACTION_BUTTON =
  'flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[17px] font-bold transition-transform active:scale-95';

const BACK_FACE =
  'absolute inset-0 rounded-[20px] [backface-visibility:hidden] [transform:rotateY(180deg)]';

const TOAST_DURATION_MS = 2000;
// index.css의 --animate-card-out 시간과 맞춘다
const CARD_OUT_MS = 420;

export default function MatchingCardsPage() {
  const navigate = useNavigate();
  const matchType = useMatchingStore((state) => state.filter.type);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [exitOpen, setExitOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null,
  );
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const candidate = MOCK_CANDIDATES[index];
  const liked = candidate ? likedIds.includes(candidate.id) : false;
  const isSameTaste = matchType === 'same';

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  const showNext = () => {
    if (leaving) return;
    setLeaving(true);
    leaveTimer.current = setTimeout(() => {
      setIndex((current) => current + 1);
      setLeaving(false);
    }, CARD_OUT_MS);
  };

  const like = () => {
    if (!candidate || liked) return;
    setLikedIds((current) => [...current, candidate.id]);
    setToast({ message: '이 매칭이 마음에 들어요!', key: Date.now() });
  };

  if (!candidate) {
    return (
      <main className="text-ink flex flex-1 flex-col items-center justify-center gap-6 bg-white px-6 text-center">
        <p className="text-xl leading-8 font-bold">
          주변에 더 이상
          <br />
          매칭할 사람이 없어요
        </p>
        <Button asChild variant="brand" size="xl">
          <Link to="/matching">조건 다시 설정하기</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="text-ink relative flex flex-1 flex-col overflow-x-clip bg-white px-6 pt-[34px] pb-[98px]">
      <button
        type="button"
        aria-label="랜덤 매칭 종료"
        onClick={() => setExitOpen(true)}
        className="absolute top-[34px] left-[26px] block size-6 cursor-pointer"
      >
        <ChevronLeft className="size-6" strokeWidth={3} aria-hidden />
      </button>
      <h1 className="text-center text-[20px] leading-6 font-bold">
        {isSameTaste ? '같은' : '다른'} 취향 랜덤
      </h1>
      <p className="text-my-muted mt-[15px] text-right text-[13px] leading-[18px]">
        오늘의 추천 {index + 1} / {MOCK_CANDIDATES.length}
      </p>

      <div className="mt-[19px] [perspective:1200px]">
        <div
          key={candidate.id}
          className={cn(
            'relative [transform-style:preserve-3d] motion-reduce:animate-none',
            leaving
              ? 'animate-card-out origin-bottom'
              : index === 0
                ? 'animate-deal'
                : 'animate-card-in',
          )}
        >
          <article className="[backface-visibility:hidden]">
            <img
              src={candidate.photo}
              alt=""
              className="block h-[315px] w-full rounded-[20px] object-cover"
            />
            <h2 className="mt-4 text-2xl leading-8 font-bold">
              {candidate.nickname}, {candidate.age}
            </h2>
            <p className="mt-4 flex items-center gap-[11px] text-[15px] leading-5">
              <span>
                {candidate.location} · {candidate.distanceKm}km
              </span>
              <span aria-hidden>·</span>
              <span>{candidate.interests.join(' / ')}</span>
            </p>
            <p className="bg-mint-100 mt-5 inline-flex h-[42px] min-w-[243px] items-center justify-center rounded-full px-6 text-sm font-bold">
              나와 {isSameTaste ? '같은' : '다른'} {candidate.interests[0]} 취향
            </p>
          </article>
          <div aria-hidden className={cn(BACK_FACE, 'bg-mint p-3')}>
            <div className="flex size-full items-center justify-center rounded-[14px] border-2 border-white/70 text-[28px] font-bold text-white">
              Desserting
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-auto grid grid-cols-2 gap-[19px] pt-6">
        <button
          type="button"
          onClick={showNext}
          className={cn(ACTION_BUTTON, 'bg-chip')}
        >
          <img src={iconClose} alt="" className="size-[22px]" />
          넘기기
        </button>
        <button
          type="button"
          aria-pressed={liked}
          onClick={like}
          className={cn(ACTION_BUTTON, 'bg-mint')}
        >
          <img
            src={liked ? iconHeart : iconHeartOutline}
            alt=""
            className="size-[22px]"
          />
          프로필 보기
        </button>
        {toast && (
          <div
            key={toast.key}
            role="status"
            className="bg-mint text-ink animate-in fade-in-0 slide-in-from-bottom-2 absolute bottom-full left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-3 text-[15px] font-bold whitespace-nowrap shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
          >
            {toast.message}
          </div>
        )}
      </div>

      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent
          showCloseButton={false}
          className="text-ink max-w-[calc(100%-48px)] gap-0 rounded-3xl bg-white p-6 text-center sm:max-w-[340px]"
        >
          <DialogTitle className="text-[19px] leading-7 font-bold">
            랜덤 매칭을 종료하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-ink-muted mt-2 text-[15px] leading-6">
            같은 사람과 다시 매칭되지 않을 수 있습니다.
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="xl"
              onClick={() => setExitOpen(false)}
              className="bg-chip text-ink hover:bg-chip/80 h-12 rounded-xl pb-0 text-base"
            >
              아니요
            </Button>
            <Button
              type="button"
              variant="brand"
              size="xl"
              onClick={() => navigate('/home')}
              className="h-12 rounded-xl pb-0 text-base"
            >
              예
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
