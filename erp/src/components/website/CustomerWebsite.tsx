import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RoomType } from '../../types';
import {
  Building2, Calendar, User, Mail, Phone, Users, FileText, CheckCircle2,
  Clock, Search, ShieldCheck, Star, BedDouble, ChevronRight, KeyRound, Sparkles, AlertCircle
} from 'lucide-react';

export const CustomerWebsite: React.FC = () => {
  const { rooms, bookings, addBooking, setActivePortal, showToast } = useHotel();

  const [activeNav, setActiveNav] = useState<'home' | 'book' | 'track' | 'rooms'>('home');

  // Booking Form State (Exact 8 fields required)
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    roomType: 'Deluxe' as RoomType,
    adults: 2,
    children: 0,
    specialRequest: ''
  });

  // Submitted Booking Modal / State
  const [submittedBooking, setSubmittedBooking] = useState<{
    code: string;
    guestName: string;
    email: string;
    checkIn: string;
    checkOut: string;
    roomType: RoomType;
    totalAmount: number;
    nights: number;
  } | null>(null);

  // Track Reservation State
  const [trackInput, setTrackInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<any | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Room type definitions with pricing & images
  const roomTypeDetails: Record<
    RoomType,
    { price: number; capacity: string; description: string; features: string[]; image: string }
  > = {
    'Deluxe': {
      price: 150,
      capacity: '2 Adults, 1 Child',
      description: 'Elegant room with king bed, marble bathroom, and city skyline balcony view.',
      features: ['King Bed', 'Free High-Speed Wi-Fi', 'City View', 'Smart TV', 'Complimentary Breakfast'],
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    },
    'Executive': {
      price: 220,
      capacity: '2 Adults, 2 Children',
      description: 'Spacious corner room featuring dedicated workstation, lounge chair, and executive access.',
      features: ['King/Twin Bed', 'Executive Lounge Access', 'Work Desk', 'Nespresso Coffee', 'Mini Bar'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    'Suite': {
      price: 350,
      capacity: '3 Adults, 2 Children',
      description: 'Luxury suite with separate living area, soak tub, dual vanities, and panoramic ocean view.',
      features: ['Separate Living Room', 'Deep Soaking Tub', 'Panoramic Views', '24/7 Butler Service', 'Free Parking'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    },
    'Presidential Suite': {
      price: 650,
      capacity: '4 Adults, 2 Children',
      description: 'Ultra-luxurious multi-room penthouse suite with private jacuzzi, dining room, and grand piano.',
      features: ['Private Jacuzzi', 'Penthouse Level', 'Private Dining Room', 'Chauffeur Service', 'VIP Check-in'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'
    },
    'Standard': {
      price: 100,
      capacity: '2 Adults',
      description: 'Cozy and comfortable modern room perfect for business travelers and brief stays.',
      features: ['Queen Bed', 'Free Wi-Fi', 'Work Desk', 'Rain Shower', 'Daily Housekeeping'],
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
    }
  };

  // Calculate dynamic availability count for each room type from ERP state
  const getAvailabilityCount = (type: RoomType) => {
    return rooms.filter((r) => r.type === type && (r.status || '').toLowerCase() === 'available').length;
  };

  // Calculate stay duration & total price
  const d1 = new Date(formData.checkIn);
  const d2 = new Date(formData.checkOut);
  const diffTime = Math.max(0, d2.getTime() - d1.getTime());
  const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  // eslint-disable-next-line security/detect-object-injection -- reviewed, typed RoomType key
  const roomPrice = roomTypeDetails[formData.roomType]?.price || 150;
  const estimatedTotal = calculatedNights * roomPrice;

  // Submit Booking to ERP
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guestName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast('Validation Error', 'Please complete all required contact information.', 'error');
      return;
    }

    const nextResNum = 1001 + bookings.length;
    const bookingCode = `RES-${nextResNum}`;

    // Dispatch New Reservation to ERP Context with Status = Pending
    addBooking({
      guestId: `web-${Date.now()}`,
      guestName: formData.guestName,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      checkInDate: formData.checkIn,
      checkOutDate: formData.checkOut,
      roomType: formData.roomType,
      adults: Number(formData.adults),
      children: Number(formData.children),
      specialRequests: formData.specialRequest,
      nights: calculatedNights,
      totalAmount: estimatedTotal,
      paidAmount: 0,
      status: 'Pending',
      bookingSource: 'Website',
      roomId: '',
      roomNumber: 'Unassigned'
    });

    setSubmittedBooking({
      code: bookingCode,
      guestName: formData.guestName,
      email: formData.email,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomType: formData.roomType,
      totalAmount: estimatedTotal,
      nights: calculatedNights
    });
  };

  // Track Reservation Logic
  const handleTrackReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackInput.trim().toLowerCase();
    if (!query) return;

    const found = bookings.find(
      (b) =>
        b.bookingCode.toLowerCase() === query ||
        b.guestEmail.toLowerCase() === query ||
        b.guestPhone.includes(query)
    );

    setTrackedResult(found || null);
    setTrackSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Brand & Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveNav('home')}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                GRAND LUXE <span className="text-amber-400 font-serif font-normal italic">Hotel & Suites</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Official Online Booking</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setActiveNav('home')}
              className={`hover:text-amber-400 transition-colors ${activeNav === 'home' ? 'text-amber-400 font-bold' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveNav('rooms')}
              className={`hover:text-amber-400 transition-colors ${activeNav === 'rooms' ? 'text-amber-400 font-bold' : ''}`}
            >
              Rooms & Availability
            </button>
            <button
              onClick={() => setActiveNav('book')}
              className={`hover:text-amber-400 transition-colors ${activeNav === 'book' ? 'text-amber-400 font-bold' : ''}`}
            >
              Book Room
            </button>
            <button
              onClick={() => setActiveNav('track')}
              className={`hover:text-amber-400 transition-colors ${activeNav === 'track' ? 'text-amber-400 font-bold' : ''}`}
            >
              Track Reservation
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveNav('book')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Book Now
            </button>
            <button
              onClick={() => setActivePortal('login')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              title="Switch to Staff ERP Portal"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Staff ERP Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-slate-900 to-slate-950 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Hospitality & Instant Reservation Request
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Experience World-Class Luxury & Unmatched Comfort
          </h2>
          <p className="mt-4 text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-normal">
            Reserve your stay directly online. Select your preferred room type and submit your booking details. Our Reception Desk will confirm your reservation instantly.
          </p>

          {/* Real-Time Available Rooms Bar */}
          <div className="mt-10 max-w-4xl mx-auto bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['Deluxe', 'Executive', 'Suite', 'Presidential Suite', 'Standard'] as RoomType[]).map((type) => {
              const avail = getAvailabilityCount(type);
              return (
                <div key={type} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block truncate">{type}</span>
                  <span className="text-lg font-black text-white block mt-0.5">${roomTypeDetails[type].price}</span>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    avail > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {avail > 0 ? `${avail} Available` : 'Sold Out'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveNav('home')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Overview & Booking
          </button>
          <button
            onClick={() => setActiveNav('rooms')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'rooms'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Room Types
          </button>
          <button
            onClick={() => setActiveNav('track')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'track'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Track Reservation Status
          </button>
        </div>

        {/* SECTION 1: Booking Form & Room Types Overview */}
        {(activeNav === 'home' || activeNav === 'book') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Customer Booking Form (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" /> Direct Online Booking
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">Guest Stay Details</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Fill in the details below. Your reservation request will be created with status <strong className="text-amber-400">Pending</strong> in our ERP system.
                </p>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
                {/* 1. Guest Name */}
                <div>
                  <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" /> Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Khan"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* 2 & 3. Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. abc@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 03001234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* 4 & 5. Check-In & Check-Out */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Check-in Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" /> Check-out Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* 6. Room Type Selection */}
                <div>
                  <label className="text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-amber-400" /> Room Type *
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {getAvailabilityCount(formData.roomType)} Available in ERP
                    </span>
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-semibold cursor-pointer"
                  >
                    {(['Deluxe', 'Executive', 'Suite', 'Presidential Suite', 'Standard'] as RoomType[]).map((type) => (
                      <option key={type} value={type}>
                        {type} — ${roomTypeDetails[type].price}/night ({getAvailabilityCount(type)} available)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Note: Specific room numbers (e.g. Room 203) are assigned by Receptionist upon confirmation.
                  </p>
                </div>

                {/* 7. Adults & Children */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Adults
                    </label>
                    <select
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Children
                    </label>
                    <select
                      value={formData.children}
                      onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                      <option value={3}>3 Children</option>
                    </select>
                  </div>
                </div>

                {/* 8. Special Request (Optional) */}
                <div>
                  <label className="text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. High floor room, late check-in, extra towels..."
                    value={formData.specialRequest}
                    onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Estimated Cost Summary Card */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Estimated Stay Charge</span>
                    <span className="text-xs text-slate-300">
                      {calculatedNights} Night(s) × ${roomPrice}/night ({formData.roomType})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">${estimatedTotal}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Pay at Check-out</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Submit Online Reservation Request
                </button>
              </form>
            </div>

            {/* Selected Room Details & Showcase (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={roomTypeDetails[formData.roomType].image}
                    alt={formData.roomType}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 font-black text-xs">
                    ${roomTypeDetails[formData.roomType].price} / Night
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white font-extrabold text-xs">
                    {formData.roomType}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {roomTypeDetails[formData.roomType].description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Included Amenities</span>
                    <div className="flex flex-wrap gap-1.5">
                      {roomTypeDetails[formData.roomType].features.map((feat, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-[10px] border border-slate-800 font-medium">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Max Occupancy:</span>
                    <span className="text-white font-bold">{roomTypeDetails[formData.roomType].capacity}</span>
                  </div>
                </div>
              </div>

              {/* ERP Workflow Explanation Box */}
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" /> How Online Booking Works in ERP:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Submission creates booking with status <strong className="text-amber-400">Pending</strong> in ERP Reservations.</li>
                  <li>Front Desk Receptionist approves & assigns room (e.g. Room 203).</li>
                  <li>Status changes to <strong className="text-emerald-400">Confirmed</strong> & Folio Invoice is generated.</li>
                  <li>Guest CRM updates stay history & visits count automatically.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Room Types Showcase */}
        {activeNav === 'rooms' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-white">Accommodations & Real-Time Availability</h3>
              <p className="text-xs text-slate-400 mt-1">Browse all room types offered at Grand Luxe Hotel with live inventory counts from our ERP system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(['Deluxe', 'Executive', 'Suite', 'Presidential Suite', 'Standard'] as RoomType[]).map((type) => {
                const details = roomTypeDetails[type];
                const availCount = getAvailabilityCount(type);
                return (
                  <div key={type} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="relative h-44">
                        <img src={details.image} alt={type} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 font-black text-xs border border-amber-500/20">
                          ${details.price} / Night
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-white text-lg">{type}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            availCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {availCount > 0 ? `${availCount} Available` : 'Fully Booked'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">{details.description}</p>

                        <div className="space-y-1">
                          {details.features.slice(0, 3).map((f, i) => (
                            <span key={i} className="block text-[11px] text-slate-300">
                              • {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, roomType: type }));
                          setActiveNav('book');
                        }}
                        className="w-full py-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                      >
                        Select & Book {type}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: Track Reservation */}
        {activeNav === 'track' && (
          <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Track Your Reservation Status</h3>
              <p className="text-xs text-slate-400">
                Enter your Reservation Code (e.g. <strong className="text-amber-400">RES-1001</strong>) or registered email address.
              </p>
            </div>

            <form onSubmit={handleTrackReservation} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter RES-1001 or email@domain.com"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Lookup Status
              </button>
            </form>

            {trackSearched && (
              <div className="pt-4 border-t border-slate-800 animate-in fade-in">
                {trackedResult ? (
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-sm">{trackedResult.bookingCode}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                        trackedResult.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        trackedResult.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        trackedResult.status === 'Checked-in' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {trackedResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold">Guest Name</span>
                        <span className="text-white font-semibold">{trackedResult.guestName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold">Room Type & Allocation</span>
                        <span className="text-white font-semibold">
                          {trackedResult.roomType} ({trackedResult.roomNumber && trackedResult.roomNumber !== 'Unassigned' ? `Room #${trackedResult.roomNumber}` : 'Room Pending Assignment'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold">Dates</span>
                        <span className="text-slate-300">{trackedResult.checkInDate} → {trackedResult.checkOutDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold">Total Estimated Stay</span>
                        <span className="text-amber-400 font-extrabold">${trackedResult.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> No reservation matching "{trackInput}" found in ERP database.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Submitted Reservation Confirmation Modal */}
      {submittedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 block mb-1">
                Website Reservation Transmitted
              </span>
              <h3 className="text-2xl font-black text-white">Booking Request Created!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your online booking has been submitted directly to the Grand Luxe ERP system.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-bold">Reservation Code:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{submittedBooking.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="text-white font-semibold">{submittedBooking.guestName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stay Dates:</span>
                <span className="text-white font-medium">{submittedBooking.checkIn} → {submittedBooking.checkOut} ({submittedBooking.nights} Nights)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Room Type:</span>
                <span className="text-amber-400 font-bold">{submittedBooking.roomType}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-300">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                  Pending Front Desk Approval
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSubmittedBooking(null);
                  setActiveNav('track');
                  setTrackInput(submittedBooking.code);
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Track Status
              </button>
              <button
                onClick={() => {
                  setSubmittedBooking(null);
                  setActivePortal('receptionist');
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                View in Reception ERP Portal <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Grand Luxe Hotel & Resorts. Integrated ERP Online Reservations System.</p>
      </footer>
    </div>
  );
};
