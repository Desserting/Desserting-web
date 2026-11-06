import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Send } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { heartKeys } from '@/api/hearts';
import { REQUEST_HEART_COST, matchKeys, sendChatRequest } from '@/api/matches';
import { toggleLike as sendLike } from '@/api/matching';
import { fetchMe, fetchProfile, userKeys } from '@/api/users';
import BackButton from '@/components/BackButton';
import Bubble from '@/components/Bubble';
import DessertAvatar from '@/components/DessertAvatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { getApiError } from '@/lib/axios';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';
import { serverCandidateKey, useMatchingStore } from '@/stores/matchingStore';

const TOAST_DURATION_MS = 2000;

type RequestStep = 'confirm' | 'sent';

/** 화면에 보여줄 프로필. 랜덤 매칭 후보와 프로필 탐색의 상세 응답을 같은 모양으로 맞춘다 */
interface ProfileView {
  /** 좋아요·요청 상태를 기억하는 키 */
  key: string;
  /** 대화 요청의 receiverId로 쓴다 */
  userId: number;
  /** 서버가 false로 알려주면 요청 버튼을 막는다. 매칭 후보만 알려준다 */
  canRequest?: boolean;
  nickname: string;
  age: number;
  /** 지역과 거리 */
  place: string;
  interests: string[];
  bio: string;
  avatarUrl?: string | null;
}

interface SendErrorView {
  message: string;
  link?: { to: string; label: string };
}

/** 대화 요청 실패 코드별 안내 */
function describeSendError(error: unknown): SendErrorView {
  const apiError = getApiError(error);
  switch (apiError?.code) {
    case 'H001':
      return {
        message: '하트가 부족해요.',
        link: { to: '/my/hearts', label: '하트 구매하러 가기' },
      };
    case 'H002':
      return { message: '이미 요청을 보냈거나 대화 중인 상대예요.' };
    case 'H004':
      return { message: '나에게는 대화를 요청할 수 없어요.' };
    case 'A002':
      return {
        message:
          '일반 회원은 최근 24시간 안에 랜덤 매칭으로 만난 상대에게만 요청할 수 있어요. 프리미엄이면 누구에게나 요청할 수 있어요.',
        link: { to: '/my/premium', label: '프리미엄 알아보기' },
      };
    default:
      return {
        message:
          apiError?.message ??
          '요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
      };
  }
}

