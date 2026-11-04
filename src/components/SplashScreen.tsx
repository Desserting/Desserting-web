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
      <div className="relative mx-auto flex h-full max-w-[430px] flex-col items-center overflow-hidden pt-[246px]">
        <img src={logo} alt="" className="block size-[100px]" />
        <p className="mt-[25px] text-[40px] leading-[44px] font-bold">
          Desserting
        </p>
        <p className="mt-[28px] text-center text-[21px] leading-[25px] font-bold">
          디저트로 연결되는
          <br />
          특별한 만남
        </p>
        <img
          src={waves}
          alt=""
          className="absolute bottom-0 left-0 block w-full"
        />
      </div>
    </div>
  );
}
