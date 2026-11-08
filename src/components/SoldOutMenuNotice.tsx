import { useEffect, useState } from 'react';
import { CircleMinus } from 'lucide-react';

export default function SoldOutMenuNotice({ name }: { name: string }) {
  const [notice, setNotice] = useState(0);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(0), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <>
      <button
        type="button"
        aria-label={`${name} 품절 안내`}
        onClick={() => setNotice((value) => value + 1)}
        className="focus-visible:outline-mint-deep absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-2"
      />
      {notice > 0 && (
        <p
          role="status"
          className="border-mint-deep/15 shadow-mint-deep/10 animate-in fade-in slide-in-from-bottom-2 bg-chip pointer-events-none fixed bottom-[max(100px,env(safe-area-inset-bottom,0px))] left-1/2 z-50 flex w-max max-w-[calc(100%-40px)] -translate-x-1/2 items-center gap-3 rounded-2xl border py-3 pr-5 pl-3 text-[15px] shadow-lg backdrop-blur-sm duration-200 motion-reduce:animate-none"
        >
          <span className="bg-mint-100 text-mint-deep flex size-9 shrink-0 items-center justify-center rounded-xl">
            <CircleMinus
              aria-hidden="true"
              className="size-5"
              strokeWidth={1.8}
            />
          </span>
          <span className="text-ink font-medium">현재 품절된 메뉴입니다.</span>
        </p>
      )}
    </>
  );
}
