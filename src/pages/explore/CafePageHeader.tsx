import { Link } from 'react-router-dom';
import back from '@/assets/cafes/back.svg';
import type { CafeNavigationState } from './cafeNavigation';
import { cn } from '@/lib/utils';

export default function CafePageHeader({
  title,
  backTo,
  backState,
  titleClassName,
  onBack,
}: {
  title: string;
  backTo: string;
  backState?: CafeNavigationState;
  titleClassName?: string;
  /** 있으면 링크 이동 대신 이 동작을 실행한다. 링크는 새 탭·fallback용으로 남는다 */
  onBack?: () => void;
}) {
  return (
    <header className="relative flex h-11 shrink-0 items-center justify-center">
      <Link
        to={backTo}
        state={backState}
        onClick={(event) => {
          if (!onBack) return;
          event.preventDefault();
          onBack();
        }}
        aria-label="뒤로 가기"
        className="focus-visible:outline-mint-deep absolute -left-[10px] flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
      >
        <img src={back} alt="" />
      </Link>
      <h1
        className={cn('text-[23px] leading-[34px] font-bold', titleClassName)}
      >
        {title}
      </h1>
    </header>
  );
}
