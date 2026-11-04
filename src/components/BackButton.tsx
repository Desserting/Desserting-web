import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BackButton({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="뒤로 가기"
      className="absolute top-[34px] left-[26px] block size-6"
    >
      <ArrowLeft className="size-6" aria-hidden />
    </Link>
  );
}
