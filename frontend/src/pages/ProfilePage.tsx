import React from 'react';
import { User, Mail, Phone, Calendar, Clock, CheckCircle2, AlertCircle, LogOut, ArrowRight, ShieldCheck, BedDouble, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onNavigate: (page: string, roomId?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, userReservations, logout, isAuthenticated } = useAuth();
  const reservations = userReservations || [];

  // If not authenticated, prompt sign in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#FAF9F6] text-[#1A1A1A] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] p-8 sm:p-12 text-center rounded-2xl shadow-xl space-y-6">
          <div className="w-16 h-16 bg-[#F8F5EB] border border-[#C5B358]/40 text-[#8C7A28] flex items-center justify-center mx-auto rounded-2xl">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">Sign In Required</h2>
            <p className="text-xs text-stone-600 font-light">
              Please sign in to access your personal profile and view your room reservation details.
            </p>
          </div>
          <button
            onClick={() => onNavigate('auth')}
            className="w-full py-3.5 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FAF9F6] text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Warning Banner if flagged */}
        {user.warning_message && (
          <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-5 sm:p-6 shadow-md flex items-start gap-4 animate-fade-in">
            <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-red-900 text-sm sm:text-base">
                Security Alert: Spam or Fake Activity Detected
              </h3>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                {user.warning_message}
              </p>
            </div>
          </div>
        )}

        {/* Guest Profile Banner Card — Light Theme */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F8F5EB] border-2 border-[#C5B358]/50 text-[#8C7A28] flex items-center justify-center rounded-2xl text-2xl sm:text-3xl font-serif font-bold shadow-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">{user.name}</h1>
                <span className="px-3 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] uppercase tracking-wider font-extrabold rounded-full">
                  Verified Guest
                </span>
              </div>
              <p className="text-xs text-stone-600 flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#C5B358]" /> {user.email}
              </p>
              {user.phone && (
                <p className="text-xs text-stone-600 flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#C5B358]" /> {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('rooms')}
              className="px-5 py-2.5 bg-[#FAF9F6] border border-stone-300 text-stone-800 hover:bg-stone-100 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Book New Stay
            </button>
            <button
              onClick={() => { logout(); onNavigate('home'); }}
              className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#C5B358] font-bold block">
                Stay History
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                My Room Reservations
              </h2>
            </div>
            <span className="px-3 py-1 bg-white border border-stone-200 text-stone-700 font-mono text-xs font-bold rounded-xl shadow-xs">
              {reservations.length} {reservations.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          {reservations.length === 0 ? (
            /* Empty State Card */
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-[#F8F5EB] border border-[#C5B358]/40 text-[#8C7A28] flex items-center justify-center mx-auto rounded-2xl">
                <BedDouble className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">No Active Room Reservations</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto font-light">
                You currently have no room reservations linked to your account. Explore our luxury suites and reserve your stay.
              </p>
              <button
                onClick={() => onNavigate('rooms')}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors rounded-xl cursor-pointer shadow-md"
              >
                <span>Explore Luxury Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Reservation List Grid */
            <div className="space-y-5">
              {reservations.map((res) => {
                const isConfirmed = res.bookingStatus === 'confirmed' || res.bookingStatus === 'Confirmed';
                const isPending = res.bookingStatus === 'pending' || res.bookingStatus === 'Pending';

                return (
                  <div
                    key={res.id}
                    className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                  >
                    {/* Room Thumbnail */}
                    <div className="md:col-span-4 h-48 md:h-36 rounded-2xl overflow-hidden relative border border-stone-200">
                      <img
                        src={res.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                        alt={res.roomName || 'Luxury Room'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#C5B358] font-bold border border-[#C5B358]/40 rounded-lg">
                        Ref: {res.bookingCode}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#C5B358] font-bold block">
                            {res.roomType || 'Deluxe Suite'}
                          </span>
                          <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                            {res.roomName || `Room #${res.roomNumber}`}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-extrabold rounded-xl">
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold rounded-xl">
                            {res.bookingStatus}
                          </span>
                        )}
                      </div>

                      {/* Info Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-semibold">Check-In</span>
                          <span className="font-semibold text-stone-900 font-mono block mt-0.5">
                            {new Date(res.checkInDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-semibold">Check-Out</span>
                          <span className="font-semibold text-stone-900 font-mono block mt-0.5">
                            {new Date(res.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-semibold">Duration</span>
                          <span className="font-semibold text-stone-900 block mt-0.5">
                            {res.nights || 1} Night(s) • {res.guests || 2} Guests
                          </span>
                        </div>

                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-semibold">Total Price</span>
                          <span className="font-bold text-[#8C7A28] text-sm block mt-0.5">
                            ${parseFloat(String(res.totalAmount)).toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      {isPending && (
                        <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Our reception desk is reviewing your reservation request. You will be notified once confirmed.</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
