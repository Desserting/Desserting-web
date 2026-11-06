import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchMe,
  fetchAvatarOptions,
  updateMyProfile,
  userKeys,
  type MyProfile,
} from '@/api/users';
import BackButton from '@/components/BackButton';
import DessertAvatar from '@/components/DessertAvatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiError } from '@/lib/axios';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';

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
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.dessertAvatarUrl);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: profile.nickname, bio: profile.bio ?? '' },
    mode: 'onChange',
  });
  const avatars = useQuery({
    queryKey: userKeys.avatars,
    queryFn: fetchAvatarOptions,
    enabled: avatarOpen,
    staleTime: Infinity,
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
      <div className="relative mt-[66px] size-[176px] self-center">
        <div role="img" aria-label="내 프로필 사진">
          <DessertAvatar
            key={avatarUrl}
            src={avatarUrl}
            className="size-[176px]"
          />
        </div>
        <button
          type="button"
          aria-label="디저트 아바타 변경"
          disabled={save.isPending}
          onClick={() => setAvatarOpen(true)}
          className="absolute top-[128px] left-[140px] flex size-11 cursor-pointer items-center justify-center rounded-full bg-white"
        >
          <Camera className="size-7" aria-hidden />
        </button>
      </div>
      <form
        onSubmit={handleSubmit((values) =>
          save.mutate({
            ...values,
            ...(avatarUrl && avatarUrl !== profile.dessertAvatarUrl
              ? { dessertAvatarUrl: avatarUrl }
              : {}),
          }),
        )}
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
      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle>디저트 아바타 선택</DialogTitle>
          <DialogDescription>
            나를 표현할 디저트를 골라 주세요.
          </DialogDescription>
          {avatars.isPending ? (
            <p role="status">아바타를 불러오는 중이에요.</p>
          ) : avatars.isError ? (
            <div className="space-y-3">
              <p role="alert">아바타 목록을 불러오지 못했어요.</p>
              <Button
                type="button"
                variant="brand"
                onClick={() => void avatars.refetch()}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {avatars.data.map((option) => (
                <button
                  key={option.dessertType}
                  type="button"
                  aria-pressed={avatarUrl === option.avatarUrl}
                  onClick={() => {
                    setAvatarUrl(option.avatarUrl);
                    setAvatarOpen(false);
                  }}
                  className={cn(
                    'border-line focus-visible:outline-mint-deep flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-2 text-xs focus-visible:outline-2',
                    avatarUrl === option.avatarUrl &&
                      'border-mint-deep bg-mint-100',
                  )}
                >
                  <DessertAvatar src={option.avatarUrl} className="size-12" />
                  <span>{dessertLabel(option.dessertType)}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MyProfilePage() {
  const profile = useQuery({ queryKey: userKeys.me, queryFn: fetchMe });
  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-8 pt-[55px]">
      <BackButton to="/my" />
      <h1 className="text-center text-[25px] leading-[30px] font-bold">
        내 프로필 관리
      </h1>
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
