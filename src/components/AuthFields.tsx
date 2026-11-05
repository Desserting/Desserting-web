import { useState, type ComponentProps } from 'react';
import { EyeOff } from 'lucide-react';
import eyeIcon from '@/assets/login/icon-eye.svg';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function AuthLabel({
  className,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        'items-start pb-[9px] text-[13px] leading-[19.5px] font-bold',
        className,
      )}
      {...props}
    />
  );
}

export function AuthInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        'border-field-line bg-field-bg placeholder:text-placeholder h-[54px] rounded-[14px] px-[17px] text-base md:text-base',
        className,
      )}
      {...props}
    />
  );
}

/** 눈 아이콘으로 입력값을 보였다 숨기는 비밀번호 입력창. `error`는 입력창 아래에 겹쳐 표시된다 */
export function PasswordInput({
  error,
  ...props
}: Omit<ComponentProps<typeof Input>, 'type'> & { error?: string | null }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <AuthInput
        type={shown ? 'text' : 'password'}
        className="pr-[52px]"
        {...props}
      />
      <button
        type="button"
        aria-label={shown ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={shown}
        onClick={() => setShown((value) => !value)}
        className="absolute top-[5px] right-2.5 flex size-11 cursor-pointer items-center justify-center rounded-[10px]"
      >
        {shown ? (
          <EyeOff className="size-[21px] text-[#7d8884]" aria-hidden />
        ) : (
          <img src={eyeIcon} alt="" className="block size-[21px]" />
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="text-destructive absolute top-full left-1 mt-2 text-[13px] leading-[19.5px]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
