import { useEffect, useState } from 'react';
import logo from '@/assets/signup/splash-logo.svg';
import waves from '@/assets/signup/splash-waves.svg';
import { cn } from '@/lib/utils';

const SHOW_MS = 1800;
const FADE_MS = 300;

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), SHOW_MS);
    const finishTimer = setTimeout(onFinish, SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-label="Desserting"
      className={cn(
        'bg-mint-50 text-ink fixed inset-0 z-50 transition-opacity',
        leaving && 'opacity-0',
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="mx-auto flex h-full max-w-[430px] flex-col items-center overflow-hidden">
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center pt-[min(10dvh,80px)]">
          <img
            src={logo}
            alt=""
            className="block size-[clamp(64px,12dvh,100px)] shrink-0"
          />
          <p className="mt-[clamp(12px,3dvh,25px)] text-[clamp(28px,5dvh,40px)] leading-[1.1] font-bold">
            Desserting
          </p>
          <p className="mt-[clamp(12px,3dvh,28px)] text-center text-[clamp(16px,2.6dvh,21px)] leading-[1.2] font-bold">
            디저트로 연결되는
            <br />
            특별한 만남
          </p>
        </div>
        <img
          src={waves}
          alt=""
          className="block h-auto w-full shrink-0"
        />
      </div>
    </div>
  );
}
