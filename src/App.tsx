import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <Routes>
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
      {showSplash && <SplashScreen onFinish={finishSplash} />}
    </>
  );
}
