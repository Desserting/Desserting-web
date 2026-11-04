import { useNavigate } from 'react-router-dom';
import bakedGoods from '@/assets/signup/dessert-baked-goods.svg';
import bakery from '@/assets/signup/dessert-bakery.svg';
import cake from '@/assets/signup/dessert-cake.svg';
import coffee from '@/assets/signup/dessert-coffee.svg';
import shavedIce from '@/assets/signup/dessert-shaved-ice-icecream.svg';
import tartPie from '@/assets/signup/dessert-tart-pie.svg';
import tea from '@/assets/signup/dessert-tea.svg';
import traditional from '@/assets/signup/dessert-traditional.svg';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSignupStore } from '@/stores/signupStore';

const DESSERTS = [
  { id: 'cake', label: '케이크', image: cake },
  { id: 'bakery', label: '베이커리', image: bakery },
  { id: 'baked-goods', label: '구움과자', image: bakedGoods },
  { id: 'tart-pie', label: '타르트&파이', image: tartPie },
  { id: 'shaved-ice-icecream', label: '빙수&아이스크림', image: shavedIce },
  { id: 'coffee', label: '커피', image: coffee },
  { id: 'tea', label: '차&논커피', image: tea },
  { id: 'traditional', label: '전통 디저트', image: traditional },
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
      <ul className="mt-[31px] grid w-[339px] max-w-none grid-cols-2 gap-x-[11px] gap-y-[15px] self-center">
        {DESSERTS.map(({ id, label, image }) => {
          const selected = interests.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(id)}
                className={cn(
                  'flex h-[106px] w-full cursor-pointer flex-col items-center rounded-[18px] pt-1 transition-colors',
                  selected ? 'bg-mint-100' : 'bg-white',
                )}
              >
                <span className="flex h-[60px] items-center justify-center">
                  <img src={image} alt="" className="block" />
                </span>
                <span className="mt-2.5 text-[15px] leading-6 font-bold">
                  {label}
                </span>
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
