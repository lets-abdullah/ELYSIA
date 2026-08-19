import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarPlus,
  Bed,
  Receipt,
  UserCheck
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewBookingModal: () => void;
  onOpenNewRoomModal: () => void;
  onOpenNewInvoiceModal: () => void;
  onOpenLoginModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewBookingModal,
  onOpenNewRoomModal,
  onOpenNewInvoiceModal,
  onOpenLoginModal,
  searchQuery,
  setSearchQuery
}) => {
  const { currentUser, activityLogs } = useHotel();
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Title formatting according to active tab
  const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: 'Live hotel occupancy, financial health, and operational status' },
    users: { title: 'User & Security Management', subtitle: 'Manage ERP system users, role access permissions, and profiles' },
    rooms: { title: 'Room Directory & Status', subtitle: 'Live floor plan, room inventory, availability, and rate management' },
    guests: { title: 'Guest CRM Directory', subtitle: 'Comprehensive guest profile history, CNIC/Passport IDs, and stay records' },
    bookings: { title: 'Reservations & Front Desk', subtitle: 'Create reservations, manage check-ins, check-outs, and room assignments' },
    staff: { title: 'Staff & Department HR', subtitle: 'Staff employee records, department shifts, and roster management' },
    housekeeping: { title: 'Housekeeping & Maintenance', subtitle: 'Track room sanitation, dispatch tasks, and mark rooms clean' },
    billing: { title: 'Billing, Invoices & Folios', subtitle: 'Generate itemized folios, record payments, and manage discounts' },
    reports: { title: 'Reports & Analytics', subtitle: 'Revenue trends, occupancy analytics, and audit logs' }
  };

  // eslint-disable-next-line security/detect-object-injection -- reviewed, typed internal tab key
  const currentTabMeta = tabTitles[activeTab] || { title: 'Hotel ERP', subtitle: 'Grand Luxe Management System' };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 py-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title / Module Badge */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentTabMeta.title}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentUser.role} View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{currentTabMeta.subtitle}</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Global Search Bar */}
          <div className="relative min-w-55 sm:min-w-70">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms, guests, bookings..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewBookingModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-200"
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Reservation</span>
            </button>

            <button
              onClick={onOpenNewRoomModal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Add New Room"
            >
              <Bed className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewInvoiceModal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Generate Invoice"
            >
              <Receipt className="w-4 h-4" />
            </button>
          </div>

          {/* Date / Time Widget */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-medium">{date}</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{time}</span>
            </div>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Recent Activity Logs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-900">Live Activity Feed</h4>
                  <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {activityLogs.length} events
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {activityLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-50/80 transition-colors text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800">{log.action}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-500 mt-1">{log.details}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>By: {log.user} ({log.userRole})</span>
                        <span className="font-medium text-slate-600">{log.module}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('reports');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View All Audit Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
            />
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline">{currentUser.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
