import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import iconClose from '@/assets/matching/icon-close.svg';
import iconHeart from '@/assets/matching/icon-heart.svg';
import iconNext from '@/assets/matching/icon-next.svg';
import iconPin from '@/assets/matching/icon-pin.svg';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MOCK_CANDIDATES } from './candidates';

const ACTION_BUTTON =
  'flex size-[70px] cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95';

export default function MatchingCardsPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const candidate = MOCK_CANDIDATES[index];

  const showNext = () => setIndex((current) => current + 1);

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
    <main className="text-ink flex flex-1 flex-col bg-white px-6 pt-[53px] pb-10">
      <article
        key={candidate.id}
        className="relative max-h-[610px] min-h-0 flex-1 overflow-hidden rounded-[20px]"
      >
        <img
          src={candidate.photo}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-[205px] bg-linear-to-b from-black/0 to-black/83" />
        <div className="absolute inset-x-[22px] bottom-[25px] flex flex-col text-white">
          <h1 className="text-[26px] leading-[38px] font-bold">
            {candidate.nickname}, {candidate.age}
          </h1>
          <p className="mt-[7px] flex items-center gap-[7px] text-base leading-6 font-bold">
            <img src={iconPin} alt="" className="shrink-0" />
            {candidate.location} · {candidate.distanceKm}km
          </p>
          <ul className="mt-[19px] flex gap-2">
            {candidate.interests.map((interest) => (
              <li
                key={interest}
                className="text-ink h-8 rounded-full bg-white px-[19px] text-[13px] leading-8 font-bold"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <div className="mt-[21px] flex justify-center gap-8">
        <button
          type="button"
          aria-label="종료"
          onClick={() => setExitOpen(true)}
          className={cn(ACTION_BUTTON, 'bg-chip')}
        >
          <img src={iconClose} alt="" />
        </button>
        <button
          type="button"
          aria-label="좋아요"
          onClick={showNext}
          className={cn(ACTION_BUTTON, 'bg-mint')}
        >
          <img src={iconHeart} alt="" />
        </button>
        <button
          type="button"
          aria-label="다음 사람"
          onClick={showNext}
          className={cn(ACTION_BUTTON, 'bg-chip')}
        >
          <img src={iconNext} alt="" />
        </button>
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
