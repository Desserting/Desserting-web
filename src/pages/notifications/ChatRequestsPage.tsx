import { BellOff } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatRequestStore } from '@/stores/chatRequestStore';
import type { ChatRequest } from './chatRequests';

function RequestItem({ request }: { request: ChatRequest }) {
  const respond = useChatRequestStore((state) => state.respond);
  const { id, nickname, avatar, status } = request;

  return (
    <li className="flex items-start gap-4 py-6">
      <img
        src={avatar}
        alt=""
        className={cn(
          'size-[74px] shrink-0 rounded-full object-cover',
          status === 'rejected' && 'opacity-50',
        )}
      />
      <div className="min-w-0 flex-1">
        {status === 'pending' && (
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
                onClick={() => respond(id, 'accepted')}
                aria-label={`${nickname}님의 대화 요청 수락`}
                className="h-11 cursor-pointer rounded-[12px] text-[17px] font-bold"
              >
                수락
              </Button>
              <Button
                type="button"
                onClick={() => respond(id, 'rejected')}
                aria-label={`${nickname}님의 대화 요청 거절`}
                className="bg-chip text-ink hover:bg-chip/70 h-11 cursor-pointer rounded-[12px] text-[17px] font-bold"
              >
                거절
              </Button>
            </div>
          </>
        )}
        {status === 'accepted' && (
          <div role="status" className="animate-in fade-in-0 pt-1.5">
            <p className="text-[17px] leading-6 font-bold break-keep">
              {nickname}님과
              <br />
              대화를 시작할 수 있어요!
            </p>
            <p className="bg-mint-100 text-mint-deep mt-3 inline-block rounded-full px-3 py-1 text-[13px] leading-5 font-bold">
              수락 완료
            </p>
          </div>
        )}
        {status === 'rejected' && (
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
      </div>
    </li>
  );
}

export default function ChatRequestsPage() {
  const requests = useChatRequestStore((state) => state.requests);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-10">
      <BackButton to="/home" />
      <h1 className="text-center text-[19px] leading-6 font-bold">대화 요청</h1>

      {requests.length === 0 ? (
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
      ) : (
        <ul className="divide-hairline mt-6 divide-y">
          {requests.map((request) => (
            <RequestItem key={request.id} request={request} />
          ))}
        </ul>
      )}
    </main>
  );
}
