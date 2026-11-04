import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useSignupStore } from '@/stores/signupStore';

const MENUS = [
  { label: '내 프로필 관리', icon: profileIcon, to: '/my/profile' },
  {
    label: '하트 구매',
    icon: heart,
    detail: '5개 보유',
    accent: true,
    to: '/my/hearts',
  },
  {
    label: '프리미엄 패스',
    icon: premium,
    detail: '미보유',
    to: '/my/premium',
  },
  { label: '좋아요한 사람', icon: heart },
  { label: '예약 · 주문 내역', icon: calendar },
  { label: '설정', icon: settings },
];

// Balance and membership use the design's preview values until account API integration.
function ProfileAvatar({ file }: { file: File | null | undefined }) {
  const [url] = useState(() => (file ? URL.createObjectURL(file) : avatar));
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(url);
    },
    [file, url],
  );
  return (
    <img
      src={url}
      alt="내 프로필 사진"
      className="my-page-avatar rounded-full object-cover"
    />
  );
}

export default function MyPage() {
  const profile = useSignupStore((state) => state.profile);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

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
          <ProfileAvatar file={profile?.avatar} />
          <h2 className="mt-3 max-w-full truncate text-center text-[22px] leading-8 font-bold">
            {profile?.nickname || '디저트러버'}님 ♡
          </h2>
        </section>
        <ul
          aria-label="마이페이지 메뉴"
          className="my-page-menu grid min-h-0 grid-rows-6"
        >
          {MENUS.map((menu) => {
            const content = (
              <>
                <img src={menu.icon} alt="" className="shrink-0" />
                <span className="flex-1 text-[17px] font-bold">
                  {menu.label}
                </span>
                {menu.detail ? (
                  <span
                    className={
                      menu.accent
                        ? 'text-mint-deep text-[15px] font-bold'
                        : 'text-my-muted text-sm'
                    }
                  >
                    {menu.detail}
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
