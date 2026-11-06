import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { signup } from '@/api/auth';
import { updateMyProfile } from '@/api/users';
import logo from '@/assets/signup/splash-logo.svg';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiError } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { useSignupStore } from '@/stores/signupStore';

const profileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, '닉네임은 2자 이상 입력해 주세요')
    .max(20, '닉네임은 20자 이하로 입력해 주세요'),
  bio: z.string().max(255, '자기소개는 255자 이하로 입력해 주세요'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const account = useSignupStore((state) => state.account);
  const interests = useSignupStore((state) => state.interests);
  const profile = useSignupStore((state) => state.profile);
  const setProfile = useSignupStore((state) => state.setProfile);
  const resetSignup = useSignupStore((state) => state.reset);
  const setTokens = useAuthStore((state) => state.setTokens);
  const completed = useRef(false);
  // 입력값은 화면을 떠난 뒤에 비운다. 이동 전에 비우면 아래 가드가 홈 이동을 가로챈다
  useEffect(
    () => () => {
      if (completed.current) resetSignup();
    },
    [resetSignup],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: profile?.nickname ?? '',
      bio: profile?.bio ?? '',
    },
    mode: 'onChange',
  });

  const signupMutation = useMutation({
    mutationFn: async (values: ProfileForm) => {
      if (!account) throw new Error('가입 정보가 없어요.');
      const tokens = await signup({
        ...account,
        nickname: values.nickname.trim(),
        dessertTypes: interests,
        agreeToTerms: true,
      });
      // 이후 요청이 새 계정으로 나가도록 토큰을 먼저 저장한다
      setTokens(tokens.accessToken, tokens.refreshToken);
      // 가입 API에는 자기소개가 없으므로 따로 저장한다. 실패해도 계정은 이미 만들어졌고 나중에 고칠 수 있다
      if (values.bio.trim()) {
        await updateMyProfile({
          nickname: values.nickname.trim(),
          bio: values.bio.trim(),
        }).catch(() => undefined);
      }
    },
    retry: false,
    onSuccess: () => {
      completed.current = true;
      // 이전 계정의 캐시가 새 계정에 보이지 않게 한다
      queryClient.clear();
      navigate('/home', { replace: true });
    },
  });

  // 새로고침 등으로 앞 단계 입력이 사라졌으면 처음부터 다시 받는다
  if (!account) return <Navigate to="/signup" replace />;
  if (interests.length === 0)
    return <Navigate to="/signup/interests" replace />;

  const onSubmit = (values: ProfileForm) => {
    setProfile(values);
    signupMutation.mutate(values);
  };

  // 입력값 오류(C001)는 message가 뭉뚱그려져 있어 첫 항목의 구체적인 사유를 먼저 보여준다
  const apiError = getApiError(signupMutation.error);
  const submitError = signupMutation.isError
    ? (apiError?.errors?.[0]?.reason ??
      apiError?.message ??
      '가입에 실패했어요. 잠시 후 다시 시도해 주세요.')
    : null;

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-6">
      <PageHeader title="프로필을 완성해요" backTo="/signup/interests" />
      <div className="mt-[66px] size-[176px] self-center">
        <div className="bg-cream size-full overflow-hidden rounded-full">
          <img src={logo} alt="" className="size-full object-contain p-9" />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
        <fieldset
          disabled={signupMutation.isPending}
          className="mt-[41px] flex flex-col gap-[14px]"
        >
          <Label
            htmlFor="nickname"
            className="h-[26px] items-start text-base leading-5 font-bold"
          >
            닉네임
          </Label>
          <Input
            id="nickname"
            placeholder="디저트러버"
            autoComplete="nickname"
            aria-invalid={!!errors.nickname}
            aria-describedby={errors.nickname ? 'nickname-error' : undefined}
            className="border-field h-14 rounded-xl bg-white px-[15px] pb-2.5 text-[17px] leading-5 md:text-[17px]"
            {...register('nickname')}
          />
          {errors.nickname && (
            <p
              id="nickname-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.nickname.message}
            </p>
          )}
          <Label
            htmlFor="bio"
            className="h-[26px] items-start text-base leading-5 font-bold"
          >
            자기소개 (선택)
          </Label>
          <Textarea
            id="bio"
            placeholder={'디저트 좋아하는 사람과\n소소한 데이트 하고 싶어요! ♡'}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? 'bio-error' : undefined}
            className="border-field h-[104px] resize-none rounded-xl bg-white px-[15px] py-[13px] text-[17px] leading-5 md:text-[17px]"
            {...register('bio')}
          />
          {errors.bio && (
            <p id="bio-error" role="alert" className="text-destructive text-sm">
              {errors.bio.message}
            </p>
          )}
        </fieldset>
        {submitError && (
          <p role="alert" className="text-destructive mt-4 text-sm">
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          variant="brand"
          size="xl"
          disabled={!isValid || signupMutation.isPending}
          className="mt-auto mb-10"
        >
          {signupMutation.isPending ? '가입 중…' : '완료'}
        </Button>
      </form>
    </main>
  );
}
