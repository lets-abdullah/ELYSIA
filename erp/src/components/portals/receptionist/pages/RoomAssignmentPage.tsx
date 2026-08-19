import React, { useState } from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { RoomStatus } from '../../../../types';
import { BedDouble, CheckCircle2, AlertCircle, Clock, Wrench, Shield } from 'lucide-react';

export const RoomAssignmentPage: React.FC = () => {
  const { rooms, setRoomStatus } = useHotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');

  const floors = ['All', 1, 2, 3, 4, 5];

  const filteredRooms = rooms.filter((r) => selectedFloor === 'All' || r.floor === selectedFloor);

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Available</span>;
      case 'Occupied':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Occupied</span>;
      case 'Reserved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Reserved</span>;
      case 'Cleaning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Cleaning</span>;
      case 'Maintenance':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Maintenance</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-600" />
            <span>Interactive Floor Map & Room Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual room inventory by floor. Toggle status directly for walk-ins or housekeeping.
          </p>
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {floors.map((fl) => (
            <button
              key={fl.toString()}
              onClick={() => setSelectedFloor(fl as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === fl ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              {fl === 'All' ? 'All Floors' : `Floor ${fl}`}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((rm) => (
          <div
            key={rm.id}
            className={`p-5 rounded-2xl border transition-all space-y-3 bg-white ${
              rm.status === 'Available'
                ? 'border-emerald-200 ring-1 ring-emerald-500/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-slate-900">Room #{rm.roomNumber}</span>
                <span className="text-[11px] text-slate-500 block font-medium">{rm.type} • Floor {rm.floor}</span>
              </div>
              {getStatusBadge(rm.status)}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="font-bold text-slate-900">${rm.price} / night</span>
              <span className="text-slate-500">{rm.bedType} Bed</span>
            </div>

            {/* Quick Status Setter Dropdown */}
            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Quick Status Control
              </label>
              <select
                value={rm.status}
                onChange={(e) => setRoomStatus(rm.id, e.target.value as RoomStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="Available">Available (Clean & Inspected)</option>
                <option value="Reserved">Reserved</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning Required</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
