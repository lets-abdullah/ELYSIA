import React from 'react';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UserCheck,
  CalendarCheck,
  UserCog,
  Sparkles,
  Receipt,
  Building2,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export type TabType =
  | 'dashboard'
  | 'users'
  | 'rooms'
  | 'guests'
  | 'bookings'
  | 'staff'
  | 'housekeeping'
  | 'billing'
  | 'reports';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onOpenLoginModal
}) => {
  const { currentUser, resetDemoData, rooms, housekeepingTasks } = useHotel();

  // Pending tasks indicator counts
  const cleaningCount = rooms.filter((r) => r.status === 'Cleaning').length;
  const pendingHkCount = housekeepingTasks.filter((t) => t.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms' as TabType, label: 'Rooms', icon: BedDouble, badge: cleaningCount ? `${cleaningCount}` : undefined },
    { id: 'bookings' as TabType, label: 'Reservations', icon: CalendarCheck },
    { id: 'guests' as TabType, label: 'Customers & Guests', icon: UserCheck },
    { id: 'housekeeping' as TabType, label: 'Housekeeping', icon: Sparkles, badge: pendingHkCount ? `${pendingHkCount}` : undefined },
    { id: 'billing' as TabType, label: 'Billing & Folios', icon: Receipt },
    { id: 'staff' as TabType, label: 'Staff Management', icon: UserCog },
    { id: 'users' as TabType, label: 'User Roles', icon: Users }
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 z-30 shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Top Brand Section */}
      <div>
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight truncate">
                <h1 className="font-bold text-white text-base tracking-wide font-sans">GRAND LUXE</h1>
                <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Resort ERP System</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3.5 space-y-2.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm sm:text-[15px] transition-all duration-200 cursor-pointer group ${isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-xs'
                    : 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200'
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:text-indigo-300'
                    }`}
                />
                {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Info & Tools */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-2.5">
        {!isCollapsed && (
          <button
            onClick={resetDemoData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-indigo-300 transition-colors border border-slate-700/40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        )}

        {/* Active User Switcher Pill */}
        <div
          onClick={onOpenLoginModal}
          className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all ${isCollapsed ? 'justify-center' : ''
            }`}
          title="Switch User / Role"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{currentUser.name}</h4>
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              </div>
              <p className="text-xs text-indigo-300 font-semibold truncate">{currentUser.role}</p>
            </div>
          )}

          {!isCollapsed && <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400 shrink-0 ml-1" />}
        </div>
      </div>
    </aside>
  );
};
