import { useEffect, useRef, useState } from 'react';
import mapImage from '@/assets/explore/map.svg';
import primaryPin from '@/assets/explore/pin-primary.svg';
import pin from '@/assets/explore/pin.svg';
import locate from '@/assets/explore/locate.svg';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const STREETS = [
  {
    name: '앞산 카페거리',
    x: 65,
    y: 294,
    width: 222,
    pinX: 103,
    pinY: 46,
    primary: true,
  },
  {
    name: '수성못 거리',
    x: 240,
    y: 78,
    width: 140,
    pinX: 55,
    pinY: 34,
    primary: false,
  },
  {
    name: '동성로 거리',
    x: 248,
    y: 458,
    width: 140,
    pinX: 55,
    pinY: 35,
    primary: false,
  },
] as const;

export default function CafeMapPage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;
    // Keep the original map, labels and markers on the same coordinate system.
    const observer = new ResizeObserver(([entry]) => {
      const scale = Math.min(
        entry.contentRect.width / 393,
        entry.contentRect.height / 581,
      );
      canvas.style.transform = `scale(${scale})`;
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cafe-map-page text-ink flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex h-[clamp(100px,17.7dvh,151px)] shrink-0 items-end justify-center pb-[34px]">
        <h1 className="text-[23px] leading-[34px] font-bold">카페 지도</h1>
      </header>
      <main
        ref={viewportRef}
        aria-label="테마거리 개념 지도"
        className="bg-map-surface relative min-h-0 flex-1 overflow-hidden"
      >
        <div
          ref={canvasRef}
          className="absolute top-0 left-1/2 h-[581px] w-[393px] origin-top -translate-x-1/2"
        >
          <img
            src={mapImage}
            alt=""
            className="absolute top-0 left-0 max-w-none"
          />
          {STREETS.map((street) => (
            <button
              key={street.name}
              type="button"
              aria-label={`${street.name} 보기`}
              aria-pressed={selectedStreet === street.name}
              onClick={() => {
                setSelectedStreet(street.name);
                setShowDetails(true);
                setNotice('');
              }}
              style={{
                left: street.x,
                top: street.y,
                width: street.width,
                height: street.primary ? 82 : 61,
              }}
              className={cn(
                'focus-visible:outline-mint-deep absolute cursor-pointer rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4',
                selectedStreet === street.name && 'ring-mint-deep/50 ring-2',
              )}
            >
              <span
                className={cn(
                  'absolute top-0 left-0 w-full leading-6 font-bold',
                  street.primary ? 'text-center text-[22px]' : 'text-[17px]',
                )}
              >
                {street.name}
              </span>
              <img
                src={street.primary ? primaryPin : pin}
                alt=""
                className="absolute max-w-none"
                style={{ left: street.pinX, top: street.pinY }}
              />
            </button>
          ))}
          <span className="absolute top-[550px] left-4 text-[10px] leading-6">
            개념 지도
          </span>
          <button
            type="button"
            aria-label="지도 선택 초기화"
            onClick={() => {
              setSelectedStreet(null);
              setShowDetails(false);
              setNotice('지도 선택을 초기화했습니다.');
            }}
            className="focus-visible:outline-mint-deep absolute top-[522px] left-[332px] flex size-[43px] cursor-pointer items-center justify-center rounded-full bg-white focus-visible:outline-2"
          >
            <img src={locate} alt="" />
          </button>
        </div>
      </main>
      <div className="h-3 shrink-0" />
      <BottomNav variant="explore" />
      <p role="status" className="sr-only">
        {notice}
      </p>
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>{selectedStreet}</DialogTitle>
          <DialogDescription>
            이 거리의 제휴매장 안내는 준비 중이에요.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
