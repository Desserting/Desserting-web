import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface BubbleProps extends ComponentProps<'div'> {
  /** mint: 내가 말하는 쪽·소개 말풍선, chip: 상대가 말하는 쪽 */
  tone?: 'mint' | 'chip';
  /** 말풍선이 뻗어 나오는 방향. 꼬리 모서리와 애니메이션 기준점이 정해진다 */
  side?: 'left' | 'right';
  /** 연속된 말풍선의 첫 번째라서 꼬리 모서리를 각지게 할지 */
  tail?: boolean;
  /** 톡 튀어나오는 등장 애니메이션 */
  animated?: boolean;
}

/** 자기소개, 채팅 등 화면 전반에서 쓰는 공용 말풍선 */
export default function Bubble({
  tone = 'mint',
  side = 'left',
  tail = false,
  animated = true,
  className,
  ...props
}: BubbleProps) {
  return (
    <div
      className={cn(
        'max-w-[88%] rounded-[22px] px-4 py-3 text-[16px] leading-6 break-keep',
        tone === 'mint' ? 'bg-mint-100' : 'bg-chip',
        side === 'left' ? 'origin-top-left' : 'origin-top-right',
        tail && (side === 'left' ? 'rounded-tl-[6px]' : 'rounded-tr-[6px]'),
        animated && 'motion-safe:animate-bubble-in',
        className,
      )}
      {...props}
    />
  );
}
