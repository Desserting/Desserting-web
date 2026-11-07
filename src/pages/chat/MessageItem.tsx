import { Coffee } from 'lucide-react';
import { parseProposal, type ChatMessage } from '@/api/chat';
import Bubble from '@/components/Bubble';
import {
  formatClock,
  formatDayLabel,
  formatProposalDate,
} from '@/lib/datetime';
import { cn } from '@/lib/utils';
import ReservationMessageCard from './ReservationMessageCard';

/** 카페 방문 제안(PLACE_PROPOSAL)을 말풍선 안의 카드로 보여준다 */
function ProposalCard({ message }: { message: ChatMessage }) {
  const proposal = parseProposal(message.metadata);
  // 예전 시간 포함 제안도 표시하고, 새 날짜 전용 제안은 날짜만 보여준다.
  const schedule = proposal?.proposedDate
    ? proposal.proposedTime
      ? formatProposalDate(proposal.proposedDate, proposal.proposedTime)
      : formatDayLabel(proposal.proposedDate)
    : '일시 미정';

  return (
    <div className="flex flex-col gap-2.5">
      {proposal && (
        <div className="text-ink rounded-2xl bg-white px-3.5 py-3 font-normal">
          <div className="flex items-center justify-between gap-2">
            <p className="text-mint-deep flex items-center gap-1.5 text-[13px] font-bold">
              <Coffee aria-hidden className="size-4" />
              디저트 카페 만남 제안
            </p>
            {/* 서버 상태가 아니라 화면 표시용 뱃지다 */}
            <span className="bg-mint-100 text-mint-deep shrink-0 rounded-full px-2 py-0.5 text-[12px] font-bold">
              제안됨
            </span>
          </div>
          <p className="mt-1.5 text-[17px] leading-6 font-bold">
            {proposal.storeName}
          </p>
          {proposal.storeAddress && (
            <p className="text-ink-muted mt-0.5 text-[14px]">
              {proposal.storeAddress}
            </p>
          )}
          {proposal.recommendedMenus && (
            <p className="mt-2 text-[14px] leading-5">
              <span className="text-ink-muted">추천 메뉴 · </span>
              <span className="font-bold">
                {proposal.recommendedMenus.join(', ')}
              </span>
            </p>
          )}
          {proposal.reason && (
            <p className="text-ink-muted mt-1 text-[14px] leading-5 break-words">
              {proposal.reason}
            </p>
          )}
          <p className="bg-mint-50 mt-2.5 rounded-lg px-2.5 py-1.5 text-[14px]">
            약속 일시 · <span className="font-bold">{schedule}</span>
          </p>
        </div>
      )}
      {message.content && (
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
      )}
    </div>
  );
}

function MessageBody({ message }: { message: ChatMessage }) {
  if (message.messageType === 'RESERVATION_CARD') {
    return <ReservationMessageCard message={message} />;
  }
  if (message.messageType === 'PLACE_PROPOSAL') {
    return <ProposalCard message={message} />;
  }
  return <p className="break-words whitespace-pre-wrap">{message.content}</p>;
}

interface MessageItemProps {
  message: ChatMessage;
  mine: boolean;
  /** 같은 사람이 이어서 보낸 메시지 묶음의 첫 번째인지 */
  startsGroup: boolean;
  /** 묶음의 마지막인지. 시간은 묶음의 마지막에만 보여준다 */
  endsGroup: boolean;
  /** 방금 실시간으로 도착한 메시지인지. 처음 불러온 기록은 애니메이션 없이 보여준다 */
  live: boolean;
}

export default function MessageItem({
  message,
  mine,
  startsGroup,
  endsGroup,
  live,
}: MessageItemProps) {
  if (message.messageType === 'SYSTEM') {
    return (
      <li className="text-ink-muted py-1 text-center text-[13px]">
        {message.content}
      </li>
    );
  }

  return (
    <li
      className={cn(
        'flex gap-2.5',
        mine ? 'justify-end' : 'justify-start',
        startsGroup ? 'mt-4 first:mt-0' : 'mt-1.5',
      )}
    >
      <div
        className={cn(
          'flex max-w-[78%] min-w-0 flex-col gap-1',
          mine ? 'items-end' : 'items-start',
        )}
      >
        {message.messageType === 'IMAGE' ? (
          <img
            src={message.content}
            alt="보낸 사진"
            className="max-h-72 rounded-[22px] object-cover"
          />
        ) : (
          <Bubble
            tone={mine ? 'mint' : 'chip'}
            side={mine ? 'right' : 'left'}
            tail={startsGroup}
            animated={live}
            className="max-w-full"
          >
            <MessageBody message={message} />
          </Bubble>
        )}
        {endsGroup && (
          <time
            dateTime={message.createdAt}
            className="text-my-muted px-1 text-[12px]"
          >
            {formatClock(message.createdAt)}
          </time>
        )}
      </div>
    </li>
  );
}
