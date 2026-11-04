import { NavLink } from 'react-router-dom';
import chat from '@/assets/home/tab-chat.svg';
import home from '@/assets/home/tab-home.svg';
import my from '@/assets/home/tab-my.svg';
import search from '@/assets/home/tab-search.svg';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/home', label: '홈', icon: home },
  { to: '/explore', label: '탐색', icon: search },
  { to: '/chat', label: '채팅', icon: chat },
  { to: '/my', label: '마이', icon: my },
];

export default function BottomNav() {
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
              className={({ isActive }) =>
                cn(
                  'text-ink flex flex-col items-center gap-1 text-xs',
                  isActive && 'font-bold',
                )
              }
            >
              <img src={icon} alt="" className="size-[26px]" />
              <span className="h-6 leading-6">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
