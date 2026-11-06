import { House, MessageSquare, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBookingFlow } from '@/lib/bookingFlow';
import { naverMapsQueryOptions } from '@/lib/naverMaps';

const TABS = [
  { to: '/home', label: '홈', Icon: House },
  { to: '/explore', label: '탐색', Icon: Search },
  { to: '/chat', label: '채팅', Icon: MessageSquare },
  { to: '/my', label: '마이', Icon: User },
];

export default function BottomNav({
  activePath,
}: {
  /** 홈의 하위 화면처럼 URL이 탭 경로와 다를 때 활성화할 탭 경로 */
  activePath?: string;
}) {
  const queryClient = useQueryClient();
  const { bookingFrom } = useBookingFlow();

  useEffect(() => {
    // 홈에 머무는 동안 SDK만 준비한다. 실제 지도는 탐색에서 생성한다.
    void queryClient.prefetchQuery(naverMapsQueryOptions);
  }, [queryClient]);

  // 채팅에서 시작한 예약 흐름에서는 헤더 뒤로가기만 남겨 사용자의 경로를 고정한다
  if (bookingFrom) return null;

  return (
    <nav
      aria-label="메인 메뉴"
      className="border-hairline sticky bottom-0 h-[83px] border-t bg-white px-[17px] pt-[11px]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className="text-ink flex flex-col items-center gap-0.5 text-xs"
            >
              {({ isActive }) => {
                const active = isActive || to === activePath;
                return (
                  <>
                    <span
                      className={
                        active
                          ? 'bg-mint-100 flex h-8 w-[58px] items-center justify-center rounded-full'
                          : 'flex h-8 w-[58px] items-center justify-center'
                      }
                    >
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.8}
                        className={
                          active ? 'text-mint-deep size-[26px]' : 'size-[26px]'
                        }
                      />
                    </span>
                    <span
                      className={
                        active
                          ? 'text-mint-deep h-6 leading-6 font-bold'
                          : 'h-6 leading-6'
                      }
                    >
                      {label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
