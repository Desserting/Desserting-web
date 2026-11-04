import { useEffect, useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import Bubble from '@/components/Bubble';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { REQUEST_HEART_COST, useHeartStore } from '@/stores/heartStore';
import { useMatchingStore } from '@/stores/matchingStore';
import { findCandidate } from '@/pages/matching/candidates';

const TOAST_DURATION_MS = 2000;

type RequestStep = 'confirm' | 'sent';

export default function CandidateProfilePage() {
  const { id } = useParams();
  // 매칭 카드·프로필 탐색 등 어디서 들어왔든 그곳으로 돌아간다
  const backTo =
    (useLocation().state as { from?: string } | null)?.from ?? '/profile';
  // 랜덤 매칭에서 온 경우에만 "매칭"이라고 부른다
  const fromMatching = backTo.startsWith('/matching');
  const candidate = findCandidate(Number(id));
  const liked = useMatchingStore((state) =>
    candidate ? state.likedIds.includes(candidate.id) : false,
  );
  const requested = useMatchingStore((state) =>
    candidate ? state.requestedIds.includes(candidate.id) : false,
  );
  const toggleLike = useMatchingStore((state) => state.toggleLike);
  const requestChat = useMatchingStore((state) => state.requestChat);
  const heartCount = useHeartStore((state) => state.heartCount);
  const isPremium = useHeartStore((state) => state.isPremium);
  const spendForRequest = useHeartStore((state) => state.spendForRequest);
  const [spent, setSpent] = useState<'deducted' | 'free'>('deducted');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [step, setStep] = useState<RequestStep>('confirm');
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null,
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!candidate) return <Navigate to={backTo} replace />;

  const like = () => {
    toggleLike(candidate.id);
    if (!liked) {
      setToast({
        message: fromMatching
          ? '이 매칭이 마음에 들어요!'
          : '이 프로필이 마음에 들어요!',
        key: Date.now(),
      });
    }
  };

  const openRequest = () => {
    setStep('confirm');
    setSheetOpen(true);
  };

  // 하트가 모자라면 요청을 막는다. 프리미엄은 차감 없이 보낼 수 있다
  const insufficient = !isPremium && heartCount < REQUEST_HEART_COST;

  const sendRequest = () => {
    // 이미 보낸 상대에게는 하트를 다시 차감하지 않는다
    if (requested) return;
    const result = spendForRequest(candidate.nickname);
    if (result === 'insufficient') return;
    requestChat(candidate.id);
    setSpent(result);
    setStep('sent');
  };

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-[35px]">
      <BackButton to={backTo} />
      <h1 className="text-center text-[19px] leading-6 font-bold">
        상대 프로필
      </h1>

      <img
        src={candidate.photo}
        alt={`${candidate.nickname}의 대표 사진`}
        className="mt-[30px] aspect-[345/248] w-full rounded-[22px] object-cover"
      />

      <section className="mt-[22px]">
        <h2 className="text-[28px] leading-10 font-bold">
          {candidate.nickname}, {candidate.age}
        </h2>
        <p className="text-ink-muted mt-1 text-[15px] leading-6">
          {candidate.location} · {candidate.distanceKm}km
          <span aria-hidden className="mx-2">
            ·
          </span>
          {candidate.interests.join(' / ')}
        </p>
        <div
          aria-label="자기소개"
          role="group"
          className="mt-6 flex flex-col items-start gap-2"
        >
          {candidate.bio.split('\n').map((line, lineIndex) => (
            <Bubble
              key={`${candidate.id}-${lineIndex}`}
              tail={lineIndex === 0}
              style={{ animationDelay: `${150 + lineIndex * 550}ms` }}
            >
              {line}
            </Bubble>
          ))}
        </div>
      </section>

      <ul className="mt-9 grid grid-cols-2 gap-[15px]">
        {candidate.gallery.map((photo, photoIndex) => (
          <li key={photoIndex}>
            <img
              src={photo}
              alt=""
              className="aspect-[165/120] w-full rounded-[20px] object-cover"
            />
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex gap-3 pt-6">
        <Button
          type="button"
          size="xl"
          aria-pressed={liked}
          onClick={like}
          className={cn(
            'bg-mint-100 text-ink hover:bg-mint-100/70 h-[54px] w-[128px] shrink-0 cursor-pointer rounded-[14px] pb-0 text-[17px]',
            liked && 'border-mint border-[1.5px]',
          )}
        >
          <Heart
            aria-hidden
            className={cn('size-5', liked && 'fill-mint-deep text-mint-deep')}
          />
          좋아요
        </Button>
        <Button
          type="button"
          variant="brand"
          size="xl"
          disabled={requested}
          onClick={openRequest}
          className="h-[54px] flex-1 cursor-pointer rounded-[14px] pb-0 text-[17px]"
        >
          {requested ? '요청을 보냈어요' : '대화 요청하기'}
        </Button>
      </div>

      {toast && (
        <div
          key={toast.key}
          role="status"
          className="bg-mint text-ink animate-in fade-in-0 slide-in-from-top-2 absolute top-[74px] left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-3 text-[15px] font-bold whitespace-nowrap shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
        >
          {toast.message}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="bg-black/60 backdrop-blur-none"
          className="text-ink mx-auto mb-[34px] min-h-[432px] w-[calc(100%-32px)] max-w-[398px] items-center gap-0 rounded-[28px] border-0 bg-white px-5 pt-[35px] pb-5 text-center"
        >
          <div className="bg-mint-100 flex size-20 shrink-0 items-center justify-center rounded-full">
            <Send aria-hidden className="text-mint-deep size-9 stroke-[1.8]" />
          </div>

          {step === 'confirm' ? (
            <>
              <SheetTitle className="mt-[38px] text-[22px] leading-[30px] font-bold break-keep">
                {candidate.nickname}님에게
                <br />
                대화를 요청할까요?
              </SheetTitle>
              <SheetDescription className="text-ink-muted mt-[38px] text-[15px] leading-6">
                상대가 수락하면 채팅을 시작할 수 있어요.
              </SheetDescription>
              <p
                className={cn(
                  'mt-4 rounded-full px-4 py-1.5 text-[14px] leading-5 font-bold',
                  insufficient
                    ? 'bg-chip text-ink-muted'
                    : 'bg-mint-100 text-mint-deep',
                )}
              >
                {isPremium
                  ? '프리미엄은 하트가 차감되지 않아요'
                  : insufficient
                    ? `하트가 부족해요 (보유 ${heartCount}개)`
                    : `하트 ${REQUEST_HEART_COST}개가 차감돼요 (보유 ${heartCount}개)`}
              </p>
              {insufficient && (
                <Link
                  to="/my/hearts"
                  className="mt-2 text-[14px] leading-5 font-bold underline underline-offset-2"
                >
                  하트 구매하러 가기
                </Link>
              )}
              <div className="mt-auto grid w-full grid-cols-[1fr_1.75fr] gap-3 pt-6">
                <SheetClose asChild>
                  <Button
                    type="button"
                    size="xl"
                    className="bg-chip text-ink hover:bg-chip/80 h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
                  >
                    취소
                  </Button>
                </SheetClose>
                <Button
                  type="button"
                  variant="brand"
                  size="xl"
                  onClick={sendRequest}
                  disabled={insufficient}
                  className="h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
                >
                  대화 요청하기
                </Button>
              </div>
            </>
          ) : (
            <>
              <SheetTitle className="mt-[38px] text-[22px] leading-[30px] font-bold">
                대화 요청을 보냈어요!
              </SheetTitle>
              <SheetDescription className="text-ink-muted mt-[38px] text-[15px] leading-6">
                상대의 수락을 기다리고 있어요.
              </SheetDescription>
              <p
                role="status"
                className="bg-mint-100 text-mint-deep mt-4 rounded-full px-4 py-1.5 text-[14px] leading-5 font-bold"
              >
                {spent === 'free'
                  ? '프리미엄이라 하트는 차감되지 않았어요'
                  : `하트 ${REQUEST_HEART_COST}개를 사용했어요 (남은 하트 ${heartCount}개)`}
              </p>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="brand"
                  size="xl"
                  className="mt-auto h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
                >
                  확인
                </Button>
              </SheetClose>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
