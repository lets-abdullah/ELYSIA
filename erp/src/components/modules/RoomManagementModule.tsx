import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  Users,
  DollarSign
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus, RoomType, BedType } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const RoomManagementModule: React.FC<{
  isOpenAddModalExternal?: boolean;
  onCloseExternalModal?: () => void;
}> = ({ isOpenAddModalExternal, onCloseExternalModal }) => {
  const { rooms, addRoom, deleteRoom, setRoomStatus } = useHotel();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State for Adding Room
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Standard' as RoomType,
    bedType: 'Double' as BedType,
    price: 150,
    capacity: 2,
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning'] as string[],
    status: 'Available' as RoomStatus,
    notes: ''
  });

  // Support external add room trigger from header
  React.useEffect(() => {
    if (isOpenAddModalExternal) {
      handleOpenAddModal();
    }
  }, [isOpenAddModalExternal]);

  const handleOpenAddModal = () => {
    setFormData({
      roomNumber: `${(rooms.length + 1) * 101}`,
      type: 'Standard',
      bedType: 'Double',
      price: 150,
      capacity: 2,
      amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning'],
      status: 'Available',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber) return;

    addRoom({
      roomNumber: formData.roomNumber,
      floor: 1,
      type: formData.type,
      bedType: formData.bedType,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      amenities: formData.amenities,
      status: formData.status,
      notes: formData.notes
    });

    setIsModalOpen(false);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.amenities.some((a) => a.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesType = typeFilter === 'All' || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Occupied':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cleaning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Maintenance':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Action & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <BedDouble className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Room Directory & Status
              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-semibold">
                {filteredRooms.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Manage room inventory, availability, and active statuses</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 md:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room #, type, amenity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Room Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Executive">Executive</option>
          </select>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </div>
      </div>

      {/* Room Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Room #</th>
                <th className="px-5 py-3 whitespace-nowrap">Type & Bed</th>
                <th className="px-5 py-3 whitespace-nowrap">Price / Night</th>
                <th className="px-5 py-3 whitespace-nowrap">Capacity</th>
                <th className="px-5 py-3 whitespace-nowrap">Availability Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 whitespace-nowrap">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">#{r.roomNumber}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">{r.type}</div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap">{r.bedType} Bed</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">${r.price}</td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{r.capacity} Guests</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Functional Room Availability Dropdown - Only Available & Reserved */}
                      <select
                        value={r.status === 'reserved' || r.status === 'Reserved' ? 'Reserved' : 'Available'}
                        onChange={(e) => setRoomStatus(r.id, e.target.value as RoomStatus)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl border cursor-pointer whitespace-nowrap outline-none shadow-xs transition-all ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTargetId(r.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal (Edit Room Modal removed as requested) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onCloseExternalModal) onCloseExternalModal();
        }}
        title="Add New Room"
        subtitle="Enter essential room details"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Room Number *</label>
            <input
              type="text"
              required
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. 204"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Room Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Executive">Executive</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Price per Night ($) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Initial Availability Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Not Available</option>
            </select>
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer"
            >
              Save Room
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteRoom(deleteTargetId);
        }}
        title="Delete Room Record"
        message="Are you sure you want to remove this room from the inventory?"
      />
    </div>
  );
};
