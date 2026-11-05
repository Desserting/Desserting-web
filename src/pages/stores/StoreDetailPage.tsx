import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Clock, MapPin, Phone, Store, Tag } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchStoreDetail, storeKeys, type StoreMenu } from '@/api/stores';
import BackButton from '@/components/BackButton';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';

const priceFormatter = new Intl.NumberFormat('ko-KR');

const isNotFound = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

function MenuItem({ menu }: { menu: StoreMenu }) {
  return (
    <li className="border-hairline flex items-center gap-3 rounded-2xl border p-3">
      <span className="bg-chip flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        {menu.imageUrl ? (
          <img
            src={menu.imageUrl}
            alt=""
            className={cn(
              'size-full object-cover',
              menu.soldOut && 'opacity-50',
            )}
          />
        ) : (
          <Store aria-hidden className="text-ink-muted size-6" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'truncate text-[16px] leading-6 font-bold',
              menu.soldOut && 'text-ink-muted',
            )}
          >
            {menu.name}
          </span>
          {menu.representative && (
            <span className="bg-mint-100 text-mint-deep shrink-0 rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold">
              대표
            </span>
          )}
        </span>
        {menu.description && (
          <span className="text-ink-muted line-clamp-1 block text-[13px] leading-5">
            {menu.description}
          </span>
        )}
        <span className="mt-0.5 block text-[14px] leading-5">
          {menu.soldOut ? (
            <span className="text-ink-muted font-bold">품절</span>
          ) : (
            `${priceFormatter.format(menu.price)}원`
          )}
        </span>
      </span>
    </li>
  );
}

export default function StoreDetailPage() {
  const { storeId } = useParams();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const backTo =
    from?.startsWith('/') && !from.startsWith('//') ? from : '/stores';

  const id = Number(storeId);
  const validId = Number.isInteger(id) && id > 0;
  const store = useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => fetchStoreDetail(id),
    enabled: validId,
    // 없는 매장(404)은 다시 시도해도 같다
    retry: (count, error) => !isNotFound(error) && count < 2,
  });

  const notFound = !validId || (store.isError && isNotFound(store.error));

  if (notFound) {
    return (
      <main className="text-ink flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-[23px] font-bold">매장을 찾을 수 없어요</h1>
        <p>매장 주소를 다시 확인해 주세요.</p>
        <Button asChild variant="brand">
          <Link to={backTo}>돌아가기</Link>
        </Button>
      </main>
    );
  }

  const data = store.data;
  const menus = data?.menus ?? [];
  const categories = Array.from(
    new Map(
      menus.map((menu) => [
        menu.category ?? 'ETC',
        menu.categoryLabel ?? '메뉴',
      ]),
    ),
  );

  return (
    <>
      <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pt-[34px] pb-6">
        <BackButton to={backTo} />
        <h1 className="sr-only">매장 상세</h1>

        {store.isPending && (
          <div role="status" className="mt-[46px] animate-pulse space-y-4">
            <span className="sr-only">매장 정보를 불러오는 중이에요</span>
            <div
              aria-hidden
              className="bg-chip aspect-[345/245] rounded-[17px]"
            />
            <div aria-hidden className="bg-chip h-7 w-1/2 rounded-full" />
            <div aria-hidden className="bg-chip h-5 w-3/4 rounded-full" />
          </div>
        )}

        {store.isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <p className="text-ink-muted text-[16px] leading-6">
              매장 정보를 불러오지 못했어요.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void store.refetch()}
              className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
            >
              다시 시도
            </Button>
          </div>
        )}

        {data && (
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

            <h2 className="mt-6 text-[26px] leading-[38px] font-bold">
              {data.name}
            </h2>
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

            <section aria-labelledby="store-menus" className="mt-8">
              <h2 id="store-menus" className="text-[19px] leading-7 font-bold">
                메뉴
              </h2>
              {menus.length === 0 ? (
                <p className="text-ink-muted mt-3 text-[15px]">
                  등록된 메뉴가 아직 없어요.
                </p>
              ) : (
                categories.map(([category, label]) => (
                  <div key={category} className="mt-3">
                    {categories.length > 1 && (
                      <h3 className="text-ink-muted mb-2 text-[13px] leading-5 font-bold">
                        {label}
                      </h3>
                    )}
                    <ul className="flex flex-col gap-2">
                      {menus
                        .filter((menu) => (menu.category ?? 'ETC') === category)
                        .map((menu) => (
                          <MenuItem key={menu.menuId} menu={menu} />
                        ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
      <BottomNav activePath="/home" />
    </>
  );
}
