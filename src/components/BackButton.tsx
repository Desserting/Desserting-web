import { ArrowLeft } from 'lucide-react';
import type { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function BackButton({
  to,
  className,
  state,
  label = '뒤로 가기',
  onClick,
}: {
  to: string;
  /** 기본은 화면 왼쪽 위에 겹쳐 놓는 배치라, 흐름 안에 넣을 땐 위치 클래스를 덮어쓴다 */
  className?: string;
  state?: unknown;
  label?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      to={to}
      state={state}
      aria-label={label}
      onClick={onClick}
      // 아이콘은 24px이지만 누를 수 있는 영역은 44px로 넓힌다
      className={cn(
        'focus-visible:outline-mint-deep absolute top-[34px] left-[26px] block size-6 after:absolute after:-inset-2.5 after:content-[""] focus-visible:outline-2',
        className,
      )}
    >
      <ArrowLeft className="size-6" aria-hidden />
    </Link>
  );
}
