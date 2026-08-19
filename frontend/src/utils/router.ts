export interface RouteState {
  page: string;
  roomId?: string;
  tab?: 'login' | 'register';
}

/**
 * Parse current browser URL (pathname, search params, hash) into RouteState
 */
export function getRouteFromUrl(): RouteState {
  if (typeof window === 'undefined') {
    return { page: 'home', roomId: '' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const paramRoomId = searchParams.get('roomId') || searchParams.get('room') || searchParams.get('id') || '';
  const paramTab = searchParams.get('tab') as 'login' | 'register' | null;

  // 1. Root / Home
  if (pathname === '/' || pathname === '/home') {
    return { page: 'home', roomId: '' };
  }

  // 2. Nested Room Detail routes: /rooms/:roomId, /room/:roomId, /room-detail/:roomId
  const roomDetailMatch = pathname.match(/^\/(?:rooms|room|room-detail)\/([^/]+)$/);
  if (roomDetailMatch) {
    return { page: 'room-detail', roomId: decodeURIComponent(roomDetailMatch[1]) };
  }

  // 3. Rooms listing: /rooms or /room-detail
  if (pathname === '/rooms' || pathname === '/room-detail' || pathname === '/room') {
    if (paramRoomId) {
      return { page: 'room-detail', roomId: paramRoomId };
    }
    return { page: 'rooms', roomId: '' };
  }

  // 4. Nested Booking routes: /booking/:roomId or /book/:roomId
  const bookingMatch = pathname.match(/^\/(?:booking|book)\/([^/]+)$/);
  if (bookingMatch) {
    return { page: 'booking', roomId: decodeURIComponent(bookingMatch[1]) };
  }

  // 5. Booking page: /booking or /book
  if (pathname === '/booking' || pathname === '/book') {
    return { page: 'booking', roomId: paramRoomId };
  }

  // 6. About Us
  if (pathname === '/about' || pathname === '/about-us') {
    return { page: 'about', roomId: '' };
  }

  // 7. Services & Amenities
  if (pathname === '/services' || pathname === '/amenities') {
    return { page: 'services', roomId: '' };
  }

  // 8. Restaurant & Dining
  if (pathname === '/restaurant' || pathname === '/dining') {
    return { page: 'restaurant', roomId: '' };
  }

  // 9. Gallery
  if (pathname === '/gallery') {
    return { page: 'gallery', roomId: '' };
  }

  // 10. Contact
  if (pathname === '/contact' || pathname === '/contact-us') {
    return { page: 'contact', roomId: '' };
  }

  // 11. Privacy Policy
  if (pathname === '/privacy' || pathname === '/privacy-policy') {
    return { page: 'privacy', roomId: '' };
  }

  // 12. Terms & Conditions
  if (pathname === '/terms' || pathname === '/terms-and-conditions' || pathname === '/terms-of-service') {
    return { page: 'terms', roomId: '' };
  }

  // 13. Auth / Login
  if (pathname === '/auth' || pathname === '/login' || pathname === '/signin') {
    const tab = paramTab === 'register' ? 'register' : 'login';
    return { page: tab === 'register' ? 'register' : 'auth', roomId: '', tab };
  }

  // 14. Register / Sign Up
  if (pathname === '/register' || pathname === '/signup') {
    return { page: 'register', roomId: '', tab: 'register' };
  }

  // 15. User Dashboard / Profile
  if (pathname === '/profile' || pathname === '/dashboard' || pathname === '/my-account') {
    return { page: 'profile', roomId: '' };
  }

  // Fallback: Check search query or default to parsed path first segment
  const firstSegment = pathname.replace(/^\//, '').split('/')[0];
  if (firstSegment) {
    return { page: firstSegment, roomId: paramRoomId };
  }

  return { page: 'home', roomId: '' };
}

/**
 * Convert page name and optional roomId to canonical URL path
 */
export function pageToPath(page: string, roomId?: string): string {
  switch (page) {
    case 'home':
      return '/';
    case 'rooms':
      return '/rooms';
    case 'room-detail':
      return roomId ? `/rooms/${encodeURIComponent(roomId)}` : '/rooms';
    case 'booking':
      return roomId ? `/booking/${encodeURIComponent(roomId)}` : '/booking';
    case 'about':
      return '/about';
    case 'services':
      return '/services';
    case 'restaurant':
      return '/restaurant';
    case 'gallery':
      return '/gallery';
    case 'contact':
      return '/contact';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'auth':
    case 'login':
      return '/auth';
    case 'register':
      return '/register';
    case 'profile':
    case 'dashboard':
      return '/profile';
    default:
      return `/${page}${roomId ? `/${encodeURIComponent(roomId)}` : ''}`;
  }
}

/**
 * Update browser URL without triggering full page reload
 */
export function pushRouteUrl(page: string, roomId?: string, replace = false) {
  if (typeof window === 'undefined') return;

  const targetPath = pageToPath(page, roomId);
  const currentPath = window.location.pathname;

  if (targetPath !== currentPath) {
    if (replace) {
      window.history.replaceState({ page, roomId }, '', targetPath);
    } else {
      window.history.pushState({ page, roomId }, '', targetPath);
    }
  }
}
