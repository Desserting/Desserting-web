import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import HomePage from '@/pages/home/HomePage';
import InterestsPage from '@/pages/signup/InterestsPage';
import ProfilePage from '@/pages/signup/ProfilePage';
import SignupPage from '@/pages/signup/SignupPage';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/interests" element={<InterestsPage />} />
        <Route path="/signup/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
      {showSplash && <SplashScreen onFinish={finishSplash} />}
    </>
  );
}
