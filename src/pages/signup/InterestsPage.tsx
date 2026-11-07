import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSignupStore } from '@/stores/signupStore';

// id는 서버의 DessertType 코드와 같다. 이미지는 public/avatars 의 PNG. 매칭·채팅의 DessertAvatar 와 같은 파일을 쓴다
const DESSERTS = [
  { id: 'CAKE', label: '케이크', image: '/avatars/cake.png' },
  { id: 'BAKERY', label: '베이커리', image: '/avatars/bakery.png' },
  { id: 'COOKIE_FINANCIER', label: '구움과자', image: '/avatars/cookie.png' },
  { id: 'TART_PIE', label: '타르트&파이', image: '/avatars/tart.png' },
  {
    id: 'ICE_CREAM_BINGSU',
    label: '빙수&아이스크림',
    image: '/avatars/bingsu.png',
  },
  { id: 'COFFEE', label: '커피', image: '/avatars/coffee.png' },
  { id: 'TEA_NON_COFFEE', label: '차&논커피', image: '/avatars/tea.png' },
  {
    id: 'TRADITIONAL_KOREAN',
    label: '전통 디저트',
    image: '/avatars/traditional.png',
  },
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const interests = useSignupStore((state) => state.interests);
  const toggleInterest = useSignupStore((state) => state.toggleInterest);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-full">
          <BackButton
            to="/signup"
            className="relative top-auto left-auto flex size-11 items-center justify-center"
          />
        </div>
        <h1 className="text-center text-[25px] leading-[36.25px] font-bold tracking-[-0.5px]">
          좋아하는 디저트를
          <br />
          선택해 주세요
        </h1>
        <p className="text-ink-sub text-[15px] leading-[22.5px]">
          (복수 선택 가능)
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-[14px] pt-7">
        {DESSERTS.map(({ id, label, image }) => {
          const selected = interests.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(id)}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border py-2 transition-colors',
                  selected
                    ? 'bg-mint-100 border-mint'
                    : 'bg-field-bg border-field-line',
                )}
              >
                <span className="flex h-16 w-full items-center justify-center">
                  {/* PNG 는 300px 정사각 캔버스(아이콘 77%)라 Figma 크기(77x60)에 맞춰 맞춘다 */}
                  <img
                    src={image}
                    alt=""
                    className="block size-[75px] max-w-none shrink-0"
                  />
                </span>
                <span className="text-sm leading-6 font-bold">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="brand"
        size="xl"
        disabled={interests.length === 0}
        onClick={() => navigate('/signup/profile')}
        className="mt-7 h-[55px] rounded-[15px] pb-0 text-base"
      >
        다음
      </Button>
    </AuthLayout>
  );
}
