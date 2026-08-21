import React from 'react';
import { useHotel } from '../../../../context/HotelContext';
import {
  UserCheck, LogOut, CalendarCheck, BedDouble, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';

interface ReceptionistDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const ReceptionistDashboardPage: React.FC<ReceptionistDashboardPageProps> = ({ onNavigate }) => {
  const { bookings, rooms, updateBookingStatus } = useHotel();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayCheckIns = bookings.filter((b) => b.checkInDate <= todayStr && (b.status || '').toLowerCase() === 'confirmed');
  const todayCheckOuts = bookings.filter((b) => (b.status || '').toLowerCase() === 'checked-in' || (b.status || '').toLowerCase() === 'checked_in');
  const upcomingReservations = bookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed');
  const availableRooms = rooms.filter((r) => (r.status || '').toLowerCase() === 'available');

  return (
    <div className="space-y-6">

      {/* Front Desk Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Front Desk & Concierge</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quick guest check-ins, check-outs, and room assignments</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('check-in')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Process Check-In</span>
          </button>
          <button
            onClick={() => onNavigate('check-out')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Express Check-Out</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div
          onClick={() => onNavigate('check-in')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all group select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Today's Check-ins</span>
            <UserCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-slate-900">{todayCheckIns.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Expected arrivals today</span>
        </div>

        <div
          onClick={() => onNavigate('check-out')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 transition-all group select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">Today's Check-outs</span>
            <LogOut className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-slate-900">{todayCheckOuts.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Scheduled departures</span>
        </div>

        <div
          onClick={() => onNavigate('reservations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all group select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Upcoming Bookings</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-slate-900">{upcomingReservations.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Confirmed reservations</span>
        </div>

        <div
          onClick={() => onNavigate('check-in')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all group select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Available Rooms</span>
            <BedDouble className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-slate-900">{availableRooms.length}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Inspected & ready</span>
        </div>

      </div>

      {/* Main Grid: Arrivals Queue & Available Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Expected Arrivals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Arrivals Queue</h3>
              <p className="text-xs text-slate-500">Guests scheduled to arrive today</p>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayCheckIns.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No pending arrivals for today.</p>
            ) : (
              todayCheckIns.map((bk) => (
                <div key={bk.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{bk.guestName}</span>
                    <span className="text-[11px] text-slate-500">Room #{bk.roomNumber} ({bk.roomType}) • {bk.nights} Nights</span>
                  </div>
                  <button
                    onClick={() => updateBookingStatus(bk.id, 'Checked-in')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Check In Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Rooms Quick Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Available Rooms Ready</h3>
              <p className="text-xs text-slate-500">Inspected suites ready for check-in</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableRooms.slice(0, 6).map((rm) => (
              <div key={rm.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">#{rm.roomNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Floor {rm.floor}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 truncate">{rm.type}</p>
                <span className="font-bold text-xs text-slate-900 block">${rm.price}/night</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
