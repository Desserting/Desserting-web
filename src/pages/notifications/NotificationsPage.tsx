import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BellOff } from 'lucide-react';
import {
  HEART_TYPE_LABELS,
  fetchHeartHistory,
  heartKeys,
  type HeartHistoryItem,
} from '@/api/hearts';
import { fetchMe, userKeys } from '@/api/users';
import heart from '@/assets/hearts/heart.svg';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notificationStore';

function HistoryItem({
  item,
  unread,
}: {
  item: HeartHistoryItem;
  unread: boolean;
}) {
  const used = item.amount < 0;

  return (
    <li className="flex items-center gap-4 py-5">
      <div className="bg-mint-100 flex size-[52px] shrink-0 items-center justify-center rounded-full">
        <img src={heart} alt="" className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[17px] leading-6 break-keep',
            unread && 'font-bold',
          )}
        >
          {item.description ?? HEART_TYPE_LABELS[item.type]}
        </p>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-5">
          하트 {Math.abs(item.amount)}개 {used ? '사용' : '받음'} · 남은 하트{' '}
          {item.balanceAfter}개
        </p>
      </div>
      <time
        dateTime={item.createdAt}
        className="text-ink-muted shrink-0 self-start pt-1 text-[13px] leading-5"
      >
        {formatRelativeTime(item.createdAt)}
      </time>
    </li>
  );
}

export default function NotificationsPage() {
  const {
    data: history,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: heartKeys.history,
    queryFn: fetchHeartHistory,
    refetchOnMount: 'always',
  });
  const me = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  const markSeen = useNotificationStore((state) => state.markHeartHistorySeen);

  // 이 화면에 들어오기 전까지 확인하지 못한 기록만 굵게 보여준다
  const [seenBefore] = useState(
    () => useNotificationStore.getState().lastSeenHeartHistoryId,
  );

  // 화면을 열어 확인한 기록은 읽음으로 바꿔 홈의 알림 뱃지를 지운다
  useEffect(() => {
    if (!history || history.length === 0) return;
    markSeen(Math.max(...history.map((item) => item.id)));
  }, [history, markSeen]);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-10">
      <BackButton to="/home" />
      <h1 className="text-center text-[19px] leading-6 font-bold">알림</h1>
      {me.data && (
        <p className="text-ink-muted mt-6 text-center text-[14px] leading-5">
          보유 하트 {me.data.heartCount}개{me.data.isPremium && ' · 프리미엄'}
        </p>
      )}

      {isPending && (
        <p role="status" className="text-ink-muted mt-24 text-center">
          알림을 불러오는 중이에요...
        </p>
      )}

      {isError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
          <p className="text-ink-muted text-[16px] leading-6">
            알림을 불러오지 못했어요.
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
      )}

      {history && history.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
          <div className="bg-mint-100 flex size-20 items-center justify-center rounded-full">
            <BellOff
              aria-hidden
              className="text-mint-deep size-9 stroke-[1.8]"
            />
          </div>
          <p className="text-ink-muted text-[16px] leading-6">
            아직 하트 사용 기록이 없어요.
          </p>
        </div>
      )}

      {history && history.length > 0 && (
        <ul className="divide-hairline mt-2 divide-y">
          {history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              unread={item.id > seenBefore}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
