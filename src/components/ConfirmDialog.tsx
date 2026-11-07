import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  /** 확인 동작이 진행 중이면 버튼을 잠그고 로딩 표시를 보여준다 */
  pending?: boolean;
}

/** 취소 / 확인 두 버튼을 가진 공용 확인 팝업 (랜덤 매칭 종료, 로그아웃 등) */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = '아니요',
  confirmLabel = '예',
  onConfirm,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="text-ink max-w-[calc(100%-48px)] gap-0 rounded-3xl bg-white p-6 text-center sm:max-w-[340px]"
      >
        <DialogTitle className="text-[19px] leading-7 font-bold">
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription className="text-ink-muted mt-2 text-[15px] leading-6 break-keep">
            {description}
          </DialogDescription>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            size="xl"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="bg-chip text-ink hover:bg-chip/80 h-12 rounded-xl pb-0 text-base"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="brand"
            size="xl"
            disabled={pending}
            onClick={onConfirm}
            className="h-12 rounded-xl pb-0 text-base"
          >
            {pending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
