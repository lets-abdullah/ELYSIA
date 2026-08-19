import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  avatar?: string;
  username?: string;
  createdAt?: string;
}

export interface UserReservation {
  id: string;
  bookingCode: string;
  customerId?: string;
  roomId?: string;
  roomType?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  totalAmount: number;
  paidAmount: number;
  bookingStatus: string;
  specialRequests?: string;
  createdAt?: string;
  roomNumber?: string;
  roomName?: string;
  roomImage?: string;
  pricePerNight?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  authModalTab: 'login' | 'register';
  userReservations: UserReservation[];
  loadingReservations: boolean;

  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (name: string, phone: string, pass?: string, currentPass?: string) => Promise<{ success: boolean; message?: string }>;
  fetchMyReservations: () => Promise<void>;

  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

import { API_BASE_URL } from '../config/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-memory token only (never stored in localStorage)
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('elysia_cust_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Sync user profile state (JWT is kept in HttpOnly Cookie, NEVER in localStorage)
  const saveSession = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.removeItem('elysia_cust_token'); // Ensure JWT is purged from localStorage
    localStorage.setItem('elysia_cust_user', JSON.stringify(newUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    setUserReservations([]);
    localStorage.removeItem('elysia_cust_token');
    localStorage.removeItem('elysia_cust_user');
  };

  // Validate session on mount via HttpOnly cookie
  useEffect(() => {
    // Purge any legacy tokens stored in localStorage
    localStorage.removeItem('elysia_cust_token');

    fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('elysia_cust_user', JSON.stringify(data.user));
        } else {
          clearSession();
        }
      })
      .catch(() => {
        // Keep cached profile if backend is temporarily unreachable
      });
  }, []);

  const fetchMyReservations = async () => {
    if (!user) return;
    setLoadingReservations(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/reservations/my-reservations`, {
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.reservations) {
        setUserReservations(data.reservations);
      }
    } catch (err) {
      console.error('Failed to fetch user reservations:', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyReservations();
      const interval = setInterval(fetchMyReservations, 3000); // 3-second real-time sync with database!
      return () => clearInterval(interval);
    }
  }, [user?.email, token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password: pass.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid email or password.' };
      }
      saveSession(data.token, data.user);
      setIsAuthModalOpen(false);
      return { success: true, message: 'Welcome back!' };
    } catch (err: any) {
      return { success: false, message: 'Network error. Please check backend connection.' };
    }
  };

  const register = async (name: string, email: string, pass: string, phone: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: pass.trim(),
          phone: phone.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed.' };
      }
      saveSession(data.token, data.user);
      setIsAuthModalOpen(false);
      return { success: true, message: 'Registration successful!' };
    } catch (err: any) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      setIsProfileModalOpen(false);
    }
  };

  const updateProfile = async (name: string, phone: string, pass?: string, currentPass?: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ name, phone, password: pass, currentPassword: currentPass })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Update failed.' };
      }
      setUser(data.user);
      localStorage.setItem('elysia_cust_user', JSON.stringify(data.user));
      return { success: true, message: 'Profile updated successfully.' };
    } catch (err: any) {
      return { success: false, message: 'Server error while updating profile.' };
    }
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => {
    if (user) {
      fetchMyReservations();
      setIsProfileModalOpen(true);
    } else {
      openAuthModal('login');
    }
  };
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAuthModalOpen,
        isProfileModalOpen,
        authModalTab,
        userReservations,
        loadingReservations,
        login,
        register,
        logout,
        updateProfile,
        fetchMyReservations,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
