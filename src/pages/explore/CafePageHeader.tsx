import { Link } from 'react-router-dom';
import back from '@/assets/cafes/back.svg';
import type { CafeNavigationState } from './cafeNavigation';

export default function CafePageHeader({
  title,
  backTo,
  backState,
}: {
  title: string;
  backTo: string;
  backState?: CafeNavigationState;
}) {
  return (
    <header className="relative flex h-11 shrink-0 items-center justify-center">
      <Link
        to={backTo}
        state={backState}
        aria-label="뒤로 가기"
        className="focus-visible:outline-mint-deep absolute -left-[10px] flex size-11 items-center justify-center rounded-full focus-visible:outline-2"
      >
        <img src={back} alt="" />
      </Link>
      <h1 className="text-[23px] leading-[34px] font-bold">{title}</h1>
    </header>
  );
}
