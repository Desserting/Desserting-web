import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';

export default function CafeRequestState({
  pending,
  error,
  onRetry,
}: {
  pending: boolean;
  error?: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm">
      <p role={pending ? 'status' : 'alert'}>
        {pending
          ? '정보를 불러오는 중이에요.'
          : (getApiError(error)?.message ?? '정보를 불러오지 못했어요.')}
      </p>
      {!pending && (
        <Button type="button" variant="brand" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
