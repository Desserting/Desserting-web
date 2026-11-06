import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ChevronRight,
  Heart,
  IdCard,
  Mail,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/signup/splash-logo.svg';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';
import { fetchHeartHistory, heartKeys } from '@/api/hearts';
import { countPending, fetchReceivedRequests, matchKeys } from '@/api/matches';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const MATCHING_MENUS = [
  {
    to: '/matching?type=same',
    label: ['같은 취향', '랜덤 매칭'],
    description: '입맛이 꼭 닮은 사람',
    cardClassName: 'bg-blush',
    iconWrapClassName: 'bg-[#ffd3e3]',
    iconClassName: 'fill-[#f0679a] text-[#f0679a]',
  },
  {
    to: '/matching?type=different',
    label: ['다른 취향', '랜덤 매칭'],
    description: '새로운 맛을 알려줄 사람',
    cardClassName: 'bg-sky',
    iconWrapClassName: 'bg-[#d4e8ff]',
    iconClassName: 'fill-[#4b9cec] text-[#4b9cec]',
  },
];

const SHORTCUTS: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/profile', label: '프로필 보기', Icon: IdCard },
  { to: '/stores', label: '제휴매장 보기', Icon: Store },
];

const HEADER_BUTTON_CLASS =
  'bg-chip text-ink relative flex size-10 cursor-pointer items-center justify-center rounded-full';

function CountBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="bg-mint-deep absolute -top-0.5 -right-0.5 box-content flex size-[17px] items-center justify-center rounded-full border-2 border-white text-[10px] leading-none font-bold text-white"
    >
      {count}
    </span>
  );
}

export default function HomePage() {
  // 로그인 전에도 홈 화면은 볼 수 있어야 하므로, 토큰이 있을 때만 배지 정보를 불러온다
  const loggedIn = useAuthStore((state) => state.accessToken !== null);
  const lastSeenHeartId = useNotificationStore(
    (state) => state.lastSeenHeartHistoryId,
  );
  const { data: pendingCount = 0 } = useQuery({
    queryKey: matchKeys.received,
    queryFn: fetchReceivedRequests,
    enabled: loggedIn,
    select: countPending,
  });
  const { data: unreadCount = 0 } = useQuery({
    queryKey: heartKeys.history,
    queryFn: fetchHeartHistory,
    enabled: loggedIn,
    select: (history) =>
      history.filter((item) => item.id > lastSeenHeartId).length,
  });

  return (
    <>
      <main className="text-ink flex flex-1 flex-col bg-white px-6 pt-6 pb-8">
        <header className="flex h-11 items-center gap-2.5">
          <h1 className="flex-1 text-[30px] leading-none font-bold tracking-[-0.04em]">
            Desserting
          </h1>
          <Link
            to="/notifications"
            aria-label={
              unreadCount > 0
                ? `알림, 새 하트 사용 기록 ${unreadCount}개`
                : '알림'
            }
            className={HEADER_BUTTON_CLASS}
          >
            <Bell
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[22px]"
            />
            {unreadCount > 0 && <CountBadge count={unreadCount} />}
          </Link>
          <Link
            to="/chat/requests"
            state={{ from: '/home' }}
            aria-label={
              pendingCount > 0
                ? `메시지함, 받은 대화 요청 ${pendingCount}개`
                : '메시지함'
            }
            className={HEADER_BUTTON_CLASS}
          >
            <Mail
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[22px]"
            />
            {pendingCount > 0 && <CountBadge count={pendingCount} />}
          </Link>
        </header>

        <section className="relative mt-5 h-40 overflow-hidden rounded-[22px] bg-linear-to-br from-[#8ce2d0] to-[#b5eee1]">
          <span
            aria-hidden
            className="absolute -top-8 right-[-60px] size-[190px] rounded-full bg-white/25"
          />
          <span
            aria-hidden
            className="absolute -bottom-12 -left-10 size-[130px] rounded-full bg-white/20"
          />
          <p className="absolute top-1/2 left-6 -translate-y-1/2 text-[23px] leading-7 font-bold">
            디저트로 연결되는
            <br />
            특별한 만남
          </p>
          <img
            src={logo}
            alt=""
            className="absolute top-1/2 right-6 block size-[110px] -translate-y-1/2"
          />
        </section>

        <h2 className="mt-6 mb-3.5 text-xl leading-6 font-bold">디저팅 매칭</h2>
        <ul className="grid grid-cols-2 gap-3.5">
          {MATCHING_MENUS.map(
            ({
              to,
              label,
              description,
              cardClassName,
              iconWrapClassName,
              iconClassName,
            }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    'flex h-[187px] flex-col items-center justify-center rounded-[22px]',
                    cardClassName,
                  )}
                >
                  <span
                    className={cn(
                      'flex size-[60px] items-center justify-center rounded-full',
                      iconWrapClassName,
                    )}
                  >
                    <Heart
                      aria-hidden="true"
                      strokeWidth={1.8}
                      className={cn('size-7', iconClassName)}
                    />
                  </span>
                  <span className="mt-4 text-center text-[17px] leading-[1.45] font-bold whitespace-nowrap">
                    {label.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="text-ink-muted mt-3 text-xs leading-none whitespace-nowrap">
                    {description}
                  </span>
                </Link>
              </li>
            ),
          )}
        </ul>

        <h2 className="mt-6 mb-3.5 text-xl leading-6 font-bold">바로가기</h2>
        <ul className="grid grid-cols-2 gap-3.5">
          {SHORTCUTS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="border-line flex h-[122px] flex-col justify-between rounded-[18px] border bg-white p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <span className="bg-mint-100 text-mint-deep flex size-[46px] items-center justify-center rounded-full">
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="size-6"
                  />
                </span>
                <span className="flex items-center justify-between gap-1">
                  <span className="text-base leading-none font-bold whitespace-nowrap">
                    {label}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="text-ink-sub size-5 shrink-0"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <BottomNav />
    </>
  );
}
