import { useState } from 'react';
import { Link } from 'react-router-dom';
import iconClose from '@/assets/matching/icon-close.svg';
import iconHeart from '@/assets/matching/icon-heart.svg';
import iconNext from '@/assets/matching/icon-next.svg';
import iconPin from '@/assets/matching/icon-pin.svg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MOCK_CANDIDATES } from './candidates';

const ACTION_BUTTON =
  'flex size-[70px] cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95';

export default function MatchingCardsPage() {
  const [index, setIndex] = useState(0);
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
          aria-label="거절"
          onClick={showNext}
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
    </main>
  );
}
