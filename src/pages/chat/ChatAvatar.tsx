import { useState } from 'react';
import fallbackAvatar from '@/assets/signup/avatar-cake.svg';
import { cn } from '@/lib/utils';

/** 디저트 아바타. 주소가 없거나 불러오지 못하면 기본 케이크 아바타를 보여준다 */
export default function ChatAvatar({
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
        src={useFallback ? fallbackAvatar : src}
        alt=""
        onError={() => setFailed(true)}
        className={
          useFallback ? 'size-3/5 object-contain' : 'size-full object-cover'
        }
      />
    </span>
  );
}
