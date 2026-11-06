import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  ArrowUp,
  CakeSlice,
  CalendarDays,
  Clock,
  Loader2,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type UIEvent,
} from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  MESSAGE_PAGE_SIZE,
  chatKeys,
  fetchChatMessages,
  fetchChatRooms,
  leaveChatRoom,
  markChatRoomRead,
  type ChatMessage,
  type ChatMessageType,
} from '@/api/chat';
import { fetchMe, userKeys } from '@/api/users';
import BackButton from '@/components/BackButton';
import Bubble from '@/components/Bubble';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDayLabel, getDayKey } from '@/lib/datetime';
import { getApiError } from '@/lib/axios';
import { cn } from '@/lib/utils';
import DessertAvatar from '@/components/DessertAvatar';
import { rememberBookingOrigin } from '@/pages/explore/cafeNavigation';
import MessageItem from './MessageItem';
import PlaceProposalSheet, { type PlaceProposal } from './PlaceProposalSheet';
import { useChatSocket } from './useChatSocket';

/** 서버가 에러를 알려주지 않으므로, 이 시간 안에 내 메시지가 돌아오지 않으면 실패로 본다 */
const SEND_TIMEOUT_MS = 5000;

type MessagePages = InfiniteData<ChatMessage[], string | undefined>;

interface PendingMessage {
  id: string;
  messageType: ChatMessageType;
  content: string;
  metadata?: object;
  failed: boolean;
}

/** 대화를 불러오는 동안 말풍선 모양 자리표시자를 보여준다 */
function MessagesSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4 pt-2">
      <span className="sr-only">대화를 불러오는 중이에요</span>
      {[
        'h-14 w-[58%]',
        'h-11 w-[40%] self-end',
        'h-20 w-[66%]',
        'h-11 w-[48%] self-end',
      ].map((size) => (
        <div
          key={size}
          aria-hidden
          className={cn('bg-chip animate-pulse rounded-[22px]', size)}
        />
      ))}
    </div>
  );
}

