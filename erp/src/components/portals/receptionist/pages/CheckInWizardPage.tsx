import React, { useState } from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { UserCheck, Check, BedDouble, Key, ShieldCheck, Sparkles, AlertCircle, Calendar, ArrowRight, User } from 'lucide-react';

export const CheckInWizardPage: React.FC = () => {
  const { bookings, rooms, updateBookingStatus, showToast } = useHotel();

  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(150);
  const [keyCardIssued, setKeyCardIssued] = useState(true);
  const [idVerified, setIdVerified] = useState(true);

  const pendingCheckIns = bookings.filter(
    (b) =>
      b.status === 'Confirmed' ||
      b.status === 'Pending'
  );

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const handleProcessCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      showToast('Select Reservation', 'Please select a pending reservation from the queue.', 'warning');
      return;
    }

    updateBookingStatus(selectedBooking.id, 'Checked-in');
    showToast(
      'Check-In Successful',
      `Guest ${selectedBooking.guestName} successfully checked into Room #${selectedBooking.roomNumber}!`,
      'success'
    );
    setSelectedBookingId('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold tracking-widest uppercase border border-emerald-500/30">
              <UserCheck className="w-3.5 h-3.5" /> Front Desk Check-In Desk
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Guest Check-In Wizard</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Process guest arrivals, verify contact details, collect security deposits, and program room keycards
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">Arrivals Queue</span>
            <span className="text-2xl font-black text-emerald-400">{pendingCheckIns.length} Guests</span>
          </div>
        </div>
      </div>

      {/* Workflow Step Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-2xl border transition-all ${selectedBookingId ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${selectedBookingId ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              1
            </div>
            <div>
              <h4 className="font-bold text-xs">Select Reservation</h4>
              <p className="text-[10px] text-slate-500">Pick guest from queue</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${selectedBookingId ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950' : 'bg-white border-slate-200 text-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${selectedBookingId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              2
            </div>
            <div>
              <h4 className="font-bold text-xs">Room & Verification</h4>
              <p className="text-[10px] text-slate-500">Review room assignment</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${selectedBookingId ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-white border-slate-200 text-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${selectedBookingId ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              3
            </div>
            <div>
              <h4 className="font-bold text-xs">Deposit & Keycard</h4>
              <p className="text-[10px] text-slate-500">Issue key & complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleProcessCheckIn} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <label className="block text-slate-900 font-bold text-xs uppercase tracking-wider mb-2">
              Select Arriving Guest Reservation *
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer shadow-xs"
            >
              <option value="">-- Select Guest Reservation from Queue --</option>
              {pendingCheckIns.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingCode || 'BK-2026'} • {b.guestName} (Room #{b.roomNumber} - {b.roomType})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Booking Details Card */}
          {selectedBooking ? (
            <div className="p-6 rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-lg flex items-center justify-center">
                    {(selectedBooking.guestName || 'G').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg">{selectedBooking.guestName || 'Guest'}</h3>
                    <p className="text-xs text-slate-300 font-mono">{selectedBooking.guestEmail} • {selectedBooking.guestPhone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    Room #{selectedBooking.roomNumber}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1 font-medium">{selectedBooking.roomType}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Stay Dates</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedBooking.checkInDate} → {selectedBooking.checkOutDate}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                  <span className="font-bold text-amber-400 mt-0.5 block">{selectedBooking.nights} Night(s) Stay</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Room Price</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">${selectedBooking.totalAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Please select a reservation above to proceed with guest check-in</p>
            </div>
          )}
        </div>

        {/* Security Deposit & Keycard Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-slate-900 font-bold text-xs uppercase tracking-wider">
              Refundable Security Deposit ($)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => setDepositAmount(150)}
                className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                $150
              </button>
              <button
                type="button"
                onClick={() => setDepositAmount(200)}
                className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                $200
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-slate-900 font-bold text-xs uppercase tracking-wider">
              Smart RFID Room Keycard
            </label>
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Issue Room Keycard</span>
              </div>
              <input
                type="checkbox"
                checked={keyCardIssued}
                onChange={(e) => setKeyCardIssued(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!selectedBookingId}
            className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-5 h-5" />
            <span>Complete Check-In & Issue Key</span>
          </button>
        </div>
      </form>
    </div>
  );
};
