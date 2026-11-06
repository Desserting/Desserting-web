import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, Loader2, MapPin, Sparkles } from 'lucide-react';
import { useState, type SVGProps } from 'react';
import { requestAiRecommendation } from '@/api/chat';
import { fetchStores, storeKeys } from '@/api/stores';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { getApiError } from '@/lib/axios';
import { toDateKey } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import ProposalCalendar from './ProposalCalendar';

/** 직접 제안으로 보내는 PLACE_PROPOSAL metadata */
export interface PlaceProposalMetadata {
  storeId: number;
  storeName: string;
  /** YYYY-MM-DD */
  proposedDate: string;
}

export interface PlaceProposal {
  content: string;
  metadata: PlaceProposalMetadata;
}

interface PlaceProposalSheetProps {
  roomId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 직접 고른 제안을 채팅방에 보낸다. 보냈으면 true, 연결이 안 돼 못 보냈으면 false */
  onPropose: (proposal: PlaceProposal) => boolean;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 11월 26일 목요일 */
function formatPickedDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

/** 시안의 '직접 고를래요' 아이콘. 안쪽·바깥쪽 두 겹의 원 */
function ConcentricCircles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

function MenuStep({
  loading,
  error,
  onAi,
  onManual,
}: {
  loading: boolean;
  error: string | null;
  onAi: () => void;
  onManual: () => void;
}) {
  if (loading) {
    return (
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center"
      >
        <Loader2 aria-hidden className="text-mint-deep size-10 animate-spin" />
        <p className="text-[17px] leading-6 font-bold">
          AI가 어울리는 카페를
          <br />
          고르고 있어요
        </p>
        <p className="text-ink-muted text-[14px]">10초쯤 걸릴 수 있어요.</p>
      </div>
    );
  }

  return (
    <>
      <SheetTitle className="text-center text-[20px] leading-7 font-bold">
        카페 방문 제안하기
      </SheetTitle>
      <SheetDescription className="text-ink-muted text-center text-[14px] leading-5">
        어떻게 제안할까요?
      </SheetDescription>
      <div className="mt-2 flex flex-col gap-3">
        <button
          type="button"
          onClick={onAi}
          className="bg-mint-100 flex cursor-pointer items-start gap-3 rounded-2xl p-4 text-left"
        >
          <Sparkles
            aria-hidden
            className="text-mint-deep mt-0.5 size-6 shrink-0"
          />
          <span>
            <span className="block text-[17px] leading-6 font-bold">
              AI가 추천해 줘요
            </span>
            <span className="text-ink-muted block text-[14px] leading-5">
              대화를 보고 두 사람 취향에 맞는 카페와 메뉴를 골라 보내요.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onManual}
          className="border-field flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left"
        >
          <ConcentricCircles
            aria-hidden
            className="text-mint-deep mt-0.5 size-6 shrink-0"
          />
          <span>
            <span className="block text-[17px] leading-6 font-bold">
              직접 고를래요
            </span>
            <span className="text-ink-muted block text-[14px] leading-5">
              매장과 날짜를 직접 정해서 보내요.
            </span>
          </span>
        </button>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-center text-[14px]">
          {error}
        </p>
      )}
    </>
  );
}

