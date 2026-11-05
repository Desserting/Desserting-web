import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '@/api/auth';
import { AuthInput, AuthLabel, PasswordInput } from '@/components/AuthFields';
import { AuthHeader, AuthLayout } from '@/components/AuthLayout';
import AuthSwitch from '@/components/AuthSwitch';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().trim().pipe(z.email('이메일 형식이 올바르지 않아요')),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

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
    <AuthLayout>
      <div className="mb-[56px]">
        <AuthHeader
          eyebrow="다시 만나 반가워요"
          title="로그인"
          subtitle="디저팅에서 달콤한 취향 탐색을 이어가세요."
        />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col"
      >
        <AuthLabel htmlFor="email">이메일</AuthLabel>
        <AuthInput
          id="email"
          type="email"
          autoComplete="email"
          placeholder="dessert@example.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <AuthLabel htmlFor="password" className="pt-5">
          비밀번호
        </AuthLabel>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해주세요"
          aria-invalid={!!errors.password}
          error={submitError}
          {...register('password')}
        />
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
    </AuthLayout>
  );
}
