import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthInput, AuthLabel, PasswordInput } from '@/components/AuthFields';
import { AuthHeader, AuthLayout } from '@/components/AuthLayout';
import AuthSwitch from '@/components/AuthSwitch';
import { Button } from '@/components/ui/button';
import { useSignupStore } from '@/stores/signupStore';

const signupSchema = z.object({
  email: z.string().trim().pipe(z.email('이메일 형식이 올바르지 않아요')),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이에요')
    .max(50, '비밀번호는 50자 이하예요'),
  gender: z.enum(['FEMALE', 'MALE']),
  age: z.string().refine((value) => {
    const age = Number(value);
    return Number.isInteger(age) && age >= 19 && age <= 99;
  }, '나이는 19~99 사이로 입력해 주세요'),
  region: z.string().trim().min(1, '지역을 입력해 주세요'),
  agree: z.boolean().refine((value) => value, '약관에 동의해 주세요'),
});

type SignupForm = z.infer<typeof signupSchema>;

const GENDERS = [
  { value: 'FEMALE', label: '여성' },
  { value: 'MALE', label: '남성' },
] as const;

export default function SignupPage() {
  const navigate = useNavigate();
  const account = useSignupStore((state) => state.account);
  const setAccount = useSignupStore((state) => state.setAccount);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: account?.email ?? '',
      password: account?.password ?? '',
      gender: account?.gender,
      age: account ? String(account.age) : '',
      region: account?.region ?? '',
      agree: !!account,
    },
    mode: 'onChange',
  });

  // 가입 정보는 취향 선택·프로필까지 모은 뒤 한 번에 보내므로 여기서는 저장만 한다
  const onSubmit = (values: SignupForm) => {
    setAccount({
      email: values.email,
      password: values.password,
      gender: values.gender,
      age: Number(values.age),
      region: values.region,
    });
    navigate('/signup/interests');
  };

  return (
    <AuthLayout>
      <div className="mb-[56px]">
        <AuthHeader
          eyebrow="디저팅과 함께해요"
          title="회원가입"
          subtitle="이메일로 가입하고 달콤한 취향 탐색을 시작하세요."
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
        <p className="text-ink-hint pt-[7px] text-xs leading-[18px]">
          로그인 아이디로 사용돼요.
        </p>
        <AuthLabel htmlFor="password" className="pt-5">
          비밀번호
        </AuthLabel>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="비밀번호를 입력해주세요"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <div className="flex items-start gap-3 pt-5">
          <fieldset className="min-w-0 flex-1">
            <legend className="pb-[9px] text-[13px] leading-[19.5px] font-bold">
              성별
            </legend>
            <div className="border-field-line bg-field-bg flex h-[54px] items-center rounded-[14px] border p-1">
              {GENDERS.map(({ value, label }) => (
                <label
                  key={value}
                  className="text-ink-soft has-checked:bg-mint has-checked:text-ink has-focus-visible:ring-ring/50 flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[11px] text-sm leading-[21px] font-bold transition-colors has-focus-visible:ring-3"
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register('gender')}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="w-32 shrink-0">
            <AuthLabel htmlFor="age">나이</AuthLabel>
            <AuthInput
              id="age"
              inputMode="numeric"
              maxLength={2}
              placeholder="19~99"
              aria-invalid={!!errors.age}
              {...register('age')}
            />
          </div>
        </div>
        <AuthLabel htmlFor="region" className="pt-5">
          지역
        </AuthLabel>
        <AuthInput
          id="region"
          autoComplete="off"
          placeholder="예: 대구 남구"
          aria-invalid={!!errors.region}
          {...register('region')}
        />
        <label className="flex cursor-pointer items-center gap-[9px] pt-5 text-sm leading-[21px]">
          <input
            type="checkbox"
            className="accent-mint-link size-[18px] cursor-pointer"
            {...register('agree')}
          />
          <span className="text-ink-body">
            <b className="text-mint-link">(필수)</b> 서비스 이용약관에
            동의합니다
          </span>
        </label>
        <Button
          type="submit"
          variant="brand"
          size="xl"
          disabled={!isValid}
          className="mt-6 h-[55px] rounded-[15px] pb-0 text-base"
        >
          다음
        </Button>
      </form>
      <AuthSwitch
        message="이미 계정이 있나요?"
        linkLabel="로그인"
        to="/login"
        divider={false}
        className="mt-[21px]"
      />
    </AuthLayout>
  );
}
