import { useQuery } from '@tanstack/react-query';
import { MessageCircleOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { chatKeys, fetchChatRooms, type ChatRoom } from '@/api/chat';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import DessertAvatar from '@/components/DessertAvatar';
import SentRequestsPanel from './SentRequestsPanel';

function RoomItem({ room }: { room: ChatRoom }) {
  const { roomId, otherUserNickname, lastMessagePreview, lastMessageAt } = room;

  return (
    <li>
      <Link
        to={`/chat/${roomId}`}
        className="active:bg-surface -mx-3 flex items-center gap-4 rounded-2xl px-3 py-6 transition-colors"
      >
        <DessertAvatar src={room.otherUserAvatarUrl} className="size-16" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[20px] leading-7 font-bold">
              {otherUserNickname}
            </p>
            {lastMessageAt && (
              <time
                dateTime={lastMessageAt}
                className="text-my-muted shrink-0 text-[14px] leading-5"
              >
                {formatRelativeTime(lastMessageAt)}
              </time>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p
              className={cn(
                'truncate text-[17px] leading-6',
                room.unreadCount > 0 && 'font-bold',
              )}
            >
              {lastMessagePreview}
            </p>
            {room.unreadCount > 0 && (
              <span
                role="status"
                aria-label={`안 읽은 메시지 ${room.unreadCount}개`}
                className="bg-mint-deep flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[12px] leading-5 font-bold text-white"
              >
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

const TABS = [
  { id: 'rooms', label: '대화 목록' },
  { id: 'sent', label: '보낸 요청' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ChatListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // 프로필을 보고 돌아와도 보던 탭이 유지되도록 URL에 둔다
  const tab: TabId = searchParams.get('tab') === 'sent' ? 'sent' : 'rooms';
  const isRoomsTab = tab === 'rooms';
  const selectTab = (next: TabId) =>
    setSearchParams(next === 'rooms' ? {} : { tab: next }, { replace: true });

  // 목록의 마지막 메시지·안 읽은 수는 실시간 갱신되지 않으므로 화면에 들어올 때마다 다시 불러온다
  const {
    data: rooms,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: chatKeys.rooms,
    queryFn: fetchChatRooms,
    refetchOnMount: 'always',
    enabled: isRoomsTab,
  });

  return (
    <>
      <main className="text-ink flex flex-1 flex-col bg-white px-6">
        <PageHeader title="채팅" />

        <div role="tablist" className="mt-5 grid grid-cols-2 gap-2">
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
                  'relative flex h-12 cursor-pointer items-center justify-center rounded-2xl px-2 text-[15px] font-bold whitespace-nowrap',
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

        {!isRoomsTab && <SentRequestsPanel />}

        {isRoomsTab && isPending && (
          <div role="status" className="mt-3">
            <span className="sr-only">채팅 목록을 불러오는 중이에요</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                aria-hidden
                className="flex animate-pulse items-center gap-4 py-6"
              >
                <div className="bg-chip size-16 shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="bg-chip h-5 w-2/5 rounded-full" />
                  <div className="bg-chip h-4 w-4/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isRoomsTab && isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <p className="text-ink-muted text-[16px] leading-6">
              채팅 목록을 불러오지 못했어요.
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

        {isRoomsTab && rooms && rooms.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <div className="bg-mint-100 flex size-20 items-center justify-center rounded-full">
              <MessageCircleOff
                aria-hidden
                className="text-mint-deep size-9 stroke-[1.8]"
              />
            </div>
            <p className="text-ink-muted text-[16px] leading-6">
              아직 시작한 대화가 없어요.
            </p>
          </div>
        )}

        {isRoomsTab && rooms && rooms.length > 0 && (
          <ul className="mt-3">
            {rooms.map((room) => (
              <RoomItem key={room.roomId} room={room} />
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </>
  );
}
