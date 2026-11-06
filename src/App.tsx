import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import { BookingFlowProvider } from '@/components/BookingFlowProvider';
import ChatListPage from '@/pages/chat/ChatListPage';
import ChatRoomPage from '@/pages/chat/ChatRoomPage';
import HomePage from '@/pages/home/HomePage';
import CafeReservationPage from '@/pages/explore/CafeReservationPage';
import CafeMapPage from '@/pages/explore/CafeMapPage';
import CafeListPage from '@/pages/explore/CafeListPage';
import ChatRequestsPage from '@/pages/chat/ChatRequestsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import CafeMenuPage from '@/pages/explore/CafeMenuPage';
import CafePaymentPage from '@/pages/explore/CafePaymentPage';
import CafeReservationResultPage from '@/pages/explore/CafeReservationResultPage';
import StoreDetailPage from '@/pages/stores/StoreDetailPage';
import StoresPage from '@/pages/stores/StoresPage';
import MyPage from '@/pages/my/MyPage';
import MyProfilePage from '@/pages/my/MyProfilePage';
import PremiumPassPage from '@/pages/my/PremiumPassPage';
import HeartPurchasePage from '@/pages/my/HeartPurchasePage';
import CandidateProfilePage from '@/pages/profile/CandidateProfilePage';
import MatchingCardsPage from '@/pages/matching/MatchingCardsPage';
import MatchingSettingsPage from '@/pages/matching/MatchingSettingsPage';
import ProfileExplorePage from '@/pages/profile/ProfileExplorePage';
import LoginPage from '@/pages/login/LoginPage';
import InterestsPage from '@/pages/signup/InterestsPage';
import ProfilePage from '@/pages/signup/ProfilePage';
import SignupPage from '@/pages/signup/SignupPage';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <BookingFlowProvider>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<CafeMapPage />} />
        <Route path="/explore/areas/:areaId/cafes" element={<CafeListPage />} />
        <Route
          path="/explore/cafes/:cafeId"
          element={<StoreDetailPage showMenus={false} />}
        />
        <Route path="/explore/cafes/:cafeId/menu" element={<CafeMenuPage />} />
        <Route
          path="/explore/cafes/:cafeId/orders/:orderId"
          element={<CafeReservationResultPage view="order" />}
        />
        <Route
          path="/explore/cafes/:cafeId/reservations/:reservationId/complete"
          element={<CafeReservationResultPage view="complete" />}
        />
        <Route
          path="/explore/cafes/:cafeId/reservations/:reservationId/order"
          element={<CafeReservationResultPage view="order" />}
        />
        <Route
          path="/explore/cafes/:cafeId/payment"
          element={<CafePaymentPage />}
        />
        <Route
          path="/explore/cafes/:cafeId/reservation"
          element={<CafeReservationPage />}
        />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/requests" element={<ChatRequestsPage />} />
        <Route path="/chat/:roomId" element={<ChatRoomPage />} />
        <Route path="/profile" element={<ProfileExplorePage />} />
        <Route path="/profile/:id" element={<CandidateProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/my/orders" element={<Navigate to="/my" replace />} />
        <Route path="/my/premium" element={<PremiumPassPage />} />
        <Route path="/my/hearts" element={<HeartPurchasePage />} />
        <Route path="/my/profile" element={<MyProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/interests" element={<InterestsPage />} />
        <Route path="/signup/profile" element={<ProfilePage />} />
        <Route path="/matching" element={<MatchingSettingsPage />} />
        <Route path="/matching/cards" element={<MatchingCardsPage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
      {showSplash && <SplashScreen onFinish={finishSplash} />}
    </BookingFlowProvider>
  );
}
