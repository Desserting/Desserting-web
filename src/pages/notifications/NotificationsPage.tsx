import { useEffect } from 'react';
import { BellOff } from 'lucide-react';
import heart from '@/assets/hearts/heart.svg';
import BackButton from '@/components/BackButton';
import { formatRelativeTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { useHeartStore, type HeartHistoryItem } from '@/stores/heartStore';

function HistoryItem({ item }: { item: HeartHistoryItem }) {
  return (
    <li className="flex items-center gap-4 py-5">
      <div className="bg-mint-100 flex size-[52px] shrink-0 items-center justify-center rounded-full">
        <img src={heart} alt="" className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[17px] leading-6 break-keep',
            !item.read && 'font-bold',
          )}
        >
          {item.targetNickname}님에게 대화를 요청했어요
        </p>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-5">
          하트 {Math.abs(item.amount)}개 사용 · 남은 하트 {item.balanceAfter}개
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
  const history = useHeartStore((state) => state.history);
  const heartCount = useHeartStore((state) => state.heartCount);
  const markAllRead = useHeartStore((state) => state.markAllRead);

  // 화면을 열어 확인한 기록은 읽음으로 바꿔 홈의 알림 뱃지를 지운다
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-10">
      <BackButton to="/home" />
      <h1 className="text-center text-[19px] leading-6 font-bold">알림</h1>
      <p className="text-ink-muted mt-6 text-center text-[14px] leading-5">
        보유 하트 {heartCount}개
      </p>

      {history.length === 0 ? (
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
      ) : (
        <ul className="divide-hairline mt-2 divide-y">
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </main>
  );
}
