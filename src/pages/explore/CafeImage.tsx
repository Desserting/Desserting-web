import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CafeImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return src && src !== failedSrc ? (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      className={cn('object-cover', className)}
    />
  ) : (
    <div
      role="img"
      aria-label={`${alt} 사진 없음`}
      className={cn(
        'bg-cafe-field text-my-muted flex items-center justify-center',
        className,
      )}
    >
      <ImageOff aria-hidden="true" className="size-6" />
    </div>
  );
}
