import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** 로그인·회원가입·취향 선택이 함께 쓰는 연한 민트 배경 화면 틀 */
export function AuthLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className="text-ink bg-mint-50 relative flex flex-1 flex-col px-4 pt-6 pb-[22px]">
      <div
        className={cn(
          'flex flex-1 flex-col justify-center border border-transparent px-[22px] pt-7 pb-[25px]',
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}

export function AuthHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex flex-col">
      <p className="text-mint-eyebrow text-sm leading-[21px] font-bold tracking-[0.84px]">
        {eyebrow}
      </p>
      <h1 className="pt-3.5 text-[38px] leading-[51.3px] font-bold tracking-[-1.52px]">
        {title}
      </h1>
      <p className="text-ink-sub pt-[9px] text-[15px] leading-[22.5px]">
        {subtitle}
      </p>
    </header>
  );
}
