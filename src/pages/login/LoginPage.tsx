import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '@/api/auth';
import eyeIcon from '@/assets/login/icon-eye.svg';
import AuthSwitch from '@/components/AuthSwitch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiError } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().trim().pipe(z.email('이메일 형식이 올바르지 않아요')),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

const fieldClassName =
  'border-field-line bg-field-bg placeholder:text-placeholder h-[54px] rounded-[14px] px-[17px] text-base md:text-base';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const setTokens = useAuthStore((state) => state.setTokens);
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, refreshToken }) => {
      setTokens(accessToken, refreshToken);
      navigate('/home', { replace: true });
    },
  });

  const onSubmit = (values: LoginForm) => loginMutation.mutate(values);

  // 서버가 내려준 한국어 message를 그대로 보여주고, 응답이 없으면(네트워크 오류 등) 기본 문구를 쓴다
  const submitError = loginMutation.isError
    ? (getApiError(loginMutation.error)?.message ??
      '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.')
    : null;

  return (
    <main className="text-ink bg-mint-50 relative flex flex-1 flex-col px-4 pt-6 pb-[22px]">
      <div className="flex flex-1 flex-col justify-center rounded-[28px] border border-white/78 px-[22px] pt-7 pb-[25px] shadow-[0_22px_55px_rgba(30,75,66,0.12),0_2px_8px_rgba(30,75,66,0.05)]">
        <header className="mb-[56px] flex flex-col">
          <p className="text-mint-eyebrow text-sm leading-[21px] font-bold tracking-[0.84px]">
            다시 만나 반가워요
          </p>
          <h1 className="pt-3.5 text-[38px] leading-[51.3px] font-bold tracking-[-1.52px]">
            로그인
          </h1>
          <p className="text-ink-sub pt-[9px] text-[15px] leading-[22.5px]">
            디저팅에서 달콤한 취향 탐색을 이어가세요.
          </p>
        </header>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col"
        >
          <Label
            htmlFor="email"
            className="items-start pb-[9px] text-[13px] leading-[19.5px] font-bold"
          >
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="dessert@example.com"
            aria-invalid={!!errors.email}
            className={fieldClassName}
            {...register('email')}
          />
          <Label
            htmlFor="password"
            className="items-start pt-5 pb-[9px] text-[13px] leading-[19.5px] font-bold"
          >
            비밀번호
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="비밀번호를 입력해주세요"
              aria-invalid={!!errors.password}
              className={`${fieldClassName} pr-[52px]`}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((shown) => !shown)}
              className="absolute top-[5px] right-2.5 flex size-11 cursor-pointer items-center justify-center rounded-[10px]"
            >
              {showPassword ? (
                <EyeOff className="size-[21px] text-[#7d8884]" aria-hidden />
              ) : (
                <img src={eyeIcon} alt="" className="block size-[21px]" />
              )}
            </button>
            {submitError && (
              <p
                role="alert"
                className="text-destructive absolute top-full left-1 mt-2 text-[13px] leading-[19.5px]"
              >
                {submitError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="brand"
            size="xl"
            disabled={!isValid || loginMutation.isPending}
            className="mt-10 h-[55px] rounded-[15px] pb-0 text-base"
          >
            로그인
          </Button>
        </form>
        <AuthSwitch
          message="아직 계정이 없나요?"
          linkLabel="회원가입"
          to="/signup"
          className="mt-[26px]"
        />
      </div>
    </main>
  );
}
