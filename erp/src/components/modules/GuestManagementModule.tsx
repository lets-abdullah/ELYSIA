import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Crown,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Guest } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const GuestManagementModule: React.FC = () => {
  const { guests, rooms, addGuest, updateGuest, updateGuestPaymentStatus, deleteGuest } = useHotel();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Guest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    checkInDate: '',
    checkOutDate: '',
    assignedRoomId: '',
    paymentStatus: 'Pending' as 'Paid' | 'Pending' | 'Partial',
    vipStatus: false,
    notes: ''
  });

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    const today = new Date().toISOString().split('T')[0];
    const next3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      checkInDate: today,
      checkOutDate: next3Days,
      assignedRoomId: rooms.find((r) => r.status === 'Available')?.id || '',
      paymentStatus: 'Pending',
      vipStatus: false,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      fullName: guest.fullName,
      phone: guest.phone,
      email: guest.email,
      address: guest.address || '',
      checkInDate: guest.checkInDate || '',
      checkOutDate: guest.checkOutDate || '',
      assignedRoomId: guest.assignedRoomId || '',
      paymentStatus: guest.paymentStatus || 'Pending',
      vipStatus: guest.vipStatus || false,
      notes: guest.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const assignedRoom = rooms.find((r) => r.id === formData.assignedRoomId);

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        assignedRoomId: formData.assignedRoomId,
        assignedRoomNumber: assignedRoom ? assignedRoom.roomNumber : undefined,
        paymentStatus: formData.paymentStatus,
        vipStatus: formData.vipStatus,
        notes: formData.notes
      });
    } else {
      addGuest({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        assignedRoomId: formData.assignedRoomId,
        assignedRoomNumber: assignedRoom ? assignedRoom.roomNumber : undefined,
        paymentStatus: formData.paymentStatus,
        vipStatus: formData.vipStatus,
        notes: formData.notes
      });
    }
    setIsModalOpen(false);
  };

  // Filter Guests
  const filteredGuests = guests.filter((guest) => {
    const q = search.trim().toLowerCase();
    const guestName = (guest.fullName || (guest as any).name || '').toLowerCase();
    const guestEmail = (guest.email || '').toLowerCase();
    const guestPhone = (guest.phone || '');
    const roomNum = (guest.assignedRoomNumber || '');

    const matchesSearch = !q ||
      guestName.includes(q) ||
      guestEmail.includes(q) ||
      guestPhone.includes(q) ||
      roomNum.includes(q);

    const currentPayment = (guest.paymentStatus || 'Pending').toLowerCase();
    const matchesPayment = paymentFilter === 'All' || currentPayment === paymentFilter.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Guest Management Directory
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-semibold">
                {filteredGuests.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Manage registered guests, contact information, and stay details</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register Guest
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, phone, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Payment Status:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Guest Name & Contact</th>
                <th className="px-5 py-3 whitespace-nowrap">Assigned Room</th>
                <th className="px-5 py-3 whitespace-nowrap">Stay Dates</th>
                <th className="px-5 py-3 whitespace-nowrap">Payment</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 whitespace-nowrap">
                    No guests registered.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {(guest.fullName || (guest as any).name || 'G').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900">{guest.fullName || (guest as any).name || 'Guest'}</h4>
                            {guest.vipStatus && (
                              <span className="p-0.5 rounded bg-amber-100 text-amber-700" title="VIP Guest">
                                <Crown className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{guest.email}</span>
                            <span className="font-mono text-slate-400">• {guest.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {guest.assignedRoomNumber ? (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-mono font-bold border border-indigo-200">
                          Room #{guest.assignedRoomNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{guest.checkInDate}</span> → <span>{guest.checkOutDate}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={guest.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                          onChange={(e) => updateGuestPaymentStatus(guest.id, e.target.value as 'Paid' | 'Pending')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border cursor-pointer outline-none shadow-xs transition-all ${guest.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">PAID</option>
                        </select>
                        {guest.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => updateGuestPaymentStatus(guest.id, 'Paid')}
                            className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                            title="Mark payment as Paid to add to revenue"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setHistoryCustomer(guest)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-200 transition-colors"
                          title="View Booking History"
                        >
                          <FileText className="w-3.5 h-3.5" /> History
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(guest)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(guest.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? 'Edit Guest Profile' : 'Register New Guest'}
        subtitle="Guest contact information and room assignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Camila Rodriguez"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 (555) 771-4412"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="camila@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Check-in Date</label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Check-out Date</label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Room</label>
              <select
                value={formData.assignedRoomId}
                onChange={(e) => setFormData({ ...formData, assignedRoomId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
              >
                <option value="">-- Select Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} ({r.type}) - ${r.price}/night
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              {editingGuest ? 'Update Guest' : 'Save Guest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteGuest(deleteTargetId);
        }}
        title="Delete Guest Record"
        message="Are you sure you want to delete this guest record from the database?"
      />

      {/* Customer Booking History Drawer / Modal */}
      <Modal
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={`Booking History — ${historyCustomer?.fullName || 'Customer'}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{historyCustomer?.email}</p>
              <p className="text-[11px] text-slate-500 font-mono">{historyCustomer?.phone}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-extrabold rounded-lg">
                Total Spent: ${historyCustomer?.totalSpent || 0}
              </span>
            </div>
          </div>

          <h4 className="font-bold text-slate-900 text-sm">Linked Reservations</h4>
          {!(historyCustomer as any)?.bookingHistory || (historyCustomer as any).bookingHistory.length === 0 ? (
            <p className="text-slate-500 italic p-4 text-center border border-dashed rounded-xl">
              No reservation history linked to this customer yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {(historyCustomer as any).bookingHistory.map((b: any) => (
                <div key={b.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">Ref: {b.bookingCode}</span>
                      <span className="font-semibold text-slate-900">({b.roomType || 'Deluxe'})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {new Date(b.checkInDate).toLocaleDateString()} ➔ {new Date(b.checkOutDate).toLocaleDateString()} • {b.nights || 1} Night(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      b.status === 'confirmed' || b.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : b.status === 'pending' || b.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {b.status}
                    </span>
                    <p className="font-black text-slate-900 text-xs mt-1">${b.totalAmount} USD</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setHistoryCustomer(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Close History
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
