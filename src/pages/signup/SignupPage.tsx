import { useNavigate } from 'react-router-dom';
import googleIcon from '@/assets/signup/icon-google.svg';
import appleIcon from '@/assets/signup/icon-apple.svg';
import AuthSwitch from '@/components/AuthSwitch';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const navigate = useNavigate();

  // TODO: 소셜 로그인/이메일 가입 연동 전까지는 바로 다음 단계로 이동
  const startSignup = () => navigate('/signup/interests');

  return (
    <main className="text-ink relative flex flex-1 flex-col bg-white px-8 pt-[106px]">
      <h1 className="text-center text-[27px] leading-[29px] font-bold">
        회원가입
      </h1>
      <div className="mt-[121px] flex flex-col gap-[18px]">
        <Button type="button" variant="kakao" size="xl" onClick={startSignup}>
          <span aria-hidden>●</span>
          카카오로 시작하기
        </Button>
        <Button type="button" variant="social" size="xl" onClick={startSignup}>
          <img
            src={googleIcon}
            alt=""
            className="block size-[22px] translate-y-[3px]"
          />
          <span className="w-[170px] text-center">구글로 시작하기</span>
        </Button>
        <Button type="button" variant="social" size="xl" onClick={startSignup}>
          <img
            src={appleIcon}
            alt=""
            className="block size-[22px] translate-y-[3px]"
          />
          <span className="w-[170px] text-center">애플로 시작하기</span>
        </Button>
        <Button type="button" variant="social" size="xl" onClick={startSignup}>
          이메일로 가입하기
        </Button>
      </div>
      <AuthSwitch
        message="이미 계정이 있으신가요?"
        linkLabel="로그인"
        to="/login"
        className="mt-auto pb-[96px]"
      />
    </main>
  );
}
