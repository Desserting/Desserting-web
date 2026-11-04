import { useNavigate } from 'react-router-dom';
import beverage from '@/assets/signup/dessert-beverage.svg';
import cake from '@/assets/signup/dessert-cake.svg';
import cookie from '@/assets/signup/dessert-cookie.svg';
import macaron from '@/assets/signup/dessert-macaron.svg';
import shavedIce from '@/assets/signup/dessert-shaved-ice.svg';
import tart from '@/assets/signup/dessert-tart.svg';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSignupStore } from '@/stores/signupStore';

const DESSERTS = [
  { id: 'cake', label: '케이크', image: cake },
  { id: 'macaron', label: '마카롱', image: macaron },
  { id: 'cookie', label: '쿠키', image: cookie },
  { id: 'tart', label: '타르트', image: tart },
  { id: 'shaved-ice', label: '빙수', image: shavedIce },
  { id: 'beverage', label: '음료', image: beverage },
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const interests = useSignupStore((state) => state.interests);
  const toggleInterest = useSignupStore((state) => state.toggleInterest);

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-8 pt-[55px]">
      <BackButton to="/signup" />
      <h1 className="text-center text-[25px] leading-[30px] font-bold">
        좋아하는 디저트를
        <br />
        선택해 주세요
      </h1>
      <p className="mt-[22px] text-center text-base">(복수 선택 가능)</p>
      <ul className="mt-[59px] -ml-[5px] grid w-[335px] max-w-none grid-cols-3 gap-x-[7px] gap-y-[33px] self-start">
        {DESSERTS.map(({ id, label, image }) => {
          const selected = interests.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(id)}
                className={cn(
                  'flex h-[141px] w-full cursor-pointer flex-col items-center rounded-[18px] pt-1.5 transition-colors',
                  selected ? 'bg-mint-100' : 'bg-white',
                )}
              >
                <img src={image} alt="" className="block" />
                <span className="mt-[15px] text-[17px] font-bold">{label}</span>
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
        className="mt-auto mb-10"
      >
        다음
      </Button>
    </main>
  );
}
