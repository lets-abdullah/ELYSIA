import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Building2,
  Percent
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const BillingModule: React.FC = () => {
  const { bookings, updateGuestPaymentStatus, hotelSettings } = useHotel();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const currentTaxRate = hotelSettings?.taxRate !== undefined ? hotelSettings.taxRate : 10.0;

  // Calculate Finance Records from active bookings (Room Price + Dynamic Tax, No Security Charges)
  const financeRecords = (bookings || []).map((bk) => {
    const total = bk.totalAmount || 0;
    // Calculate nights dynamically from check-in/check-out dates
    const nights = bk.nights || (bk.checkInDate && bk.checkOutDate
      ? Math.max(1, Math.ceil((new Date(bk.checkOutDate).getTime() - new Date(bk.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1);

    // Calculate dynamic tax and base room price based on settings
    const baseRoomPrice = bk.pricePerNight
      ? (bk.pricePerNight * nights)
      : (total > 0 ? Math.round(total / (1 + currentTaxRate / 100)) : 0);
    const tax = Math.round(baseRoomPrice * (currentTaxRate / 100));
    const totalAmount = baseRoomPrice + tax;

    const isPaid = (bk.paymentStatus === 'Paid' || (bk.paidAmount !== undefined && bk.paidAmount >= total && total > 0)) && bk.status !== 'Pending';

    return {
      id: bk.id,
      guestId: bk.guestId,
      bookingCode: bk.bookingCode || `BK-${bk.id.slice(-6).toUpperCase()}`,
      guestName: bk.guestName,
      guestPhone: bk.guestPhone,
      guestEmail: bk.guestEmail,
      roomNumber: bk.roomNumber || '101',
      roomType: bk.roomType || 'Hotel Bedroom',
      nights,
      checkInDate: bk.checkInDate,
      checkOutDate: bk.checkOutDate,
      baseRoomPrice,
      tax,
      totalAmount,
      paidAmount: isPaid ? totalAmount : (bk.paidAmount || 0),
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      createdAt: bk.createdAt
    };
  });

  // Filter records
  const filteredRecords = financeRecords.filter((rec) => {
    const matchesSearch =
      rec.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      rec.guestName.toLowerCase().includes(search.toLowerCase()) ||
      rec.roomNumber.includes(search);

    const matchesStatus = statusFilter === 'All' || rec.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Finance Summary Calculations
  const paidRecords = financeRecords.filter((r) => r.paymentStatus === 'Paid');
  const totalBaseRoomRevenue = paidRecords.reduce((sum, r) => sum + r.baseRoomPrice, 0);
  const totalTaxCollected = paidRecords.reduce((sum, r) => sum + r.tax, 0);
  const grandTotalRevenue = paidRecords.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Finance & Revenue Section ({financeRecords.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live calculations for Room Stay Price, Tax ({currentTaxRate}%), and Total Settled Revenue</p>
          </div>
        </div>
      </div>

      {/* Finance KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Room Price</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">${totalBaseRoomRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Nights stay revenue</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxes Collected ({currentTaxRate}%)</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5 block">${totalTaxCollected.toFixed(2)}</span>
            <span className="text-[10px] text-blue-500 mt-0.5 block">Configured in ERP Settings</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block">${grandTotalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-500 mt-0.5 block">Room Price + Taxes</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, guest, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Payment Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Finance Table - Perfectly Aligned & No Horizontal Scrollbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-3 py-3">Booking & Guest</th>
                <th className="px-3 py-3">Room & Stay</th>
                <th className="px-3 py-3 text-right">Room Price</th>
                <th className="px-3 py-3 text-right">Tax ({currentTaxRate}%)</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No financial records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-indigo-600 text-xs">{rec.bookingCode}</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{rec.guestName}</div>
                      <div className="text-[10px] text-slate-400">{rec.guestPhone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-mono font-bold border border-indigo-200 inline-block text-[10px]">
                        Room #{rec.roomNumber}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{rec.nights} Night(s)</div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800 text-right">${rec.baseRoomPrice}</td>
                    <td className="px-3 py-3 font-semibold text-blue-700 text-right">${rec.tax}</td>
                    <td className="px-3 py-3 font-black text-slate-900 text-sm text-right">${rec.totalAmount}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => updateGuestPaymentStatus(rec.guestId || rec.id, rec.paymentStatus === 'Paid' ? 'Pending' : 'Paid')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all shadow-xs ${rec.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                      >
                        {rec.paymentStatus === 'Paid' ? 'PAID' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
