import React, { useState } from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { LogOut, DollarSign, ShieldCheck, Sparkles, Building2, Percent, CheckCircle2, ArrowRight } from 'lucide-react';

export const CheckOutExpressPage: React.FC = () => {
  const { bookings, updateBookingStatus, updateGuestPaymentStatus, showToast, hotelSettings } = useHotel();
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  const currentTaxRate = hotelSettings?.taxRate !== undefined ? hotelSettings.taxRate : 10.0;

  const checkedInBookings = bookings.filter(
    (b) => b.status === 'Checked-in'
  );

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  // Calculate financial components (Room Price + Dynamic Tax, No Security Deposit)
  const roomPrice = selectedBooking ? selectedBooking.totalAmount : 0;
  const tax = Math.round(roomPrice * (currentTaxRate / 100));
  const totalSettlement = roomPrice + tax;

  const handleProcessCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      showToast('Select In-House Guest', 'Please select an in-house guest from the list to check out.', 'warning');
      return;
    }

    // Update payment status on the guest/customer record using the correct guestId
    if (selectedBooking.guestId) {
      updateGuestPaymentStatus(selectedBooking.guestId, 'Paid');
    }
    // Release room and update reservation status to Checked-out
    // Backend will auto-create payment record and release room to Available
    updateBookingStatus(selectedBooking.id, 'Checked-out');

    showToast(
      'Express Check-Out Complete',
      `Guest ${selectedBooking.guestName} successfully checked out of Room #${selectedBooking.roomNumber}. Room is now Available!`,
      'success'
    );
    setSelectedBookingId('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold tracking-widest uppercase border border-amber-500/30">
              <LogOut className="w-3.5 h-3.5" /> Express Departure Terminal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Guest Express Check-Out</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Process guest departures, settle remaining folios, return security deposits, and release room to available inventory
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">In-House Departing</span>
            <span className="text-2xl font-black text-amber-400">{checkedInBookings.length} Guests</span>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleProcessCheckOut} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <label className="block text-slate-900 font-bold text-xs uppercase tracking-wider mb-2">
              Select In-House Departing Guest *
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer shadow-xs"
            >
              <option value="">-- Select Departing In-House Guest --</option>
              {checkedInBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Room #{b.roomNumber} • {b.guestName} ({b.bookingCode || 'BK-2026'})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Guest Folio Card */}
          {selectedBooking ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-black text-white text-lg">{selectedBooking.guestName}</h3>
                  <p className="text-xs text-slate-300 font-mono">{selectedBooking.guestEmail} • {selectedBooking.guestPhone}</p>
                </div>

                <div className="text-right">
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                    Room #{selectedBooking.roomNumber}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1 font-medium">{selectedBooking.roomType}</span>
                </div>
              </div>

              {/* Itemized Charge Breakdown */}
              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>Base Room Stay Price ({selectedBooking.nights} Nights)</span>
                  </div>
                  <span className="font-bold text-white">${roomPrice}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-400" />
                    <span>Taxes & Service VAT ({currentTaxRate}%)</span>
                  </div>
                  <span className="font-bold text-blue-400">${tax}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 mt-3">
                  <span className="font-black text-white text-sm">Total Settlement Amount</span>
                  <span className="font-black text-amber-300 text-lg">${totalSettlement}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <LogOut className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Please select an in-house guest above to review stay folio and process check-out</p>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!selectedBookingId}
            className="w-full md:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Process Check-Out & Release Room</span>
          </button>
        </div>
      </form>
    </div>
  );
};
