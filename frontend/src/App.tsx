import React, { useState, useEffect, useCallback } from 'react';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ErpPayloadViewer } from './components/common/ErpPayloadViewer';
import { AuthModal } from './components/common/AuthModal';
import { ProfileModal } from './components/common/ProfileModal';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { getRouteFromUrl, pushRouteUrl } from './utils/router';

export default function App() {
  // Initialize route from current URL (persists on refresh / direct link)
  const [routeState, setRouteState] = useState(() => getRouteFromUrl());

  const activePage = routeState.page;
  const activeRoomId = routeState.roomId || '';

  // Synchronize with browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(getRouteFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update route and push state to browser URL
  const handleNavigate = useCallback((page: string, roomId?: string) => {
    pushRouteUrl(page, roomId);
    setRouteState({
      page,
      roomId: roomId || '',
      tab: page === 'register' ? 'register' : 'login'
    });
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'rooms':
        return <RoomsPage onNavigate={handleNavigate} />;
      case 'room-detail':
      case 'booking':
        return <BookingPage roomId={activeRoomId} onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'restaurant':
        return <RestaurantPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;
      case 'auth':
      case 'login':
        return <AuthPage onNavigate={handleNavigate} initialTab="login" />;
      case 'register':
        return <AuthPage onNavigate={handleNavigate} initialTab="register" />;
      case 'profile':
      case 'dashboard':
        return <UserDashboardPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <BookingProvider>
        <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-[#1A1A1A] selection:bg-[#C5B358] selection:text-white font-sans antialiased">
          <Navbar activePage={activePage} onNavigate={handleNavigate} />

          <main className="flex-1">
            {renderPage()}
          </main>

          <Footer onNavigate={handleNavigate} />
          <ScrollToTop />
          <ErpPayloadViewer />
          <AuthModal />
          <ProfileModal />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}