function PickStep({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (proposal: PlaceProposal) => boolean;
}) {
  const stores = useQuery({
    queryKey: storeKeys.search({}),
    queryFn: () => fetchStores(),
  });
  const [stage, setStage] = useState<'store' | 'when'>('store');
  const [storeId, setStoreId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);

  const store = stores.data?.find((item) => item.storeId === storeId);
  const past = date !== null && toDateKey(date) < toDateKey(new Date());
  const ready = store !== undefined && date !== null && !past;

  const submit = () => {
    if (!store || !date || past) return;
    const proposedDate = toDateKey(date);
    const sent = onSubmit({
      content: `📍 [카페 방문 제안] ${store.name}에서 ${formatPickedDate(date)}에 만나요!`,
      metadata: {
        storeId: store.storeId,
        storeName: store.name,
        proposedDate,
      },
    });
    setFailed(!sent);
  };

  if (stage === 'when' && store) {
    return (
      <>
        <SheetTitle className="text-center text-[20px] leading-7 font-bold">
          언제 만날까요?
        </SheetTitle>
        <SheetDescription className="sr-only">
          약속 날짜를 골라 제안을 보내요.
        </SheetDescription>

        <p className="bg-mint-100 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[14px] leading-5 font-bold">
          <MapPin aria-hidden className="text-mint-deep size-4 shrink-0" />
          <span className="truncate">{store.name}</span>
        </p>

        <ProposalCalendar value={date} onChange={setDate} />

        <p
          role={past ? 'alert' : 'status'}
          className={cn(
            'min-h-5 text-center text-[14px] leading-5',
            past ? 'text-destructive' : 'text-ink font-bold',
          )}
        >
          {past
            ? '지난 날짜는 고를 수 없어요.'
            : date
              ? formatPickedDate(date)
              : '날짜를 골라 주세요.'}
        </p>

        {failed && (
          <p role="alert" className="text-destructive text-center text-[14px]">
            연결 중이에요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        <div className="grid grid-cols-[1fr_1.75fr] gap-3">
          <Button
            type="button"
            size="xl"
            onClick={() => setStage('store')}
            className="bg-chip text-ink hover:bg-chip/80 h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
          >
            이전
          </Button>
          <Button
            type="button"
            variant="brand"
            size="xl"
            disabled={!ready}
            onClick={submit}
            className="h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
          >
            <CalendarDays aria-hidden className="size-5" />
            제안 보내기
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SheetTitle className="text-center text-[20px] leading-7 font-bold">
        어디서 만날까요?
      </SheetTitle>
      <SheetDescription className="sr-only">
        제휴 카페를 골라요.
      </SheetDescription>

      <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
        {stores.isPending && (
          <p
            role="status"
            className="text-ink-muted py-6 text-center text-[14px]"
          >
            카페를 불러오는 중이에요
          </p>
        )}
        {stores.isError && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-ink-muted text-[14px]">
              카페 목록을 불러오지 못했어요.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void stores.refetch()}
              className="h-10 cursor-pointer rounded-xl px-5 font-bold"
            >
              다시 시도
            </Button>
          </div>
        )}
        {stores.data?.length === 0 && (
          <p className="text-ink-muted py-6 text-center text-[14px]">
            제안할 수 있는 카페가 아직 없어요.
          </p>
        )}
        {stores.data?.map((item) => {
          const selected = item.storeId === storeId;
          return (
            <button
              key={item.storeId}
              type="button"
              aria-pressed={selected}
              onClick={() => setStoreId(item.storeId)}
              className={cn(
                'border-field cursor-pointer rounded-xl border px-4 py-3 text-left',
                selected && 'border-mint-deep bg-mint-100 border-[1.5px]',
              )}
            >
              <span className="block text-[16px] leading-6 font-bold">
                {item.name}
              </span>
              {item.address && (
                <span className="text-ink-muted block text-[13px] leading-5">
                  {item.address}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto grid grid-cols-[1fr_1.75fr] gap-3">
        <Button
          type="button"
          size="xl"
          onClick={onBack}
          className="bg-chip text-ink hover:bg-chip/80 h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
        >
          이전
        </Button>
        <Button
          type="button"
          variant="brand"
          size="xl"
          disabled={!store}
          onClick={() => setStage('when')}
          className="h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
        >
          다음
        </Button>
      </div>
    </>
  );
}

/**
 * 카페 방문 제안 시트. AI 추천은 서버가 매장을 골라 카드를 대신 보내고,
 * 직접 제안은 사용자가 고른 매장·날짜를 PLACE_PROPOSAL 메시지로 보낸다.
 * 열 때마다 처음 단계에서 시작하도록, 부르는 쪽에서 열 때마다 key를 바꿔 새로 만든다.
 */
export default function PlaceProposalSheet({
  roomId,
  open,
  onOpenChange,
  onPropose,
}: PlaceProposalSheetProps) {
  const [step, setStep] = useState<'menu' | 'pick'>('menu');

  // 카드는 서버가 소켓으로 보내 주므로, REST 응답이 오면 시트만 닫는다
  const ai = useMutation({
    mutationFn: () => requestAiRecommendation(roomId),
    onSuccess: () => onOpenChange(false),
  });

  const handleOpenChange = (next: boolean) => {
    // 추천을 받는 동안에는 닫지 않는다. 닫아도 요청은 계속되어 카드만 갑자기 도착한다
    if (!next && ai.isPending) return;
    onOpenChange(next);
  };

  const aiError = ai.isError
    ? (getApiError(ai.error)?.message ??
      'AI 추천을 받지 못했어요. 잠시 후 다시 시도해 주세요.')
    : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-none"
        className="text-ink mx-auto mt-14 max-h-[calc(100dvh-72px)] min-h-[300px] w-[calc(100%-32px)] max-w-[398px] gap-3 overflow-y-auto rounded-[28px] border-0 bg-white px-5 pt-6 pb-4 data-[side=top]:border-b-0"
      >
        {step === 'menu' ? (
          <>
            <MenuStep
              loading={ai.isPending}
              error={aiError}
              onAi={() => ai.mutate()}
              onManual={() => setStep('pick')}
            />
            {!ai.isPending && (
              <SheetClose asChild>
                <Button
                  type="button"
                  size="xl"
                  className="bg-chip text-ink hover:bg-chip/80 mt-auto h-[54px] cursor-pointer rounded-[14px] pb-0 text-[17px]"
                >
                  닫기
                </Button>
              </SheetClose>
            )}
          </>
        ) : (
          <PickStep
            onBack={() => setStep('menu')}
            onSubmit={(proposal) => {
              const sent = onPropose(proposal);
              if (sent) onOpenChange(false);
              return sent;
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
