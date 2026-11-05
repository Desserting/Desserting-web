import { useState } from 'react';
import { cn } from '@/lib/utils';

/** public/avatars 의 기본 케이크 PNG. 백엔드가 내려주는 아바타 주소와 같은 파일이다 */
const FALLBACK_AVATAR = '/avatars/cake.png';

/** 디저트 아바타. 주소가 없거나 불러오지 못하면 기본 케이크 아바타를 보여준다 */
export default function DessertAvatar({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const useFallback = !src || failed;

  return (
    <span
      className={cn(
        'bg-cream flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
    >
      <img
        src={useFallback ? FALLBACK_AVATAR : src}
        alt=""
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </span>
  );
}
