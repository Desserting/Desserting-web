import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CafeNotFound({
  backTo = '/home',
}: {
  backTo?: string;
}) {
  return (
    <main className="text-ink flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-[23px] font-bold">매장을 찾을 수 없어요</h1>
      <p>매장 주소를 다시 확인해 주세요.</p>
      <Button asChild variant="brand">
        <Link to={backTo}>돌아가기</Link>
      </Button>
    </main>
  );
}
