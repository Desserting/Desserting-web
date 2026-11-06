import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchMe,
  updateMyProfile,
  userKeys,
  type MyProfile,
} from '@/api/users';
import PageHeader from '@/components/PageHeader';
import DessertAvatar from '@/components/DessertAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiError } from '@/lib/axios';

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, '닉네임은 2자 이상 입력해 주세요')
    .max(20, '닉네임은 20자 이하로 입력해 주세요'),
  bio: z.string().max(255, '자기소개는 255자 이하로 입력해 주세요'),
});
type ProfileForm = z.infer<typeof schema>;

function ProfileEditor({ profile }: { profile: MyProfile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: profile.nickname, bio: profile.bio ?? '' },
    mode: 'onChange',
  });
  const save = useMutation({
    mutationFn: updateMyProfile,
    retry: false,
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.me, updated);
      void queryClient.invalidateQueries({ queryKey: userKeys.profiles });
      void queryClient.invalidateQueries({
        queryKey: userKeys.profile(updated.userId),
      });
      navigate('/my');
    },
  });

  return (
    <>
      <div className="mt-[66px] size-[176px] self-center">
        <div role="img" aria-label="내 프로필 사진">
          <DessertAvatar
            key={profile.dessertAvatarUrl}
            src={profile.dessertAvatarUrl}
            className="size-[176px]"
          />
        </div>
      </div>
      <form
        onSubmit={handleSubmit((values) => save.mutate(values))}
        className="flex flex-1 flex-col"
      >
        <fieldset
          disabled={save.isPending}
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
        {save.isError && (
          <p role="alert" className="text-destructive mt-4 text-sm">
            {getApiError(save.error)?.message ??
              '프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'}
          </p>
        )}
        <Button
          type="submit"
          variant="brand"
          size="xl"
          disabled={!isValid || save.isPending}
          className="mt-auto mb-10"
        >
          {save.isPending ? '저장 중…' : '저장'}
        </Button>
      </form>
    </>
  );
}

export default function MyProfilePage() {
  const profile = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  return (
    <main className="text-ink flex flex-1 flex-col bg-white px-8">
      <PageHeader
        title="내 프로필 관리"
        backTo="/my"
        backLabel="마이페이지로 돌아가기"
        className="-mx-2"
      />
      {profile.isPending ? (
        <p role="status" className="my-auto py-12 text-center text-sm">
          프로필을 불러오는 중이에요.
        </p>
      ) : profile.isError ? (
        <div className="my-auto space-y-4 py-12 text-center">
          <p role="alert" className="text-destructive text-sm">
            {getApiError(profile.error)?.message ??
              '프로필을 불러오지 못했어요.'}
          </p>
          <Button
            type="button"
            variant="brand"
            onClick={() => void profile.refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <ProfileEditor key={profile.data.userId} profile={profile.data} />
      )}
    </main>
  );
}
