import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room } from '../types';
import { ROOMS_DATA } from '../data/roomsData';
import { AlertCircle } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

interface BookingContextType {
  rooms: Room[];
  checkIn: string;
  checkOut: string;
  selectedRoomId: string;
  guests: number;
  airportTransfer: boolean;
  spaPackage: boolean;
  isBookingModalOpen: boolean;
  isErpViewerOpen: boolean;
  setIsErpViewerOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  setCheckIn: (date: string) => void;
  setCheckOut: (date: string) => void;
  setSelectedRoomId: (id: string) => void;
  setGuests: (num: number) => void;
  setAirportTransfer: (val: boolean) => void;
  setSpaPackage: (val: boolean) => void;
  openBookingModal: (roomId?: string) => void;
  closeBookingModal: () => void;
  getNightsCount: () => number;
  getTotalPrice: () => number;
  selectedRoom: Room | undefined;
  refreshRooms: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper for default dates: Tomorrow to 3 days after
const getDefaultDates = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkout = new Date(tomorrow);
  checkout.setDate(checkout.getDate() + 3);

  return {
    in: tomorrow.toISOString().split('T')[0],
    out: checkout.toISOString().split('T')[0]
  };
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaults = getDefaultDates();
  const [rooms, setRooms] = useState<Room[]>(ROOMS_DATA);
  const [checkIn, setCheckIn] = useState<string>(defaults.in);
  const [checkOut, setCheckOut] = useState<string>(defaults.out);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS_DATA[0].id);
  const [guests, setGuests] = useState<number>(2);
  const [airportTransfer, setAirportTransfer] = useState<boolean>(true);
  const [spaPackage, setSpaPackage] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isErpViewerOpen, setIsErpViewerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchRoomsFromBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (data.success && data.rooms && data.rooms.length > 0) {
        setRooms(data.rooms);
        if (!data.rooms.some((r: Room) => r.id === selectedRoomId)) {
          setSelectedRoomId(data.rooms[0].id);
        }
      }
    } catch {
      // Fallback to initial ROOMS_DATA
    }
  };

  useEffect(() => {
    fetchRoomsFromBackend();
    const interval = setInterval(fetchRoomsFromBackend, 3000); // Auto-sync rooms from database every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0] || ROOMS_DATA[0];

  const openBookingModal = (roomId?: string) => {
    const idToUse = roomId || selectedRoomId;
    const targetRoom = rooms.find((r) => r.id === idToUse);
    const isReserved =
      targetRoom?.status?.toLowerCase() === 'reserved' ||
      targetRoom?.status?.toLowerCase() === 'occupied' ||
      (targetRoom as any)?.isReserved === true;

    if (isReserved) {
      showToast("This room is already reserved. Please try another one.");
      return;
    }

    if (roomId) {
      setSelectedRoomId(roomId);
    }
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const getNightsCount = (): number => {
    if (!checkIn || !checkOut) return 1;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const getTotalPrice = (): number => {
    const nights = getNightsCount();
    const pricePerNight = selectedRoom?.pricePerNight || (selectedRoom as unknown as { price?: number })?.price || 0;
    const basePrice = pricePerNight * nights;
    const transferFee = airportTransfer ? 250 : 0;
    const spaFee = spaPackage ? 350 * guests : 0;
    return basePrice + transferFee + spaFee;
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        checkIn,
        checkOut,
        selectedRoomId,
        guests,
        airportTransfer,
        spaPackage,
        isBookingModalOpen,
        isErpViewerOpen,
        setIsErpViewerOpen,
        toastMessage,
        showToast,
        setCheckIn,
        setCheckOut,
        setSelectedRoomId,
        setGuests,
        setAirportTransfer,
        setSpaPackage,
        openBookingModal,
        closeBookingModal,
        getNightsCount,
        getTotalPrice,
        selectedRoom,
        refreshRooms: fetchRoomsFromBackend
      }}
    >
      {/* Global Reserved Room Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1A1A1A] text-white border-2 border-rose-500/80 px-6 py-4 shadow-2xl rounded-none flex items-center gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide font-serif text-rose-200">
            {toastMessage}
          </span>
        </div>
      )}

      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
