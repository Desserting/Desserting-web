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
  Sparkles,
  X,
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
import {
  matchKeys,
  type ReceivedRequest,
  type SentRequest,
} from '@/api/matches';
import { fetchMe, userKeys } from '@/api/users';
import PageHeader from '@/components/PageHeader';
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
import { useBookingFlow } from '@/lib/bookingFlow';
import MessageItem from './MessageItem';
import PlaceProposalSheet, { type PlaceProposal } from './PlaceProposalSheet';
import { useChatSocket } from './useChatSocket';

/** 서버가 에러를 알려주지 않으므로, 이 시간 안에 내 메시지가 돌아오지 않으면 실패로 본다 */
const SEND_TIMEOUT_MS = 5000;

/** 일정 제안 안내 말풍선을 이미 봤는지 기억하는 키 */
const COACH_SEEN_KEY = 'chat-proposal-coach-seen';

function readCoachSeen() {
  try {
    return localStorage.getItem(COACH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCoachSeen() {
  try {
    localStorage.setItem(COACH_SEEN_KEY, '1');
  } catch {
    // 저장이 막힌 환경에서는 이번 접속 동안만 닫아 둔다
  }
}

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
  // 안내 말풍선과 "새 기능" 점은 한 번 닫거나 제안을 열어 보면 다시 뜨지 않는다
  const [coachSeen, setCoachSeen] = useState(readCoachSeen);
  const markCoachSeen = () => {
    writeCoachSeen();
    setCoachSeen(true);
  };
  // 열 때마다 key를 바꿔 제안 시트를 처음 단계부터 새로 시작한다
  const [proposal, setProposal] = useState({ open: false, key: 0 });
  const navigate = useNavigate();
  const { startBooking } = useBookingFlow();
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
      // 나간 방에서 시작된 요청은 보낸·받은 요청 목록에서도 바로 지운다
      queryClient.setQueryData<SentRequest[]>(matchKeys.sent, (list) =>
        list?.filter((request) => request.chatRoomId !== roomId),
      );
      queryClient.setQueryData<ReceivedRequest[]>(matchKeys.received, (list) =>
        list?.filter((request) => request.chatRoomId !== roomId),
      );
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

  const showCoach = !coachSeen && !otherLeft;

  const lastMessage = messages[messages.length - 1];
  const lastIsMine = lastMessage ? isMine(lastMessage) : false;
  const isEmpty =
    history.isSuccess && messages.length === 0 && pending.length === 0;

  return (
    <main className="text-ink flex h-dvh flex-col bg-white">
      <div className="shrink-0 px-6">
        <PageHeader
          className="pb-4"
          backTo="/chat"
          title={
            <>
              <DessertAvatar
                src={room?.otherUserAvatarUrl}
                className="size-6 shrink-0"
              />
              <span className="truncate">{otherNickname}</span>
            </>
          }
          right={
            <button
              type="button"
              aria-label="채팅방 나가기"
              onClick={() => setLeaveOpen(true)}
              className="block size-6 cursor-pointer"
            >
              <LogOut aria-hidden className="size-6" strokeWidth={1.8} />
            </button>
          }
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto px-6 pt-2',
          // 안내 말풍선이 마지막 메시지를 가리지 않도록 그만큼 비워 둔다
          showCoach ? 'pb-[72px]' : 'pb-3',
        )}
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

      {/* 입력창 바로 위, 가운데에 나란히 놓은 두 기능. 대화 영역 밖이라 말풍선과 겹치지 않는다 */}
      <div className="shrink-0 px-6 pb-6">
        <div className="relative flex justify-center gap-2">
          {showCoach && (
            <div
              role="note"
              className="bg-coach absolute bottom-full left-1/2 z-10 mb-3.5 flex w-max max-w-full -translate-x-1/2 items-center gap-2.5 rounded-[14px] py-2.5 pr-2.5 pl-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <Sparkles
                aria-hidden
                className="size-5 shrink-0 text-white"
                strokeWidth={1.8}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] leading-[19px] font-bold text-white">
                  카페 일정, 이렇게 제안해 보세요
                </p>
                <p className="text-coach-sub text-[12px] leading-[17px]">
                  직접 고르거나 AI 추천도 받을 수 있어요
                </p>
              </div>
              {/* 아이콘은 16px로 보이고, 누르는 영역만 24px로 넓힌다 */}
              <button
                type="button"
                aria-label="안내 닫기"
                onClick={markCoachSeen}
                className="-mx-1 flex size-6 shrink-0 cursor-pointer items-center justify-center text-white"
              >
                <X aria-hidden className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          )}
          <div className="relative">
            {showCoach && (
              <span
                aria-hidden
                className="bg-coach absolute bottom-full left-1/2 z-10 mb-[7px] h-2 w-4 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]"
              />
            )}
            <Button
              type="button"
              variant="brand"
              disabled={otherLeft}
              onClick={() => {
                markCoachSeen();
                setProposal((prev) => ({ open: true, key: prev.key + 1 }));
              }}
              className="h-10 cursor-pointer gap-1.5 rounded-[22px] py-2.5 pr-4 pl-3.5 text-[14px] font-bold shadow-[0_4px_10px_rgba(140,226,208,0.5)] [&_svg:not([class*='size-'])]:size-[18px]"
            >
              <CalendarDays aria-hidden strokeWidth={1.5} />
              일정 제안하기
            </Button>
            {!coachSeen && !otherLeft && (
              <span
                aria-hidden
                className="bg-new-dot absolute -top-[5px] -right-0.5 box-border size-2.5 rounded-full border-2 border-white"
              />
            )}
          </div>
          <Button
            type="button"
            variant="social"
            onClick={() => startBooking(`/chat/${roomId}`)}
            className="border-field-line h-10 cursor-pointer gap-1.5 rounded-[22px] py-2.5 pr-4 pl-3.5 text-[14px] font-bold [&_svg:not([class*='size-'])]:size-[18px]"
          >
            <Clock aria-hidden strokeWidth={1.5} />
            카페 방문 예약하기
          </Button>
        </div>
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
