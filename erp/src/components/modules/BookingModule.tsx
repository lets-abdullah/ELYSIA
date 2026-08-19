import React, { useState } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Bed,
  User,
  DollarSign,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Booking, BookingStatus, Room } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const BookingModule: React.FC<{
  isOpenAddModalExternal?: boolean;
  onCloseExternalModal?: () => void;
}> = ({ isOpenAddModalExternal, onCloseExternalModal }) => {
  const {
    currentUser,
    bookings,
    rooms,
    guests,
    hotelSettings,
    addBooking,
    assignRoomToBooking,
    updateBookingStatus,
    deleteBooking,
    showToast
  } = useHotel();

  const userRoleLower = (currentUser?.role || '').toLowerCase();
  const canCancelOrDelete = userRoleLower === 'admin' || userRoleLower === 'manager';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Assign Room Modal State
  const [assignRoomBooking, setAssignRoomBooking] = useState<Booking | null>(null);
  const [selectedRoomIdToAssign, setSelectedRoomIdToAssign] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    guestId: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    paidAmount: 0,
    status: 'Confirmed' as BookingStatus,
    specialRequests: ''
  });

  // Support external add trigger
  React.useEffect(() => {
    if (isOpenAddModalExternal) {
      handleOpenAddModal();
    }
  }, [isOpenAddModalExternal]);

  const handleOpenAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const next2Days = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    const firstGuest = guests[0];
    const firstAvailRoom = rooms.find((r) => r.status === 'Available') || rooms[0];

    setFormData({
      guestId: firstGuest ? firstGuest.id : '',
      guestName: firstGuest ? firstGuest.fullName : '',
      guestPhone: firstGuest ? firstGuest.phone : '',
      guestEmail: firstGuest ? firstGuest.email : '',
      roomId: firstAvailRoom ? firstAvailRoom.id : '',
      checkInDate: today,
      checkOutDate: next2Days,
      paidAmount: 0,
      status: 'Confirmed',
      specialRequests: ''
    });
    setIsModalOpen(true);
  };

  // Calculate nights & total price dynamically (Room Base Price * Nights + Dynamic Tax)
  const currentTaxRate = hotelSettings?.taxRate !== undefined ? hotelSettings.taxRate : 10.0;
  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const d1 = new Date(formData.checkInDate);
  const d2 = new Date(formData.checkOutDate);
  const diffTime = Math.max(0, d2.getTime() - d1.getTime());
  const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const roomPricePerNight = selectedRoom ? selectedRoom.price : 200;
  const calculatedBasePrice = roomPricePerNight * calculatedNights;
  const calculatedTax = Math.round(calculatedBasePrice * (currentTaxRate / 100));
  const calculatedTotal = calculatedBasePrice + calculatedTax;

  const handleSelectGuest = (guestId: string) => {
    const g = guests.find((x) => x.id === guestId);
    if (g) {
      setFormData((prev) => ({
        ...prev,
        guestId: g.id,
        guestName: g.fullName,
        guestPhone: g.phone,
        guestEmail: g.email
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName || !formData.roomId) {
      showToast('Validation Error', 'Please select a valid guest and assigned room.', 'error');
      return;
    }

    if (!selectedRoom) return;

    addBooking({
      guestId: formData.guestId || `gst-${Date.now()}`,
      guestName: formData.guestName,
      guestPhone: formData.guestPhone,
      guestEmail: formData.guestEmail,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.type,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      nights: calculatedNights,
      totalAmount: calculatedTotal,
      paidAmount: Number(formData.paidAmount),
      status: formData.status,
      specialRequests: formData.specialRequests
    });

    setIsModalOpen(false);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.roomNumber.includes(search);

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Checked-in':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/40 font-black';
      case 'Checked-out':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const checkedInCount = bookings.filter((b) => b.status === 'Checked-in').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Reservations & Check-In Desk ({bookings.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage stay periods, review pending web bookings, perform check-ins, and room allocations</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" /> Create Reservation
        </button>
      </div>

      {/* Pending Approval Banner Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl font-bold shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                {pendingCount} Reservation(s) Awaiting Approval
              </h4>
              <p className="text-xs text-amber-800">
                New room bookings have been placed by customers. Authorized staff (Receptionist/Manager/Admin) can review and approve them below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
          >
            Show Pending ({pendingCount})
          </button>
        </div>
      )}

      {/* Reservation Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{bookings.length} Bookings</span>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-xl font-black text-amber-600 mt-0.5 block">{pendingCount} Pending</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">{confirmedCount} Confirmed</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In-House Guests</span>
            <span className="text-xl font-black text-indigo-600 mt-0.5 block">{checkedInCount} Checked-in</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, guest, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-3 py-3">Code & Source</th>
                <th className="px-3 py-3">Guest Info</th>
                <th className="px-3 py-3">Room & Type</th>
                <th className="px-3 py-3">Stay Dates</th>
                <th className="px-3 py-3 text-right">Total / Paid</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-slate-900">{bk.bookingCode}</span>
                        {bk.bookingSource === 'Website' ? (
                          <span className="px-1 py-0.5 rounded bg-sky-100 text-sky-800 text-[8px] font-extrabold border border-sky-200">
                            Web
                          </span>
                        ) : (
                          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] font-medium border border-slate-200">
                            Desk
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{bk.createdAt}</span>
                    </td>
                    <td className="px-3 py-3">
                      <h4 className="font-bold text-slate-900">{bk.guestName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{bk.guestPhone}</p>
                    </td>
                    <td className="px-3 py-3">
                      {bk.roomNumber && bk.roomNumber !== 'Unassigned' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200 inline-block text-[10px]">
                          Room #{bk.roomNumber}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setAssignRoomBooking(bk);
                            const matchingAvail = rooms.find(
                              (r) => r.type === bk.roomType && r.status === 'Available'
                            );
                            setSelectedRoomIdToAssign(matchingAvail ? matchingAvail.id : '');
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Bed className="w-3 h-3" /> Assign Room
                        </button>
                      )}
                      <span className="block text-[10px] text-slate-500 mt-0.5">{bk.roomType}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800 text-[11px]">
                        {bk.checkInDate} → {bk.checkOutDate}
                      </div>
                      <div className="text-[10px] text-amber-600 font-semibold mt-0.5">{bk.nights} Night(s)</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="font-bold text-slate-900">${bk.totalAmount}</div>
                      <div className="text-[10px] text-slate-500">Paid: ${bk.paidAmount}</div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={bk.status}
                        onChange={(e) => updateBookingStatus(bk.id, e.target.value as BookingStatus)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border cursor-pointer ${getStatusBadge(
                          bk.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Checked-out">Checked-out</option>
                        {canCancelOrDelete && <option value="Cancelled">Cancelled</option>}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bk.status === 'Pending' && (
                          <button
                            onClick={() => updateBookingStatus(bk.id, 'Confirmed')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                            title="Approve Reservation"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingForVoucher(bk)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                          title="View Voucher"
                        >
                          <FileText className="w-3 h-3" /> Voucher
                        </button>
                        {canCancelOrDelete && (
                          <button
                            onClick={() => setDeleteTargetId(bk.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete Reservation (Admin / Manager only)"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onCloseExternalModal) onCloseExternalModal();
        }}
        title="Create New Reservation"
        subtitle="Enter guest details and stay dates"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Guest Name *</label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Check-in Date *</label>
              <input
                type="date"
                required
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Check-out Date *</label>
              <input
                type="date"
                required
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Select Room *</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} ({r.type} - ${r.price}/night)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookingStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Checked-in">Checked-in</option>
              </select>
            </div>
          </div>

          {/* Simple Rate Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Stay: <strong>{calculatedNights} Night(s)</strong> (${roomPricePerNight}/night)</span>
              <span>${calculatedBasePrice}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax ({currentTaxRate}%)</span>
              <span>${calculatedTax}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1">
              <span>Grand Total</span>
              <span className="text-emerald-600">${calculatedTotal}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Advance Deposit Paid ($)</label>
            <input
              type="number"
              min="0"
              max={calculatedTotal}
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                if (onCloseExternalModal) onCloseExternalModal();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer"
            >
              Save Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* Reservation Voucher View Modal */}
      {selectedBookingForVoucher && (
        <Modal
          isOpen={!!selectedBookingForVoucher}
          onClose={() => setSelectedBookingForVoucher(null)}
          title={`Reservation Voucher #${selectedBookingForVoucher.bookingCode}`}
          subtitle="Official Grand Luxe Hotel guest reservation summary"
        >
          <div className="space-y-6 text-xs p-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold font-serif text-slate-900">GRAND LUXE HOTEL & RESORT</h2>
                <p className="text-[11px] text-slate-500">100 Luxury Boulevard, Grand Bay</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {selectedBookingForVoucher.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Guest Name</span>
                <p className="text-sm font-bold text-slate-900">{selectedBookingForVoucher.guestName}</p>
                <p className="text-slate-500 mt-0.5">{selectedBookingForVoucher.guestPhone}</p>
                <p className="text-slate-500">{selectedBookingForVoucher.guestEmail}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Stay Allocation</span>
                <p className="text-sm font-bold text-amber-600">Room #{selectedBookingForVoucher.roomNumber}</p>
                <p className="text-slate-600 font-medium">{selectedBookingForVoucher.roomType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase">Check-in</span>
                <p className="text-sm font-bold text-slate-900">{selectedBookingForVoucher.checkInDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase">Check-out</span>
                <p className="text-sm font-bold text-slate-900">{selectedBookingForVoucher.checkOutDate}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Total Folio Charge</span>
                <p className="text-lg font-bold">${selectedBookingForVoucher.totalAmount}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Deposit Paid</span>
                <p className="text-lg font-bold text-emerald-400">${selectedBookingForVoucher.paidAmount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </button>
              <button
                onClick={() => setSelectedBookingForVoucher(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteBooking(deleteTargetId);
        }}
        title="Cancel & Remove Reservation"
        message="Are you sure you want to permanently remove this booking record? The room will be released if currently occupied or reserved."
      />

      {/* Assign Room Modal */}
      {assignRoomBooking && (
        <Modal
          isOpen={!!assignRoomBooking}
          onClose={() => setAssignRoomBooking(null)}
          title={`Assign Room for ${assignRoomBooking.guestName} (${assignRoomBooking.bookingCode})`}
        >
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between font-medium">
                <span>Requested Room Type:</span>
                <span className="font-bold text-slate-900">{assignRoomBooking.roomType}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Booking Source:</span>
                <span className="font-bold text-amber-600">{assignRoomBooking.bookingSource || 'Website'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Dates:</span>
                <span>{assignRoomBooking.checkInDate} → {assignRoomBooking.checkOutDate}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-2">
                Select Available Room to Assign:
              </label>
              <select
                value={selectedRoomIdToAssign}
                onChange={(e) => setSelectedRoomIdToAssign(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose Room --</option>
                {rooms
                  .filter((r) => r.status === 'Available')
                  .map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      Room #{rm.number} — {rm.type} (${rm.pricePerNight}/night) {rm.type === assignRoomBooking.roomType ? '★ Matches Request' : ''}
                    </option>
                  ))}
              </select>
              {rooms.filter((r) => r.status === 'Available').length === 0 && (
                <p className="text-rose-600 font-bold mt-2">
                  No rooms currently marked as "Available" in ERP. Please mark a room as Clean & Available first.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignRoomBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedRoomIdToAssign}
                onClick={() => {
                  if (!selectedRoomIdToAssign) return;
                  assignRoomToBooking(assignRoomBooking.id, selectedRoomIdToAssign);
                  setAssignRoomBooking(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md shadow-emerald-600/20"
              >
                Confirm Room Assignment & Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
