import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMe, userKeys } from '@/api/users';
import avatar from '@/assets/my/avatar.png';
import calendar from '@/assets/my/calendar.svg';
import chevron from '@/assets/my/chevron.svg';
import heart from '@/assets/my/heart.svg';
import premium from '@/assets/my/premium.svg';
import profileIcon from '@/assets/my/profile.svg';
import settings from '@/assets/my/settings.svg';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const MENUS = [
  { label: '내 프로필 관리', icon: profileIcon, to: '/my/profile' },
  {
    label: '하트 구매',
    icon: heart,
    accent: true,
    to: '/my/hearts',
  },
  {
    label: '프리미엄 패스',
    icon: premium,
    to: '/my/premium',
  },
  { label: '좋아요한 사람', icon: heart },
  { label: '예약 · 주문 내역', icon: calendar },
  { label: '설정', icon: settings },
];

function ProfileAvatar({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={!src || failed ? avatar : src}
      alt="내 프로필 사진"
      onError={() => setFailed(true)}
      className="my-page-avatar rounded-full object-cover"
    />
  );
}

export default function MyPage() {
  const {
    data: profile,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: userKeys.me,
    queryFn: fetchMe,
    refetchOnMount: 'always',
  });
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const details: Record<string, string> = {
    '/my/hearts': profile && !isError ? `${profile.heartCount}개 보유` : '—',
    '/my/premium':
      profile && !isError ? (profile.isPremium ? '이용 중' : '미보유') : '—',
  };

  return (
    <div className="my-page flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <main className="my-page-content text-ink grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] px-6">
        <h1 className="text-center text-[23px] leading-[30px] font-bold">
          마이페이지
        </h1>
        <section
          aria-label="내 프로필"
          className="my-page-profile flex min-h-0 flex-col items-center"
        >
          <ProfileAvatar
            key={isError ? 'error' : profile?.dessertAvatarUrl}
            src={isError ? null : profile?.dessertAvatarUrl}
          />
          <div className="mt-3 min-h-8 max-w-full text-center">
            {isPending ? (
              <div role="status" className="flex h-8 items-center">
                <span className="sr-only">내 정보를 불러오는 중이에요</span>
                <span
                  aria-hidden="true"
                  className="bg-chip h-6 w-36 animate-pulse rounded"
                />
              </div>
            ) : isError ? (
              <div role="alert" className="text-my-muted text-sm leading-5">
                <p>내 정보를 불러오지 못했어요.</p>
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => void refetch()}
                  className="text-mint-deep cursor-pointer rounded px-2 py-1 font-bold underline underline-offset-2 disabled:opacity-50"
                >
                  {isFetching ? '불러오는 중…' : '다시 시도'}
                </button>
              </div>
            ) : (
              <h2 className="truncate text-[22px] leading-8 font-bold">
                {profile.nickname}님 ♡
              </h2>
            )}
          </div>
        </section>
        <ul
          aria-label="마이페이지 메뉴"
          className="my-page-menu grid min-h-0 grid-rows-6"
        >
          {MENUS.map((menu) => {
            const detail = menu.to ? details[menu.to] : undefined;
            const content = (
              <>
                <img src={menu.icon} alt="" className="shrink-0" />
                <span className="flex-1 text-[17px] font-bold">
                  {menu.label}
                </span>
                {detail ? (
                  <span
                    className={
                      menu.accent
                        ? 'text-mint-deep text-[15px] font-bold'
                        : 'text-my-muted text-sm'
                    }
                  >
                    {detail}
                  </span>
                ) : (
                  <img src={chevron} alt="" className="shrink-0" />
                )}
              </>
            );
            const className =
              'border-my-divider flex h-full min-h-0 w-full cursor-pointer items-center gap-[17px] border-b px-[6px] text-left transition-colors hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-mint-deep focus-visible:-outline-offset-2';
            return (
              <li
                key={menu.label}
                className="min-h-0 last:[&>button]:border-b-0"
              >
                {menu.to ? (
                  <Link to={menu.to} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={className}
                    onClick={() => setSelectedMenu(menu.label)}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </main>
      <BottomNav />
      <Dialog
        open={selectedMenu !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMenu(null);
        }}
      >
        <DialogContent className="max-w-[345px]">
          <DialogTitle>{selectedMenu}</DialogTitle>
          <DialogDescription>
            아직 준비 중인 기능이에요. 조금만 기다려 주세요.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
