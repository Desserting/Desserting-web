import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuthSwitchProps {
  /** 안내 문구 (예: "아직 계정이 없나요?") */
  message: string;
  linkLabel: string;
  to: string;
  /** "또는" 구분선을 위에 그릴지 여부 */
  divider?: boolean;
  className?: string;
}

/** 로그인 ↔ 회원가입 전환용 안내 링크 */
export default function AuthSwitch({
  message,
  linkLabel,
  to,
  divider = true,
  className,
}: AuthSwitchProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {divider && (
        <div className="mb-[21px] flex items-center gap-[17px]">
          <span className="bg-divider h-px flex-1" />
          <span className="text-faint text-[13px] leading-[19.5px]">또는</span>
          <span className="bg-divider h-px flex-1" />
        </div>
      )}
      <p className="text-ink-soft flex h-9 items-center justify-center gap-3 text-sm leading-6">
        {message}
        <Link to={to} className="text-mint-link font-bold">
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}
