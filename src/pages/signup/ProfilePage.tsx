import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import avatarCake from '@/assets/signup/avatar-cake.svg';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSignupStore } from '@/stores/signupStore';

const profileSchema = z.object({
  nickname: z.string().trim().min(1, '닉네임을 입력해 주세요'),
  bio: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const setProfile = useSignupStore((state) => state.setProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<{ file: File; url: string } | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nickname: '', bio: '' },
    mode: 'onChange',
  });

  useEffect(
    () => () => {
      if (avatar) URL.revokeObjectURL(avatar.url);
    },
    [avatar],
  );

  const onSubmit = (values: ProfileForm) => {
    setProfile({ ...values, avatar: avatar?.file ?? null });
  };

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-8 pt-[55px]">
      <BackButton to="/signup/interests" />
      <h1 className="text-center text-[25px] leading-[30px] font-bold">
        프로필을 완성해요
      </h1>
      <div className="relative mt-[66px] size-[176px] self-center">
        <div className="bg-cream size-full overflow-hidden rounded-full">
          {avatar ? (
            <img
              src={avatar.url}
              alt="프로필 사진"
              className="size-full object-cover"
            />
          ) : (
            <img src={avatarCake} alt="" className="mt-8 ml-[9px] block" />
          )}
        </div>
        <button
          type="button"
          aria-label="프로필 사진 변경"
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-[128px] left-[140px] flex size-11 cursor-pointer items-center justify-center rounded-full bg-white"
        >
          <Camera className="size-7" aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setAvatar({ file, url: URL.createObjectURL(file) });
          }}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
        <div className="mt-[41px] flex flex-col gap-[14px]">
          <Label
            htmlFor="nickname"
            className="h-[26px] items-start text-base leading-5 font-bold"
          >
            닉네임
          </Label>
          <Input
            id="nickname"
            placeholder="디저트러버"
            aria-invalid={!!errors.nickname}
            className="border-field h-14 rounded-xl bg-white px-[15px] pb-2.5 text-[17px] leading-5 md:text-[17px]"
            {...register('nickname')}
          />
          <Label
            htmlFor="bio"
            className="h-[26px] items-start text-base leading-5 font-bold"
          >
            자기소개 (선택)
          </Label>
          <Textarea
            id="bio"
            placeholder={'디저트 좋아하는 사람과\n소소한 데이트 하고 싶어요! ♡'}
            className="border-field h-[104px] resize-none rounded-xl bg-white px-[15px] py-[13px] text-[17px] leading-5 md:text-[17px]"
            {...register('bio')}
          />
        </div>
        <Button
          type="submit"
          variant="brand"
          size="xl"
          disabled={!isValid}
          className="mt-auto mb-10"
        >
          완료
        </Button>
      </form>
    </main>
  );
}
