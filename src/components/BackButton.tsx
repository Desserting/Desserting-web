import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function BackButton({
  to,
  className,
}: {
  to: string;
  /** 기본은 화면 왼쪽 위에 겹쳐 놓는 배치라, 흐름 안에 넣을 땐 위치 클래스를 덮어쓴다 */
  className?: string;
}) {
  return (
    <Link
      to={to}
      aria-label="뒤로 가기"
      className={cn('absolute top-[34px] left-[26px] block size-6', className)}
    >
      <ArrowLeft className="size-6" aria-hidden />
    </Link>
  );
}
