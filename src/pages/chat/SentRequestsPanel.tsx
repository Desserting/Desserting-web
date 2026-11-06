import { useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchSentRequests,
  matchKeys,
  type RequestStatus,
  type SentRequest,
} from '@/api/matches';
import DessertAvatar from '@/components/DessertAvatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';

const STATUS_BADGES: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  PENDING: { label: '대기 중', className: 'bg-mint-100 text-mint-deep' },
  ACCEPTED: { label: '수락됨', className: 'bg-mint-deep text-white' },
  REJECTED: { label: '거절됨', className: 'bg-chip text-ink-muted' },
  EXPIRED: { label: '만료됨', className: 'bg-chip text-ink-muted' },
};

const STATUS_NOTES: Record<RequestStatus, string> = {
  PENDING: '상대가 수락하면 채팅이 시작돼요.',
  ACCEPTED: '대화를 시작할 수 있어요!',
  REJECTED: '상대가 요청을 거절했어요.',
  EXPIRED: '요청이 만료됐어요.',
};

function SentRequestItem({ request }: { request: SentRequest }) {
  const {
    receiverId,
    receiverNickname,
    receiverAvatarUrl,
    receiverAge,
    receiverRegion,
    status,
    chatRoomId,
    createdAt,
  } = request;
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.PENDING;
  const dimmed = status === 'REJECTED' || status === 'EXPIRED';
  const detail = [receiverAge ? `${receiverAge}세` : null, receiverRegion]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-center gap-4 py-5">
      <Link
        to={`/profile/${receiverId}`}
        state={{ from: '/chat?tab=sent' }}
        aria-label={`${receiverNickname}님의 프로필 보기`}
        className="shrink-0"
      >
        <DessertAvatar
          src={receiverAvatarUrl}
          className={cn('size-16', dimmed && 'opacity-50')}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[19px] leading-7 font-bold">
            {receiverNickname}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-[13px] leading-5 font-bold',
              badge.className,
            )}
          >
            {badge.label}
          </span>
        </div>
        {detail && (
          <p className="text-ink-muted truncate text-[14px] leading-5">
            {detail}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-ink-muted truncate text-[14px] leading-5">
            {STATUS_NOTES[status]}
          </p>
          {status === 'ACCEPTED' && chatRoomId != null ? (
            <Link
              to={`/chat/${chatRoomId}`}
              className="text-ink shrink-0 text-[13px] leading-5 font-bold underline underline-offset-2"
            >
              채팅방 가기
            </Link>
          ) : (
            <time
              dateTime={createdAt}
              className="text-my-muted shrink-0 text-[13px] leading-5"
            >
              {formatRelativeTime(createdAt)}
            </time>
          )}
        </div>
      </div>
    </li>
  );
}

/** 채팅 탭의 "보낸 요청" — 내가 대화를 요청해 둔 상대와 처리 상태를 보여준다 */
export default function SentRequestsPanel() {
  const {
    data: sent,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: matchKeys.sent,
    queryFn: fetchSentRequests,
    refetchOnMount: 'always',
  });

  // 대기 중인 요청을 위에, 나머지는 최근 순으로 보여준다
  const requests = useMemo(
    () =>
      (sent ?? []).slice().sort((a, b) => {
        const aPending = a.status === 'PENDING' ? 0 : 1;
        const bPending = b.status === 'PENDING' ? 0 : 1;
        return aPending - bPending || b.createdAt.localeCompare(a.createdAt);
      }),
    [sent],
  );

  if (isPending) {
    return (
      <div role="status" className="mt-3">
        <span className="sr-only">보낸 요청을 불러오는 중이에요</span>
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            aria-hidden
            className="flex animate-pulse items-center gap-4 py-5"
          >
            <div className="bg-chip size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="bg-chip h-5 w-2/5 rounded-full" />
              <div className="bg-chip h-4 w-4/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
        <p className="text-ink-muted text-[16px] leading-6">
          보낸 요청을 불러오지 못했어요.
        </p>
        <Button
          type="button"
          variant="brand"
          onClick={() => void refetch()}
          className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
        <div className="bg-mint-100 flex size-20 items-center justify-center rounded-full">
          <Send aria-hidden className="text-mint-deep size-9 stroke-[1.8]" />
        </div>
        <p className="text-ink-muted text-[16px] leading-6">
          보낸 대화 요청이 없어요.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-hairline mt-3 divide-y">
      {requests.map((request) => (
        <SentRequestItem key={request.requestId} request={request} />
      ))}
    </ul>
  );
}
