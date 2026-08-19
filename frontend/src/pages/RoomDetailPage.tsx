import React, { useState } from 'react';
import { ROOMS_DATA } from '../data/roomsData';
import { useBooking } from '../contexts/BookingContext';
import {
  Users, Maximize2, Bed, Eye, CheckCircle2, ArrowLeft,
  ChevronLeft, ChevronRight, Star, Calendar, UserCheck, Sparkles, Terminal, RefreshCw
} from 'lucide-react';
import { FadeInUp } from '../components/common/FadeInUp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../utils/validationSchemas';
import { BookingFormData } from '../types';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { InputField } from '../components/forms/InputField';
import { DatePicker } from '../components/forms/DatePicker';

interface RoomDetailPageProps {
  roomId: string;
  onNavigate: (page: string, roomId?: string) => void;
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({ roomId, onNavigate }) => {
  const room = ROOMS_DATA.find((r) => r.id === roomId) || ROOMS_DATA[0];
  const [activeImage, setActiveImage] = useState(room.image);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [guests, setGuests] = useState(2);

  const {
    checkIn,
    checkOut,
    setCheckIn,
    setCheckOut,
    setIsErpViewerOpen
  } = useBooking();

  const { submit, isLoading, response, reset: resetSubmit } = useFormSubmit('/api/erp/bookings');

  const {
    register,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: '',
      email: '',
      phone: '',
      checkIn: checkIn || '',
      checkOut: checkOut || ''
    }
  });

  const watchedCheckIn = watch('checkIn') || checkIn;
  const watchedCheckOut = watch('checkOut') || checkOut;

  const getNights = () => {
    if (!watchedCheckIn || !watchedCheckOut) return 1;
    const diff = new Date(watchedCheckOut).getTime() - new Date(watchedCheckIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const nights = getNights();
  const total = room.pricePerNight * nights;

  const prevImage = () => {
    const newIdx = (galleryIndex - 1 + room.gallery.length) % room.gallery.length;
    setGalleryIndex(newIdx);
    // eslint-disable-next-line security/detect-object-injection -- reviewed, bound gallery index
    setActiveImage(room.gallery[newIdx] || room.image);
  };

  const nextImage = () => {
    const newIdx = (galleryIndex + 1) % room.gallery.length;
    setGalleryIndex(newIdx);
    // eslint-disable-next-line security/detect-object-injection -- reviewed, bound gallery index
    setActiveImage(room.gallery[newIdx] || room.image);
  };

  const onSubmit = async (data: BookingFormData) => {
    setCheckIn(data.checkIn);
    setCheckOut(data.checkOut);

    const payload = {
      guestName: data.guestName,
      email: data.email,
      phone: data.phone,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests,
      roomId: room.id,
      roomName: room.name,
      totalNights: nights,
      totalPrice: total,
      timestamp: new Date().toISOString()
    };

    await submit(payload as unknown as Record<string, unknown>);
  };

  const handleReset = () => {
    resetSubmit();
    resetForm();
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen">
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button
          onClick={() => onNavigate('rooms')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5F5E5E] hover:text-[#1A1A1A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to All Rooms
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16">

          {/* LEFT: Room Info */}
          <div className="xl:col-span-7 space-y-10">

            {/* Room Header */}
            <FadeInUp className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] text-[#C5B358] text-[10px] uppercase tracking-[0.25em] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {room.category}
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5B358] text-[#C5B358]" />
                  ))}
                </div>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1A1A] leading-tight">
                {room.name}
              </h1>
              <p className="text-[#5F5E5E] font-light text-base leading-relaxed max-w-xl">
                {room.tagline}
              </p>
            </FadeInUp>

            {/* Main Image Gallery */}
            <FadeInUp delay={0.1}>
              <div className="relative aspect-16/10 overflow-hidden bg-[#E9E8E5] group">
                <img
                  src={activeImage}
                  alt={room.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />

                {room.gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-[#1A1A1A]" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] uppercase tracking-wider px-3 py-1.5">
                  {galleryIndex + 1} / {room.gallery.length}
                </div>
              </div>

              {room.gallery.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {room.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setGalleryIndex(i); setActiveImage(img); }}
                      className={`shrink-0 w-20 h-14 overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img ? 'border-[#C5B358] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </FadeInUp>

            {/* Quick Specs Bar */}
            <FadeInUp delay={0.15}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-[#1A1A1A] divide-x divide-white/10">
                {[
                  { icon: <Users className="w-5 h-5 text-[#C5B358]" />, label: 'Max Guests', value: `${room.maxGuests} Guests` },
                  { icon: <Maximize2 className="w-5 h-5 text-[#C5B358]" />, label: 'Room Size', value: `${room.sizeSqFt} Sq Ft` },
                  { icon: <Bed className="w-5 h-5 text-[#C5B358]" />, label: 'Bed Type', value: room.bedType.split(' ').slice(0, 3).join(' ') },
                  { icon: <Eye className="w-5 h-5 text-[#C5B358]" />, label: 'View', value: room.view.split(' ').slice(0, 3).join(' ') },
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-3 p-5">
                    {spec.icon}
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">{spec.label}</p>
                      <p className="text-white text-sm font-medium truncate">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>

            {/* Description */}
            <FadeInUp delay={0.2} className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">About This Residence</h2>
              <p className="text-[#5F5E5E] font-light text-sm leading-relaxed">
                {room.description}
              </p>
            </FadeInUp>

            {/* Amenities */}
            <FadeInUp delay={0.25} className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">Exclusive Inclusions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-[#E5E5E5] hover:border-[#C5B358] transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#C5B358] shrink-0" />
                    <span className="text-xs text-[#1A1A1A] font-light leading-snug">{amenity}</span>
                  </div>
                ))}
              </div>
            </FadeInUp>
          </div>

          {/* RIGHT: Booking Panel */}
          <div className="xl:col-span-5">
            <FadeInUp delay={0.1} className="sticky top-32">
              {response ? (
                <div className="bg-white border border-[#E5E5E5] p-8 space-y-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-[#1A1A1A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#C5B358]" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#C5B358] font-semibold">Reservation Confirmed</span>
                    <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">We Look Forward to Your Arrival</h3>
                    <div className="inline-block bg-[#FAF9F6] px-4 py-2 border border-[#E5E5E5] font-mono text-xs text-[#1A1A1A]">
                      Ref: <span className="text-[#C5B358] font-bold">{response.bookingReference}</span>
                    </div>
                  </div>
                  <div className="bg-[#FAF9F6] p-5 border border-[#E5E5E5] text-left text-xs space-y-3 font-light">
                    {[
                      { label: 'Room', value: room.name },
                      { label: 'Check-In', value: watchedCheckIn },
                      { label: 'Check-Out', value: watchedCheckOut },
                      { label: 'Guests', value: `${guests}` },
                      { label: 'Status', value: 'Guaranteed & ERP Synced', green: true },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between ${i < 4 ? 'border-b border-[#E5E5E5] pb-2' : ''}`}>
                        <span className="text-[#5F5E5E]">{row.label}:</span>
                        <span className={`font-semibold ${row.green ? 'text-emerald-700' : 'text-[#1A1A1A]'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setIsErpViewerOpen(true)}
                      className="w-full py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors cursor-pointer"
                    >
                      <Terminal className="w-4 h-4 text-[#C5B358]" /> Inspect ERP Payload
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> New Reservation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-sm">
                  {/* Panel Header */}
                  <div className="bg-[#1A1A1A] p-6 space-y-1">
                    <p className="text-[#C5B358] text-[10px] uppercase tracking-[0.3em] font-semibold">Reserve Your Stay</p>
                    <h3 className="font-serif text-2xl font-light text-white">{room.name}</h3>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="font-serif text-2xl text-white">${room.pricePerNight.toLocaleString()}</span>
                      <span className="text-neutral-400 text-xs">/ night + tax</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <InputField
                      label="Guest Name"
                      name="guestName"
                      placeholder="Your full name"
                      register={register('guestName')}
                      error={errors.guestName}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        register={register('email')}
                        error={errors.email}
                        required
                      />
                      <InputField
                        label="Phone"
                        type="tel"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        register={register('phone')}
                        error={errors.phone}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DatePicker
                        label="Check-in"
                        name="checkIn"
                        register={register('checkIn')}
                        error={errors.checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <DatePicker
                        label="Check-out"
                        name="checkOut"
                        register={register('checkOut')}
                        error={errors.checkOut}
                        min={watchedCheckIn || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Number of Guests Stepper */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#C5B358]" />
                        Number of Guests <span className="text-[#C5B358]">*</span>
                      </label>
                      <div className="flex items-center border border-[#E5E5E5]">
                        <button
                          type="button"
                          onClick={() => setGuests(g => Math.max(1, g - 1))}
                          className="w-11 h-11 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors border-r border-[#E5E5E5] cursor-pointer text-lg font-light"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-sm font-medium text-[#1A1A1A] py-2.5">
                          {guests} {guests === 1 ? 'Guest' : 'Guests'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests(g => Math.min(room.maxGuests, g + 1))}
                          className="w-11 h-11 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors border-l border-[#E5E5E5] cursor-pointer text-lg font-light"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[10px] text-[#5F5E5E]">Max {room.maxGuests} guests for this room</p>
                    </div>

                    {/* Live Price Summary */}
                    {watchedCheckIn && watchedCheckOut && (
                      <div className="bg-[#FAF9F6] border border-[#E5E5E5] p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-[#5F5E5E]">
                          <span>${room.pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                          <span className="text-[#1A1A1A] font-medium">${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[#5F5E5E]">
                          <span>Taxes & Fees (est.)</span>
                          <span className="text-[#1A1A1A] font-medium">${Math.round(total * 0.12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-[#1A1A1A] border-t border-[#E5E5E5] pt-2 mt-1">
                          <span className="uppercase tracking-wider text-[10px]">Estimated Total</span>
                          <span className="font-serif text-base">${Math.round(total * 1.12).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C5B358]" />
                        Special Requests
                        <span className="text-[#5F5E5E] font-normal normal-case tracking-normal ml-1">(optional)</span>
                      </label>
                      <textarea
                        {...register('specialRequests')}
                        placeholder="Dietary requirements, room preferences, special occasions…"
                        rows={3}
                        className="w-full border border-[#E5E5E5] bg-[#FAF9F6] text-sm text-[#1A1A1A] px-3 py-2.5 outline-none focus:border-[#1A1A1A] transition-colors resize-none font-light placeholder:text-[#AAAAAA]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#C5B358] hover:text-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Processing…' : 'Book Now'}
                    </button>
                    <p className="text-[10px] uppercase tracking-widest text-[#AAAAAA] text-center">
                      Free cancellation · No credit card required upfront
                    </p>
                  </form>
                </div>
              )}
            </FadeInUp>
          </div>
        </div>

        {/* Other Rooms */}
        <FadeInUp delay={0.3} className="mt-20 pt-12 border-t border-[#E5E5E5] space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#5F5E5E] font-medium">Explore More</span>
            <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">Other Residences</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ROOMS_DATA.filter(r => r.id !== roomId).slice(0, 3).map(r => (
              <div
                key={r.id}
                onClick={() => { onNavigate('room-detail', r.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group cursor-pointer border border-[#E5E5E5] hover:border-[#1A1A1A] transition-all"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#C5B358] font-semibold">{r.category}</p>
                  <h4 className="font-serif text-lg font-light text-[#1A1A1A] group-hover:text-[#C5B358] transition-colors">{r.name}</h4>
                  <p className="text-xs text-[#5F5E5E]">From ${r.pricePerNight.toLocaleString()} / night</p>
                </div>
              </div>
            ))}
          </div>
        </FadeInUp>
      </div>
    </div>
  );
};
