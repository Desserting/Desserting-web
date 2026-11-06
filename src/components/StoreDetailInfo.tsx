import { Clock, MapPin, Phone, Store, Tag } from 'lucide-react';
import type { StoreDetail } from '@/api/stores';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';

type StoreInfo = Pick<
  StoreDetail,
  | 'name'
  | 'coverImageUrl'
  | 'themeStreetName'
  | 'dessertTypes'
  | 'partnerDiscountNotice'
  | 'address'
  | 'businessHours'
  | 'contact'
>;

/** 제휴매장과 카페 지도 상세에서 함께 사용하는 매장 정보 UI. */
export default function StoreDetailInfo({ data }: { data: StoreInfo }) {
  return (
    <>
      <div className="bg-chip mt-[46px] flex aspect-[345/245] items-center justify-center overflow-hidden rounded-[17px]">
        {data.coverImageUrl ? (
          <img
            src={data.coverImageUrl}
            alt={`${data.name} 대표 이미지`}
            className="size-full object-cover"
          />
        ) : (
          <Store aria-hidden className="text-ink-muted size-10" />
        )}
      </div>

      <h2 className="mt-6 text-[26px] leading-[38px] font-bold">{data.name}</h2>
      {data.themeStreetName && (
        <p className="text-ink-muted text-[14px] leading-5">
          {data.themeStreetName}
        </p>
      )}
      {(data.dessertTypes ?? []).length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {(data.dessertTypes ?? []).map((type, index) => (
            <li
              key={type}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium',
                index === 0
                  ? 'bg-mint-100 text-mint-deep'
                  : 'bg-chip text-ink-muted',
              )}
            >
              {dessertLabel(type)}
            </li>
          ))}
        </ul>
      )}

      {data.partnerDiscountNotice && (
        <p className="bg-mint-100 text-mint-deep mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-[14px] leading-5 font-medium">
          <Tag aria-hidden className="mt-0.5 size-4 shrink-0" />
          {data.partnerDiscountNotice}
        </p>
      )}

      <dl className="mt-5 flex flex-col gap-3 text-[15px] leading-6">
        <div className="flex items-start gap-2">
          <dt className="sr-only">주소</dt>
          <MapPin aria-hidden className="mt-1 size-4 shrink-0" />
          <dd>{data.address ?? '주소 정보를 준비 중이에요.'}</dd>
        </div>
        {data.businessHours && (
          <div className="flex items-start gap-2">
            <dt className="sr-only">영업시간</dt>
            <Clock aria-hidden className="mt-1 size-4 shrink-0" />
            <dd className="whitespace-pre-line">{data.businessHours}</dd>
          </div>
        )}
        {data.contact && (
          <div className="flex items-start gap-2">
            <dt className="sr-only">연락처</dt>
            <Phone aria-hidden className="mt-1 size-4 shrink-0" />
            <dd>
              <a href={`tel:${data.contact}`} className="underline">
                {data.contact}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </>
  );
}
