import type { MouseEvent, ReactNode } from 'react';
import BackButton from '@/components/BackButton';
import { cn } from '@/lib/utils';

/**
 * 앱 공통 화면 헤더. 채팅방 헤더를 기준으로 맞춘다.
 * 화면 위쪽 여백(34px)과 제목(19px, 가운데)은 여기서만 정하므로 화면 쪽 main에는 위 여백을 두지 않는다.
 * 좌우 여백(px-6)을 가진 부모 안에 두는 것을 전제로 한다.
 */
export default function PageHeader({
  title,
  hideTitle,
  backTo,
  backState,
  backLabel,
  onBack,
  left,
  right,
  className,
}: {
  title: ReactNode;
  /** 화면에 제목이 보이지 않아도 되는 화면(스크린 리더에는 읽힌다) */
  hideTitle?: boolean;
  /** 있으면 왼쪽에 뒤로가기 화살표를 둔다 */
  backTo?: string;
  backState?: unknown;
  backLabel?: string;
  /** 있으면 링크 이동 대신 이 동작을 실행한다. 링크는 새 탭·fallback용으로 남는다 */
  onBack?: () => void;
  /** 뒤로가기 말고 다른 왼쪽 버튼이 필요할 때 (backTo와 같이 쓰지 않는다) */
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  const handleBack = onBack
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onBack();
      }
    : undefined;

  return (
    <header
      className={cn('relative min-h-[58px] shrink-0 pt-[34px]', className)}
    >
      <h1
        className={cn(
          'flex min-w-0 items-center justify-center gap-2 px-9 text-[19px] leading-6 font-bold',
          hideTitle && 'sr-only',
        )}
      >
        {typeof title === 'string' ? (
          <span className="truncate">{title}</span>
        ) : (
          title
        )}
      </h1>
      {backTo !== undefined && (
        <BackButton
          to={backTo}
          state={backState}
          label={backLabel}
          onClick={handleBack}
          className="left-0.5"
        />
      )}
      {left && <div className="absolute top-[34px] left-0.5">{left}</div>}
      {right && <div className="absolute top-[34px] right-0.5">{right}</div>}
    </header>
  );
}
