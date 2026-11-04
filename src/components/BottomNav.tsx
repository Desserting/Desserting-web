import { NavLink } from 'react-router-dom';
import chat from '@/assets/home/tab-chat.svg';
import home from '@/assets/home/tab-home.svg';
import my from '@/assets/home/tab-my.svg';
import search from '@/assets/home/tab-search.svg';
import myActive from '@/assets/my/my-active.svg';
import myHome from '@/assets/my/home.svg';
import mySearch from '@/assets/my/search.svg';
import myChat from '@/assets/my/chat.svg';
import mapHome from '@/assets/explore/home.svg';
import mapSearch from '@/assets/explore/search-active.svg';
import mapChat from '@/assets/explore/chat.svg';
import mapMy from '@/assets/explore/my.svg';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/home', label: '홈', icon: home },
  { to: '/explore', label: '탐색', icon: search },
  { to: '/chat', label: '채팅', icon: chat },
  { to: '/my', label: '마이', icon: my },
];

export default function BottomNav({
  variant = 'default',
  activePath,
}: {
  variant?: 'default' | 'my' | 'explore';
  /** 홈의 하위 화면처럼 URL이 탭 경로와 다를 때 활성화할 탭 경로 */
  activePath?: string;
}) {
  const myIcons: Record<string, string> = {
    '/home': myHome,
    '/explore': mySearch,
    '/chat': myChat,
    '/my': myActive,
  };
  const mapIcons: Record<string, string> = {
    '/home': mapHome,
    '/explore': mapSearch,
    '/chat': mapChat,
    '/my': mapMy,
  };
  return (
    <nav
      aria-label="메인 메뉴"
      className="border-hairline sticky bottom-0 h-[83px] border-t bg-white px-[17px] pt-[11px]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => {
                const active = isActive || to === activePath;
                return cn(
                  'text-ink flex flex-col items-center gap-1 text-xs',
                  active && 'font-bold',
                  active && variant !== 'default' && 'text-mint-deep',
                );
              }}
            >
              <img
                src={
                  variant === 'my'
                    ? myIcons[to]
                    : variant === 'explore'
                      ? mapIcons[to]
                      : icon
                }
                alt=""
                className="size-[26px]"
              />
              <span className="h-6 leading-6">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
