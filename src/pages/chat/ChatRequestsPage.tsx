import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { chatKeys, fetchChatRooms } from '@/api/chat';
import {
  REQUEST_ERROR_MESSAGES,
  acceptRequest,
  fetchReceivedRequests,
  hideLeftRooms,
  matchKeys,
  rejectRequest,
  type ReceivedRequest,
} from '@/api/matches';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';
import { cn } from '@/lib/utils';
import DessertAvatar from '@/components/DessertAvatar';

function RequestItem({ request }: { request: ReceivedRequest }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const {
    requestId,
    senderNickname: nickname,
    senderAvatarUrl,
    status,
    chatRoomId,
  } = request;

  // 처리한 결과를 목록 캐시에 바로 반영해서 화면이 즉시 바뀌게 한다
  const settle = (patch: Partial<ReceivedRequest>) =>
    queryClient.setQueryData<ReceivedRequest[]>(matchKeys.received, (list) =>
      list?.map((item) =>
        item.requestId === requestId ? { ...item, ...patch } : item,
      ),
    );

  const handleError = (cause: unknown) => {
    const apiError = getApiError(cause);
    setError(
      (apiError && REQUEST_ERROR_MESSAGES[apiError.code]) ??
        apiError?.message ??
        '처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
    );
    // 이미 처리됐거나 만료된 요청이면 서버 상태와 맞추기 위해 목록을 다시 불러온다
    if (apiError && apiError.code in REQUEST_ERROR_MESSAGES) {
      void queryClient.invalidateQueries({ queryKey: matchKeys.received });
    }
  };

  const accept = useMutation({
    mutationFn: () => acceptRequest(requestId),
    onMutate: () => setError(null),
    onSuccess: (result) => {
      settle({ status: 'ACCEPTED', chatRoomId: result.chatRoomId });
      // 새로 생긴 채팅방이 채팅 목록에 보이도록 목록을 다시 불러온다
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      navigate(`/chat/${result.chatRoomId}`);
    },
    onError: handleError,
  });

  const reject = useMutation({
    mutationFn: () => rejectRequest(requestId),
    onMutate: () => setError(null),
    onSuccess: () => settle({ status: 'REJECTED' }),
    onError: handleError,
  });

  const busy = accept.isPending || reject.isPending;

  return (
    <li className="flex items-start gap-4 py-6">
      <DessertAvatar
        src={senderAvatarUrl}
        className={cn(
          'size-[74px]',
          (status === 'REJECTED' || status === 'EXPIRED') && 'opacity-50',
        )}
      />
      <div className="min-w-0 flex-1">
        {status === 'PENDING' && (
          <>
            <p className="pt-1.5 text-[17px] leading-6 font-bold break-keep">
              {nickname}님과 대화를
              <br />
              요청할까요?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-[13px]">
              <Button
                type="button"
                variant="brand"
                onClick={() => accept.mutate()}
                disabled={busy}
                aria-label={`${nickname}님의 대화 요청 수락`}
                className="h-11 cursor-pointer rounded-[12px] text-[17px] font-bold"
              >
                수락
              </Button>
              <Button
                type="button"
                onClick={() => reject.mutate()}
                disabled={busy}
                aria-label={`${nickname}님의 대화 요청 거절`}
                className="bg-chip text-ink hover:bg-chip/70 h-11 cursor-pointer rounded-[12px] text-[17px] font-bold"
              >
                거절
              </Button>
            </div>
            {error && (
              <p role="alert" className="text-destructive mt-2 text-[14px]">
                {error}
              </p>
            )}
          </>
        )}
        {status === 'ACCEPTED' && (
          <div role="status" className="animate-in fade-in-0 pt-1.5">
            <p className="text-[17px] leading-6 font-bold break-keep">
              {nickname}님과
              <br />
              대화를 시작할 수 있어요!
            </p>
            <div className="mt-3 flex items-center gap-2">
              <p className="bg-mint-100 text-mint-deep rounded-full px-3 py-1 text-[13px] leading-5 font-bold">
                수락 완료
              </p>
              {chatRoomId !== null && (
                <Link
                  to={`/chat/${chatRoomId}`}
                  className="text-ink text-[13px] leading-5 font-bold underline underline-offset-2"
                >
                  채팅방 가기
                </Link>
              )}
            </div>
          </div>
        )}
        {status === 'REJECTED' && (
          <div role="status" className="animate-in fade-in-0 pt-1.5">
            <p className="text-ink-muted text-[17px] leading-6 font-bold break-keep">
              {nickname}님의
              <br />
              요청을 거절했어요.
            </p>
            <p className="bg-chip text-ink-muted mt-3 inline-block rounded-full px-3 py-1 text-[13px] leading-5 font-bold">
              거절 완료
            </p>
          </div>
        )}
        {status === 'EXPIRED' && (
          <div role="status" className="pt-1.5">
            <p className="text-ink-muted text-[17px] leading-6 font-bold break-keep">
              {nickname}님의
              <br />
              요청이 만료됐어요.
            </p>
            <p className="bg-chip text-ink-muted mt-3 inline-block rounded-full px-3 py-1 text-[13px] leading-5 font-bold">
              만료됨
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

export default function ChatRequestsPage() {
  // 홈의 메시지 버튼으로 들어왔으면 홈으로, 아니면 채팅 목록으로 돌아간다
  const backTo =
    (useLocation().state as { from?: string } | null)?.from ?? '/chat';
  const {
    data: received,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: matchKeys.received,
    queryFn: fetchReceivedRequests,
    refetchOnMount: 'always',
  });

  // 서버가 수락된 요청을 계속 내려줘도, 내가 나가서 목록에 없는 채팅방의 요청은 숨긴다
  const roomsQuery = useQuery({
    queryKey: chatKeys.rooms,
    queryFn: fetchChatRooms,
  });
  const rooms = roomsQuery.data;
  // 채팅방 목록이 오기 전에 보여주면 나간 방의 요청이 잠깐 보였다 사라진다
  const loading = isPending || roomsQuery.isPending;

  // 처리 대기 중인 요청을 위에, 나머지는 최근 순으로 보여준다
  const requests = useMemo(() => {
    const roomIds = rooms && new Set(rooms.map((room) => room.roomId));
    return hideLeftRooms(received ?? [], roomIds)
      .slice()
      .sort((a, b) => {
        const aPending = a.status === 'PENDING' ? 0 : 1;
        const bPending = b.status === 'PENDING' ? 0 : 1;
        return aPending - bPending || b.createdAt.localeCompare(a.createdAt);
      });
  }, [received, rooms]);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pb-10">
      <PageHeader title="대화 요청" backTo={backTo} />

      {loading && (
        <p role="status" className="text-ink-muted mt-24 text-center">
          대화 요청을 불러오는 중이에요...
        </p>
      )}

      {isError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
          <p className="text-ink-muted text-[16px] leading-6">
            대화 요청을 불러오지 못했어요.
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

      {!loading && received && requests.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
          <div className="bg-mint-100 flex size-20 items-center justify-center rounded-full">
            <BellOff
              aria-hidden
              className="text-mint-deep size-9 stroke-[1.8]"
            />
          </div>
          <p className="text-ink-muted text-[16px] leading-6">
            받은 대화 요청이 없어요.
          </p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <ul className="divide-hairline mt-6 divide-y">
          {requests.map((request) => (
            <RequestItem key={request.requestId} request={request} />
          ))}
        </ul>
      )}
    </main>
  );
}
