import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import HomePage from '@/pages/home/HomePage';
import MyPage from '@/pages/my/MyPage';
import HeartPurchasePage from '@/pages/my/HeartPurchasePage';
import MatchingCardsPage from '@/pages/matching/MatchingCardsPage';
import MatchingSettingsPage from '@/pages/matching/MatchingSettingsPage';
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
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/hearts" element={<HeartPurchasePage />} />
        <Route path="/my/profile" element={<ProfilePage mode="edit" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/interests" element={<InterestsPage />} />
        <Route path="/signup/profile" element={<ProfilePage />} />
        <Route path="/matching" element={<MatchingSettingsPage />} />
        <Route path="/matching/cards" element={<MatchingCardsPage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
      {showSplash && <SplashScreen onFinish={finishSplash} />}
    </>
  );
}
