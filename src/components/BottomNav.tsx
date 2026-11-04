import { House, MessageSquare, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

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
              className="text-ink flex flex-col items-center gap-1 text-xs"
            >
              {({ isActive }) => {
                const active = isActive || to === activePath;
                return (
                  <>
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.8}
                      className={
                        active ? 'size-[26px] text-mint-deep' : 'size-[26px]'
                      }
                    />
                    <span
                      className={
                        active ? 'h-6 leading-6 font-bold' : 'h-6 leading-6'
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
