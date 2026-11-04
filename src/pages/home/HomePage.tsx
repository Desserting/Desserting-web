import { Link } from 'react-router-dom';
import bannerCake from '@/assets/home/banner-cake.svg';
import iconBell from '@/assets/home/icon-bell.svg';
import iconMail from '@/assets/home/icon-mail.svg';
import menuOtherTaste from '@/assets/home/menu-other-taste.svg';
import menuProfile from '@/assets/home/menu-profile.svg';
import menuSameTaste from '@/assets/home/menu-same-taste.svg';
import menuStore from '@/assets/home/menu-store.svg';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

const MENUS = [
  {
    to: '/matching?type=same',
    label: ['같은 취향', '랜덤 매칭'],
    icon: menuSameTaste,
    className: 'bg-blush',
  },
  {
    to: '/matching?type=different',
    label: ['다른 취향', '랜덤 매칭'],
    icon: menuOtherTaste,
    className: 'bg-sky',
  },
  {
    to: '/profile',
    label: ['프로필 보기'],
    icon: menuProfile,
    className: 'border-ink border-[1.3px] bg-white',
  },
  {
    to: '/stores',
    label: ['제휴매장 보기'],
    icon: menuStore,
    className: 'border-ink border-[1.3px] bg-white',
  },
];

export default function HomePage() {
  return (
    <>
      <main className="text-ink flex flex-1 flex-col gap-5 bg-white px-[22px] pt-6 pb-10">
        <header className="flex h-11 items-center gap-[18px]">
          <h1 className="flex-1 text-[27px] leading-6 font-bold">Desserting</h1>
          <button type="button" aria-label="알림" className="cursor-pointer">
            <img src={iconBell} alt="" className="size-[26px]" />
          </button>
          <button type="button" aria-label="메시지" className="cursor-pointer">
            <img src={iconMail} alt="" className="size-[26px]" />
          </button>
        </header>
        <section className="bg-mint relative h-[162px] overflow-hidden rounded-[22px]">
          <p className="absolute top-[42px] left-[22px] text-[23px] leading-7 font-bold">
            디저트로 연결되는
            <br />
            특별한 만남
          </p>
          <img
            src={bannerCake}
            alt=""
            className="absolute top-[37px] right-0 block"
          />
        </section>
        <ul className="grid grid-cols-2 gap-x-[14px] gap-y-5">
          {MENUS.map(({ to, label, icon, className }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  'flex h-[181px] flex-col items-center justify-center gap-4 rounded-[23px]',
                  className,
                )}
              >
                <img src={icon} alt="" className="size-[60px]" />
                <span className="h-6 text-center text-xl leading-6 font-bold whitespace-nowrap">
                  {label.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
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