function ChatRoom({ roomId }: { roomId: number }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  // 열 때마다 key를 바꿔 제안 시트를 처음 단계부터 새로 시작한다
  const [proposal, setProposal] = useState({ open: false, key: 0 });
  const navigate = useNavigate();
  // 이 화면에 있는 동안 실시간으로 도착한 메시지. 이 메시지들만 등장 애니메이션을 준다
  const [liveIds, setLiveIds] = useState<ReadonlySet<string>>(new Set());

  const rooms = useQuery({ queryKey: chatKeys.rooms, queryFn: fetchChatRooms });
  const room = rooms.data?.find((item) => item.roomId === roomId);
  const otherNickname = room?.otherUserNickname;
  // 상대가 방을 나가면 서버가 메시지를 받지 않으므로 입력을 막는다
  const otherLeft = room?.otherUserLeft === true;
  const me = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  const myId = me.data?.userId;

  const history = useInfiniteQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: ({ pageParam }) => fetchChatMessages(roomId, pageParam),
    initialPageParam: undefined as string | undefined,
    // 한 페이지가 가득 찼을 때만 가장 오래된 메시지를 커서로 다음 페이지를 이어 받는다
    getNextPageParam: (lastPage) =>
      lastPage.length >= MESSAGE_PAGE_SIZE
        ? lastPage[lastPage.length - 1].messageId
        : undefined,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = history;

  // 페이지는 최신순이므로 이어 붙인 뒤 뒤집어 오래된 메시지가 위로 오게 한다
  const messages = useMemo(
    () => (history.data?.pages.flat() ?? []).slice().reverse(),
    [history.data],
  );

  // 내 userId로 가려내고, 아직 모를 때만 상대 닉네임과 비교한다
  const isMine = useCallback(
    (message: ChatMessage) =>
      myId !== undefined
        ? message.senderId === myId
        : otherNickname !== undefined &&
          message.senderNickname !== otherNickname,
    [myId, otherNickname],
  );

  const isMineRef = useRef(isMine);
  const timersRef = useRef(new Set<number>());
  useEffect(() => {
    isMineRef.current = isMine;
  });
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const handleIncoming = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<MessagePages>(
        chatKeys.messages(roomId),
        (old) => {
          if (!old) return old;
          const exists = old.pages.some((page) =>
            page.some((item) => item.messageId === message.messageId),
          );
          if (exists) return old;
          const [newest = [], ...older] = old.pages;
          return { ...old, pages: [[message, ...newest], ...older] };
        },
      );

      if (message.messageType === 'SYSTEM') {
        // 상대가 나갔다는 안내 등은 방 상태(otherUserLeft)도 바꾸므로 목록을 다시 불러온다
        void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      } else if (isMineRef.current(message)) {
        // 돌아온 내 메시지는 대기 중이던 같은 내용의 메시지와 맞바꾼다
        // (대기 중일 때 이미 등장 애니메이션을 보여줬으므로 다시 튀어나오지 않게 한다)
        setPending((list) => {
          const index = list.findIndex(
            (item) => item.content === message.content,
          );
          return index === -1 ? list : list.filter((_, i) => i !== index);
        });
      } else {
        setLiveIds((ids) => new Set(ids).add(message.messageId));
        // 방을 보는 중에 받은 상대 메시지는 바로 읽음 처리한다. 실패해도 대화에는 영향이 없다
        markChatRoomRead(roomId).catch(() => undefined);
      }
    },
    [queryClient, roomId],
  );

  const socket = useChatSocket(roomId, handleIncoming);

  const sendMessage = useCallback(
    (
      content: string,
      messageType: ChatMessageType = 'TEXT',
      metadata?: object,
    ) => {
      if (!socket.send(content, messageType, metadata)) return false;

      const id = crypto.randomUUID();
      setPending((list) => [
        ...list,
        { id, messageType, content, metadata, failed: false },
      ]);
      const timer = window.setTimeout(() => {
        timersRef.current.delete(timer);
        setPending((list) =>
          list.map((item) =>
            item.id === id ? { ...item, failed: true } : item,
          ),
        );
      }, SEND_TIMEOUT_MS);
      timersRef.current.add(timer);
      return true;
    },
    [socket],
  );

  const ensureConnected = () => {
    if (socket.status === 'connected') return true;
    setNotice(
      socket.status === 'error'
        ? '채팅방에 들어갈 수 없어요.'
        : '연결 중이에요. 잠시 후 다시 시도해 주세요.',
    );
    return false;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || otherLeft || !ensureConnected()) return;
    setNotice(null);
    if (sendMessage(content)) setText('');
  };

  /** 직접 고른 카페 방문 제안을 보낸다. 연결이 안 돼 못 보내면 false */
  const handlePropose = ({ content, metadata }: PlaceProposal) => {
    if (otherLeft || socket.status !== 'connected') return false;
    setNotice(null);
    return sendMessage(content, 'PLACE_PROPOSAL', metadata);
  };

  const handleRetry = (item: PendingMessage) => {
    if (!ensureConnected()) return;
    setPending((list) => list.filter((entry) => entry.id !== item.id));
    sendMessage(item.content, item.messageType, item.metadata);
  };

  const leaveRoom = useMutation({
    mutationFn: () => leaveChatRoom(roomId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: chatKeys.messages(roomId) });
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      navigate('/chat', { replace: true });
    },
    onError: (error) => {
      setLeaveOpen(false);
      setNotice(
        getApiError(error)?.message ??
          '채팅방을 나가지 못했어요. 다시 시도해 주세요.',
      );
    },
  });

  // 처음엔 맨 아래, 새 메시지는 맨 아래를 보고 있을 때만 따라가고, 이전 메시지를 받으면 보던 위치를 유지한다
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const heightBeforePrependRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (heightBeforePrependRef.current !== null) {
      element.scrollTop = element.scrollHeight - heightBeforePrependRef.current;
      heightBeforePrependRef.current = null;
    } else if (stickToBottomRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages.length, pending.length]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    stickToBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    if (element.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      heightBeforePrependRef.current = element.scrollHeight;
      void fetchNextPage();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const lastIsMine = lastMessage ? isMine(lastMessage) : false;
  const isEmpty =
    history.isSuccess && messages.length === 0 && pending.length === 0;

  return (
    <main className="text-ink flex h-dvh flex-col bg-white">
      <header className="relative shrink-0 px-6 pt-[34px] pb-4">
        <BackButton to="/chat" />
        <h1 className="flex items-center justify-center gap-2 px-9 text-[19px] leading-6 font-bold">
          <DessertAvatar src={room?.otherUserAvatarUrl} className="size-6" />
          <span className="truncate">{otherNickname}</span>
        </h1>
        <button
          type="button"
          aria-label="채팅방 나가기"
          onClick={() => setLeaveOpen(true)}
          className="absolute top-[34px] right-[26px] block size-6 cursor-pointer"
        >
          <LogOut aria-hidden className="size-6" strokeWidth={1.8} />
        </button>
      </header>

      {/* 헤더 바로 밑에 떠 있는 제안 버튼. 버튼 말고는 배경이 투명해서 대화가 비쳐 보이고 클릭도 통과한다 */}
      <div className="pointer-events-none relative z-10 h-0 px-6">
        <Button
          type="button"
          variant="brand"
          disabled={otherLeft}
          onClick={() =>
            setProposal((prev) => ({ open: true, key: prev.key + 1 }))
          }
          aria-label="카페 방문 제안하기"
          className="bg-mint-100 text-mint-deep hover:bg-mint-100/80 border-mint-deep/30 pointer-events-auto absolute top-3 right-6 size-10 cursor-pointer rounded-full border p-0 [&_svg:not([class*='size-'])]:size-5"
        >
          <CalendarDays aria-hidden strokeWidth={1.8} />
        </Button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-6 pt-[64px] pb-[76px]"
      >
        {isFetchingNextPage && (
          <p
            role="status"
            className="text-ink-muted pb-4 text-center text-[13px]"
          >
            이전 메시지를 불러오는 중...
          </p>
        )}
        {history.isPending && <MessagesSkeleton />}
        {history.isError && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="text-ink-muted">대화를 불러오지 못했어요.</p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void history.refetch()}
              className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
            >
              다시 시도
            </Button>
          </div>
        )}
        {isEmpty && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <div className="bg-mint-100 flex size-20 items-center justify-center rounded-full">
              <MessageCircle
                aria-hidden
                className="text-mint-deep size-9 stroke-[1.8]"
              />
            </div>
            <p className="text-ink-muted text-center text-[16px] leading-6">
              아직 메시지가 없어요.
              <br />
              먼저 인사를 건네 보세요!
            </p>
          </div>
        )}

        <ul>
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const next = messages[index + 1];
            const mine = isMine(message);
            // 같은 사람이 같은 날 이어서 보낸 일반 메시지끼리 한 묶음으로 본다
            const sameGroup = (other?: ChatMessage) =>
              other !== undefined &&
              other.messageType !== 'SYSTEM' &&
              message.messageType !== 'SYSTEM' &&
              isMine(other) === mine &&
              other.senderId === message.senderId &&
              getDayKey(other.createdAt) === getDayKey(message.createdAt);
            const newDay =
              !previous ||
              getDayKey(previous.createdAt) !== getDayKey(message.createdAt);

            return (
              <Fragment key={message.messageId}>
                {newDay && (
                  <li
                    role="separator"
                    className="mt-5 mb-4 flex justify-center first:mt-0"
                  >
                    <span className="bg-chip text-ink-muted rounded-full px-3 py-1 text-[12px]">
                      {formatDayLabel(message.createdAt)}
                    </span>
                  </li>
                )}
                <MessageItem
                  message={message}
                  mine={mine}
                  startsGroup={!sameGroup(previous)}
                  endsGroup={!sameGroup(next)}
                  live={liveIds.has(message.messageId)}
                />
              </Fragment>
            );
          })}

          {pending.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex justify-end',
                index === 0 && (!lastMessage || !lastIsMine)
                  ? 'mt-4'
                  : 'mt-1.5',
              )}
            >
              <div className="flex max-w-[78%] min-w-0 flex-col items-end gap-1">
                <Bubble
                  side="right"
                  tail={index === 0 && !lastIsMine}
                  className={cn('max-w-full', !item.failed && 'opacity-60')}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {item.content}
                  </p>
                </Bubble>
                {item.failed ? (
                  <button
                    type="button"
                    onClick={() => handleRetry(item)}
                    className="text-destructive cursor-pointer px-1 text-[12px] font-bold"
                  >
                    전송 실패 · 다시 보내기
                  </button>
                ) : (
                  <span className="text-my-muted px-1 text-[12px]">
                    전송 중...
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 입력창 바로 위에 떠 있는 예약 버튼. 버튼 말고는 배경이 투명해서 대화가 비쳐 보이고 클릭도 통과한다 */}
      <div className="pointer-events-none relative z-10 h-0 px-6">
        <Button
          type="button"
          variant="brand"
          onClick={() => {
            rememberBookingOrigin();
            navigate('/explore', { state: { bookingFrom: `/chat/${roomId}` } });
          }}
          className="pointer-events-auto absolute bottom-4 left-6 flex h-11 w-fit cursor-pointer gap-2.5 rounded-[20px] py-0 pr-5 pl-1.5 text-[15px] font-normal shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-white/60"
          >
            <Clock className="size-[18px]" strokeWidth={1.8} />
          </span>
          카페 방문 예약하기
        </Button>
      </div>

      <footer className="shrink-0 px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
        {notice && (
          <p
            role="alert"
            className="text-destructive mb-2 text-center text-[14px]"
          >
            {notice}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className={cn(
            'border-field focus-within:border-mint-deep flex h-[60px] items-center gap-2 rounded-full border pr-3 pl-[18px] transition-colors',
            otherLeft && 'bg-surface',
          )}
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={otherLeft}
            aria-label="메시지 입력"
            placeholder={
              otherLeft
                ? '상대가 채팅방을 나가 메시지를 보낼 수 없어요'
                : '메시지 입력...'
            }
            className="placeholder:text-my-muted min-w-0 flex-1 bg-transparent text-[17px] outline-none"
          />
          {text.trim() && !otherLeft ? (
            <button
              type="submit"
              aria-label="보내기"
              className="bg-mint flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
            >
              <ArrowUp aria-hidden className="size-5" strokeWidth={2.2} />
            </button>
          ) : (
            <CakeSlice
              aria-hidden
              className="mr-1.5 size-7 shrink-0"
              strokeWidth={1.8}
            />
          )}
        </form>
      </footer>

      <PlaceProposalSheet
        key={proposal.key}
        roomId={roomId}
        open={proposal.open}
        onOpenChange={(open) => setProposal((prev) => ({ ...prev, open }))}
        onPropose={handlePropose}
      />

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>채팅방을 나갈까요?</DialogTitle>
          <DialogDescription>나가면 채팅 목록에서 사라져요.</DialogDescription>
          <div className="grid grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="h-11">
                취소
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={leaveRoom.isPending}
              onClick={() => leaveRoom.mutate()}
              className="h-11 cursor-pointer"
            >
              {leaveRoom.isPending ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                '나가기'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const id = Number(roomId);
  if (!Number.isInteger(id) || id <= 0) return <Navigate to="/chat" replace />;

  // 방이 바뀌면 입력·대기 중 메시지·소켓 상태를 새로 시작한다
  return <ChatRoom key={id} roomId={id} />;
}
