import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { InputField } from '../components/forms/InputField';
import { DatePicker } from '../components/forms/DatePicker';
import { bookingSchema } from '../utils/validationSchemas';
import { BookingFormData, Room } from '../types';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { ROOMS_DATA } from '../data/roomsData';
import { RoomCard } from '../components/sections/RoomCard';
import {
  Users, Maximize2, Bed, Eye, CheckCircle2, ChevronLeft, ChevronRight,
  Star, Sparkles, Terminal, RefreshCw, Filter, Calendar, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { FadeInUp } from '../components/common/FadeInUp';
import { API_BASE_URL } from '../config/api';

interface BookingPageProps {
  roomId?: string;
  onNavigate?: (page: string, roomId?: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ roomId, onNavigate }) => {
  const {
    rooms,
    checkIn,
    checkOut,
    setCheckIn,
    setCheckOut,
    selectedRoomId,
    setSelectedRoomId,
    showToast,
    refreshRooms
  } = useBooking();

  const { user, token, isAuthenticated, openAuthModal, fetchMyReservations } = useAuth();

  // Find initial room (from prop, context, or default first room)
  const initialRoom = rooms.find((r) => r.id === (roomId || selectedRoomId)) || rooms[0] || ROOMS_DATA[0];

  const [activeRoom, setActiveRoom] = useState<Room>(initialRoom);
  const [activeImage, setActiveImage] = useState<string>(initialRoom.image);
  const [galleryIdx, setGalleryIdx] = useState<number>(0);
  const [guests, setGuests] = useState<number>(2);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Sync active room when rooms state updates from database
  useEffect(() => {
    const currentId = roomId || selectedRoomId;
    const found = rooms.find((r) => r.id === currentId);
    if (found) {
      setActiveRoom(found);
      setActiveImage(found.image);
    }
  }, [rooms, roomId, selectedRoomId]);

  // Update active room when prop changes
  useEffect(() => {
    if (roomId) {
      const found = rooms.find((r) => r.id === roomId);
      if (found) {
        setActiveRoom(found);
        setActiveImage(found.image);
        setGalleryIdx(0);
      }
    }
  }, [roomId, rooms]);

  const { submit, isLoading, response, reset: resetSubmit } = useFormSubmit('/api/erp/bookings');

  const {
    register,
    handleSubmit,
    watch,
    reset: resetForm,
    setValue,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      checkIn: checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    }
  });

  // Pre-fill user data when user logs in
  useEffect(() => {
    if (user) {
      if (user.name) setValue('guestName', user.name);
      if (user.email) setValue('email', user.email);
      if (user.phone) setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const checkInVal = watch('checkIn');
  const checkOutVal = watch('checkOut');
  const watchedCheckIn = checkInVal || checkIn;
  const watchedCheckOut = checkOutVal || checkOut;

  const nights = React.useMemo(() => {
    if (!watchedCheckIn || !watchedCheckOut) return 1;
    const diff = new Date(watchedCheckOut).getTime() - new Date(watchedCheckIn).getTime();
    const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 1;
  }, [watchedCheckIn, watchedCheckOut]);

  const pricePerNight = activeRoom.pricePerNight || (activeRoom as any).price || 200;
  const subtotal = pricePerNight * nights;
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  const handleSelectRoom = (room: Room) => {
    setActiveRoom(room);
    setSelectedRoomId(room.id);
    setActiveImage(room.image);
    setGalleryIdx(0);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const prevImage = () => {
    const gallery = activeRoom.gallery && activeRoom.gallery.length > 0 ? activeRoom.gallery : [activeRoom.image];
    const newIdx = (galleryIdx - 1 + gallery.length) % gallery.length;
    setGalleryIdx(newIdx);
    // eslint-disable-next-line security/detect-object-injection -- reviewed, bound gallery array index
    setActiveImage(gallery[newIdx] || activeRoom.image);
  };

  const nextImage = () => {
    const gallery = activeRoom.gallery && activeRoom.gallery.length > 0 ? activeRoom.gallery : [activeRoom.image];
    const newIdx = (galleryIdx + 1) % gallery.length;
    setGalleryIdx(newIdx);
    // eslint-disable-next-line security/detect-object-injection -- reviewed, bound gallery array index
    setActiveImage(gallery[newIdx] || activeRoom.image);
  };

  const onSubmit = async (data: BookingFormData) => {
    // ── Strict Auth Check: Only registered signed-in users can book rooms ────────
    if (!isAuthenticated || !user) {
      showToast("Account Required: Please sign in or register to book a room.");
      if (onNavigate) {
        onNavigate('register');
      } else {
        openAuthModal('register');
      }
      return;
    }

    const isReserved =
      activeRoom?.status?.toLowerCase() === 'reserved' ||
      activeRoom?.status?.toLowerCase() === 'occupied' ||
      (activeRoom as any)?.isReserved === true;

    if (isReserved) {
      showToast("This room is already reserved. Please try another one.");
      return;
    }

    setCheckIn(data.checkIn);
    setCheckOut(data.checkOut);

    const payload = {
      guestName: data.guestName,
      email: data.email,
      phone: data.phone,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests,
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      roomType: activeRoom.category || activeRoom.type || 'Deluxe',
      totalNights: nights,
      totalPrice: total,
      timestamp: new Date().toISOString()
    };

    // Also post to backend /api/reservations directly with auth header if logged in
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          guestName: data.guestName,
          email: data.email,
          phone: data.phone,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests,
          roomId: activeRoom.id,
          roomType: activeRoom.category || activeRoom.type || 'Deluxe',
          totalAmount: total,
          paidAmount: total,
          bookingSource: 'Website'
        })
      });
      if (token) {
        fetchMyReservations();
      }
      refreshRooms();
    } catch (e) {
      console.error('Failed to post reservation to backend:', e);
    }

    await submit(payload as unknown as Record<string, unknown>);
  };

  const handleReset = () => {
    resetSubmit();
    resetForm();
  };

  const categories = ['All', 'Presidential', 'Penthouse', 'Villa', 'Suite', 'Deluxe'];
  const filteredRooms = categoryFilter === 'All'
    ? ROOMS_DATA
    : ROOMS_DATA.filter((r) => r.category === categoryFilter);

  return (
    <div className="pt-20 sm:pt-24 pb-20 bg-[#FAF9F6] text-[#1A1A1A] min-h-screen">
      {/* Top Banner Header */}
      <FadeInUp className="bg-[#1A1A1A] text-white py-12 mb-8 border-b border-[#C5B358]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-[#C5B358]/40 text-[#C5B358] text-[11px] uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Residence & Reservation Portal
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white">
            {activeRoom.name}
          </h1>
          <p className="text-[#DBDAD7] font-light text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {activeRoom.tagline}
          </p>
        </div>
      </FadeInUp>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {onNavigate && (
          <div className="mb-6">
            <button
              onClick={() => onNavigate('rooms')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5F5E5E] hover:text-[#1A1A1A] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to All Rooms ({ROOMS_DATA.length})
            </button>
          </div>
        )}

        {response ? (
          /* Confirmation Success View */
          <div className="max-w-xl w-full mx-auto space-y-8 bg-white p-8 sm:p-12 border border-[#E5E5E5] text-center shadow-lg my-8">
            <div className="w-16 h-16 bg-[#1A1A1A] text-[#C5B358] border border-[#C5B358]/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs uppercase tracking-[0.2em] font-extrabold">
                Status: Pending Staff Approval
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                Reservation Request Received
              </h2>
              <p className="text-xs text-[#5F5E5E] max-w-md mx-auto">
                Your reservation has been submitted with status <strong className="text-amber-800">Pending Approval</strong>. Our front-desk team will review and confirm your booking shortly.
              </p>
              <div className="inline-block bg-[#FAF9F6] px-4 py-2 border border-[#E5E5E5] font-mono text-xs text-[#1A1A1A] mt-2">
                Booking Reference: <span className="text-[#C5B358] font-bold">{response.bookingReference}</span>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-6 border border-[#E5E5E5] text-left text-xs space-y-3 font-light text-[#1A1A1A]">
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[#5F5E5E]">Reserved Room:</span>
                <span className="font-semibold text-[#1A1A1A]">{activeRoom.name} ({activeRoom.category})</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[#5F5E5E]">Check-In:</span>
                <span className="font-semibold text-[#1A1A1A]">{watchedCheckIn}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[#5F5E5E]">Check-Out:</span>
                <span className="font-semibold text-[#1A1A1A]">{watchedCheckOut} ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[#5F5E5E]">Guests:</span>
                <span className="font-semibold text-[#1A1A1A]">{guests} Guests</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                <span className="text-[#5F5E5E]">Total Amount:</span>
                <span className="font-semibold text-[#C5B358]">${total.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F5E5E]">Status:</span>
                <span className="text-emerald-700 font-semibold">Guaranteed & ERP Synced</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Proceed to Website
              </button>
            </div>
          </div>
        ) : (
          /* MAIN UNIFIED LAYOUT: LEFT DETAILS + RIGHT BOOKING FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* LEFT COLUMN: Room Gallery, Specs & Description (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">

              {/* Room Header Info */}
              <div className="space-y-2 border-b border-[#E5E5E5] pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-[#1A1A1A] text-[#C5B358] border border-[#C5B358]/40 text-[10px] uppercase tracking-[0.2em] font-semibold">
                    {activeRoom.category}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C5B358] text-[#C5B358]" />
                    ))}
                  </div>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
                  {activeRoom.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#5F5E5E]">
                  {activeRoom.view}
                </p>
              </div>

              {/* Image Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-16/10 overflow-hidden bg-[#E9E8E5] border border-[#E5E5E5] group">
                  <img
                    src={activeImage}
                    alt={activeRoom.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Gallery Nav Arrows */}
                  {activeRoom.gallery && activeRoom.gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {activeRoom.gallery && activeRoom.gallery.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {activeRoom.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setActiveImage(img); setGalleryIdx(idx); }}
                        className={`relative w-20 aspect-16/10 shrink-0 border-2 overflow-hidden transition-all ${activeImage === img ? 'border-[#C5B358] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A1A1A] text-white p-4 border border-[#C5B358]/30 text-xs">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B358] flex items-center gap-1">
                    <Users className="w-3 h-3" /> Max Capacity
                  </span>
                  <p className="font-semibold">{activeRoom.maxGuests} Guests</p>
                </div>
                <div className="p-2 space-y-1 border-l border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B358] flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Room Size
                  </span>
                  <p className="font-semibold">{activeRoom.sizeSqFt} sq ft</p>
                </div>
                <div className="p-2 space-y-1 border-l border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B358] flex items-center gap-1">
                    <Bed className="w-3 h-3" /> Bed Configuration
                  </span>
                  <p className="font-semibold line-clamp-1">{activeRoom.bedType}</p>
                </div>
                <div className="p-2 space-y-1 border-l border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B358] flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Horizon View
                  </span>
                  <p className="font-semibold line-clamp-1">{activeRoom.view}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-6 sm:p-8 border border-[#E5E5E5] space-y-4">
                <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">About This Residence</h3>
                <p className="text-sm text-[#5F5E5E] font-light leading-relaxed">
                  {activeRoom.description}
                </p>

                <div className="pt-4 border-t border-[#E5E5E5]">
                  <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-3">
                    Exclusive Inclusions & Privileges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1A1A1A]">
                    {activeRoom.amenities.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-[#FAF9F6] border border-[#E5E5E5]">
                        <CheckCircle2 className="w-4 h-4 text-[#C5B358] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Integrated Booking Panel (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 space-y-6 shadow-md">
                {/* Rate Card Header */}
                <div className="bg-[#1A1A1A] text-white p-5 border-b border-[#C5B358]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C5B358] font-semibold">Reserve Your Stay</span>
                    <h3 className="font-serif text-2xl font-light text-white">{activeRoom.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl text-[#C5B358] font-light">
                      ${activeRoom.pricePerNight.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-[#DBDAD7] uppercase tracking-wider font-sans">/ night + tax</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                      <span>⚠️ Account Required To Reserve</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                      Only registered guests with an active account can complete room bookings. Please sign in or register to proceed.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('register') : openAuthModal('register')}
                      className="w-full mt-1 py-2.5 bg-[#C5B358] hover:bg-[#b09e46] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.15em] rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Register Account / Sign In ➔
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Guest Full Name */}
                  <InputField
                    label="Guest Full Name"
                    name="guestName"
                    placeholder="Enter your full name"
                    register={register('guestName')}
                    error={errors.guestName}
                    required
                  />

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Email Address"
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      register={register('email')}
                      error={errors.email}
                      required
                    />
                    <InputField
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      register={register('phone')}
                      error={errors.phone}
                      required
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker
                      label="Check-in Date"
                      name="checkIn"
                      register={register('checkIn')}
                      error={errors.checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <DatePicker
                      label="Check-out Date"
                      name="checkOut"
                      register={register('checkOut')}
                      error={errors.checkOut}
                      min={watchedCheckIn || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Guests Stepper */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold mb-1">
                      Number of Guests <span className="text-[#C5B358]">*</span>
                    </label>
                    <div className="flex items-center border border-[#E5E5E5] bg-[#FAF9F6]">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="px-4 py-2 text-base font-bold text-[#1A1A1A] hover:bg-[#E5E5E5] transition-colors"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-xs font-semibold text-[#1A1A1A]">
                        {guests} {guests === 1 ? 'Guest' : 'Guests'} (Max {activeRoom.maxGuests})
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(activeRoom.maxGuests, guests + 1))}
                        className="px-4 py-2 text-base font-bold text-[#1A1A1A] hover:bg-[#E5E5E5] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown Box */}
                  <div className="bg-[#FAF9F6] p-4 border border-[#E5E5E5] space-y-2 text-xs text-[#1A1A1A] font-light">
                    <div className="flex justify-between">
                      <span className="text-[#5F5E5E]">${activeRoom.pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                      <span className="font-semibold">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F5E5E]">Estimated Taxes & Fees (10%)</span>
                      <span className="font-semibold">${tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E5E5] pt-2 text-sm font-bold text-[#1A1A1A]">
                      <span>Estimated Total</span>
                      <span className="text-[#C5B358]">${total.toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'PROCESSING RESERVATION...' : 'CONFIRM & BOOK NOW'}
                  </button>

                  <p className="text-[10px] uppercase tracking-wider text-[#888888] text-center font-light flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5B358]" /> Guaranteed Reservation • No Immediate Charge
                  </p>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* BOTTOM SECTION: ALL 25 ROOMS EXPLORER GRID */}
        <section className="pt-20 border-t border-[#E5E5E5] mt-20 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#C5B358] font-semibold">
                ACCOMMODATIONS CATALOG
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
                Explore All 25 Luxury Residences
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.15em] border transition-colors cursor-pointer ${categoryFilter === cat
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold'
                    : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#FAF9F6]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelectDetails={handleSelectRoom}
                onBookNow={(id) => {
                  const found = ROOMS_DATA.find((r) => r.id === id);
                  if (found) handleSelectRoom(found);
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div >
  );
};