export default function CandidateProfilePage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  // 매칭 카드·프로필 탐색 등 어디서 들어왔든 그곳으로 돌아간다
  const backTo =
    (useLocation().state as { from?: string } | null)?.from ?? '/profile';
  // 랜덤 매칭에서 온 경우에만 "매칭"이라고 부른다
  const fromMatching = backTo.startsWith('/matching');

  // 랜덤 매칭에서 왔으면 방금 받은 후보를, 프로필 탐색에서 왔으면 상세 API로 불러온다
  const userId = Number(id);
  const matched = useMatchingStore((state) => state.current?.candidate);
  const matchedCandidate =
    fromMatching && matched?.userId === userId ? matched : undefined;
  const detail = useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !fromMatching && Number.isInteger(userId),
    refetchOnMount: 'always',
  });
  const syncLiked = useMatchingStore((state) => state.syncLiked);
  useEffect(() => {
    if (detail.data) syncLiked([detail.data]);
  }, [detail.data, syncLiked]);

  let profile: ProfileView | null = null;
  if (matchedCandidate) {
    profile = {
      key: serverCandidateKey(matchedCandidate.userId),
      userId: matchedCandidate.userId,
      canRequest: matchedCandidate.canRequest,
      nickname: matchedCandidate.nickname,
      age: matchedCandidate.age,
      place:
        matchedCandidate.approxDistanceKm != null
          ? `${matchedCandidate.region} · ${matchedCandidate.approxDistanceKm}km 이내`
          : matchedCandidate.region,
      interests: matchedCandidate.dessertTags.map(dessertLabel),
      bio: matchedCandidate.bio ?? '',
      avatarUrl: matchedCandidate.dessertAvatarUrl,
    };
  } else if (!fromMatching && detail.data) {
    profile = {
      key: serverCandidateKey(detail.data.userId),
      userId: detail.data.userId,
      nickname: detail.data.nickname,
      age: detail.data.age,
      place: detail.data.region,
      interests: detail.data.dessertTags.map(dessertLabel),
      bio: detail.data.bio ?? '',
      avatarUrl: detail.data.dessertAvatarUrl,
    };
  }

  const liked = useMatchingStore((state) =>
    profile ? state.likedIds.includes(profile.key) : false,
  );
  const requested = useMatchingStore((state) =>
    profile ? state.requestedIds.includes(profile.key) : false,
  );
  const toggleLike = useMatchingStore((state) => state.toggleLike);
  const requestChat = useMatchingStore((state) => state.requestChat);

  const me = useQuery({
    queryKey: userKeys.me,
    queryFn: fetchMe,
    enabled: profile !== null,
  });
  const heartCount = me.data?.heartCount ?? 0;
  const isPremium = me.data?.isPremium ?? false;
  const heartsKnown = me.isSuccess;

  const [spent, setSpent] = useState<'deducted' | 'free'>('deducted');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [step, setStep] = useState<RequestStep>('confirm');
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null,
  );

  const send = useMutation({
    mutationFn: (receiverId: number) => sendChatRequest(receiverId),
    onSuccess: () => {
      if (!profile) return;
      requestChat(profile.key);
      setSpent(isPremium ? 'free' : 'deducted');
      setStep('sent');
      // 채팅 탭의 보낸 요청 목록에 바로 보이도록 다시 불러온다
      void queryClient.invalidateQueries({ queryKey: matchKeys.sent });
      // 응답에 남은 하트 수가 없으므로 내 정보와 하트 내역을 다시 불러온다
      void queryClient.invalidateQueries({ queryKey: userKeys.me });
      void queryClient.invalidateQueries({ queryKey: heartKeys.history });
    },
    onError: (error) => {
      const code = getApiError(error)?.code;
      // 이미 요청한 상대면 버튼도 "요청을 보냈어요"로 맞춘다
      if (code === 'H002' && profile) requestChat(profile.key);
      // 하트 수가 서버와 다르면 다시 맞춘다
      if (code === 'H001') {
        void queryClient.invalidateQueries({ queryKey: userKeys.me });
      }
    },
  });

  const likeOnServer = useMutation({
    mutationFn: (userId: number) => sendLike(userId),
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!profile) {
    // 매칭 카드에서 온 프로필이 스토어에 없거나, 없는 사용자(U001)면 돌아간다
    const notFound = getApiError(detail.error)?.code === 'U001';
    if (fromMatching || notFound || !Number.isInteger(userId)) {
      return <Navigate to={backTo} replace />;
    }
    return (
      <main className="text-ink flex flex-1 flex-col bg-white px-6 pt-[34px] pb-[35px]">
        <BackButton to={backTo} />
        <h1 className="text-center text-[19px] leading-6 font-bold">
          상대 프로필
        </h1>
        {detail.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <p className="text-ink-muted text-[16px] leading-6">
              프로필을 불러오지 못했어요.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void detail.refetch()}
              className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <div role="status" className="mt-[30px] animate-pulse">
            <span className="sr-only">프로필을 불러오는 중이에요</span>
            <div
              aria-hidden
              className="bg-chip aspect-[345/248] w-full rounded-[22px]"
            />
            <div aria-hidden className="bg-chip mt-6 h-8 w-1/2 rounded-full" />
            <div aria-hidden className="bg-chip mt-3 h-5 w-2/3 rounded-full" />
          </div>
        )}
      </main>
    );
  }

  const like = () => {
    const nextLiked = !liked;
    toggleLike(profile.key);
    if (nextLiked) {
      setToast({
        message: fromMatching
          ? '이 매칭이 마음에 들어요!'
          : '이 프로필이 마음에 들어요!',
        key: Date.now(),
      });
    }
    likeOnServer.mutate(profile.userId, {
      // 서버에 반영하지 못하면 화면도 원래대로 돌린다
      onError: () => {
        toggleLike(profile.key);
        setToast({ message: '좋아요를 처리하지 못했어요', key: Date.now() });
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: userKeys.likesSent });
      },
    });
  };

  const openRequest = () => {
    send.reset();
    setStep('confirm');
    setSheetOpen(true);
  };

  // 하트가 모자라면 요청을 막는다. 프리미엄은 차감 없이 보낼 수 있다
  const insufficient =
    heartsKnown && !isPremium && heartCount < REQUEST_HEART_COST;

  const sendRequest = () => {
    // 이미 보낸 상대에게는 하트를 다시 차감하지 않는다
    if (requested) return;
    send.mutate(profile.userId);
  };

  // 서버가 요청할 수 없다고 알려준 상대는 눌러 보기 전에 막는다.
  // 하트 부족이 이유일 수 있어서, 하트가 모자란 경우는 열어서 구매 링크를 보여준다
  const blocked = profile.canRequest === false && !requested && !insufficient;

  const sendError = send.isError ? describeSendError(send.error) : null;
  // 남은 하트 수가 갱신되는 동안에는 옛 숫자를 보여주지 않는다
  const heartsRefreshing = me.isFetching;
  const bioLines = profile.bio.split('\n').filter((line) => line.trim());

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-[35px]">
      <BackButton to={backTo} />
      <h1 className="text-center text-[19px] leading-6 font-bold">
        상대 프로필
      </h1>

      <div className="bg-mint-100 mt-[30px] flex aspect-[345/248] w-full items-center justify-center rounded-[22px]">
        <DessertAvatar
          src={profile.avatarUrl}
          className="size-[170px] bg-white"
        />
      </div>

      <section className="mt-[22px]">
        <h2 className="text-[28px] leading-10 font-bold">
          {profile.nickname}, {profile.age}
        </h2>
        <p className="text-ink-muted mt-1 text-[15px] leading-6">
          {profile.place}
          {profile.interests.length > 0 && (
            <>
              <span aria-hidden className="mx-2">
                ·
              </span>
              {profile.interests.join(' / ')}
            </>
          )}
        </p>
        {bioLines.length > 0 && (
          <div
            aria-label="자기소개"
            role="group"
            className="mt-6 flex flex-col items-start gap-2"
          >
            {bioLines.map((line, lineIndex) => (
              <Bubble
                key={`${profile.key}-${lineIndex}`}
                tail={lineIndex === 0}
                style={{ animationDelay: `${150 + lineIndex * 550}ms` }}
              >
                {line}
              </Bubble>
            ))}
          </div>
        )}
      </section>

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
          disabled={requested || blocked}
          onClick={openRequest}
          className="h-[54px] flex-1 cursor-pointer rounded-[14px] pb-0 text-[17px]"
        >
          {requested
            ? '요청을 보냈어요'
            : blocked
              ? '요청할 수 없어요'
              : '대화 요청하기'}
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
                {profile.nickname}님에게
                <br />
                대화를 요청할까요?
              </SheetTitle>
              <SheetDescription className="text-ink-muted mt-[38px] text-[15px] leading-6">
                상대가 수락하면 채팅을 시작할 수 있어요.
              </SheetDescription>
              {heartsKnown && (
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
              )}
              {insufficient && (
                <Link
                  to="/my/hearts"
                  className="mt-2 text-[14px] leading-5 font-bold underline underline-offset-2"
                >
                  하트 구매하러 가기
                </Link>
              )}
              {sendError && (
                <div role="alert" className="mt-3 flex flex-col items-center">
                  <p className="text-destructive text-[14px] leading-5 break-keep">
                    {sendError.message}
                  </p>
                  {sendError.link && (
                    <Link
                      to={sendError.link.to}
                      className="mt-1 text-[14px] leading-5 font-bold underline underline-offset-2"
                    >
                      {sendError.link.label}
                    </Link>
                  )}
                </div>
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
                  disabled={insufficient || send.isPending || !heartsKnown}
                  className="h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
                >
                  {send.isPending ? '보내는 중...' : '대화 요청하기'}
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
                  : heartsRefreshing
                    ? `하트 ${REQUEST_HEART_COST}개를 사용했어요`
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
