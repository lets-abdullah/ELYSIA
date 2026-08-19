import React, { useState } from 'react';
import { PortalHeader } from '../shared/PortalHeader';
import { DashboardModule } from '../../modules/DashboardModule';
import { RoomManagementModule } from '../../modules/RoomManagementModule';
import { BookingModule } from '../../modules/BookingModule';
import { GuestManagementModule } from '../../modules/GuestManagementModule';

import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, ShieldCheck, Menu, X
} from 'lucide-react';

export const ManagerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reservations' | 'rooms' | 'guests'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'rooms', label: 'Rooms', icon: <BedDouble className="w-5 h-5" /> },
    { id: 'guests', label: 'Guests', icon: <Users className="w-5 h-5" /> }
  ];

  const handleTabChange = (tab: string) => {
    if (tab === 'finance' || tab === 'billing') {
      setActiveTab('reservations' as any);
    } else {
      setActiveTab(tab as any);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans text-slate-800 overflow-hidden">

      {/* Top Navigation Header */}
      <PortalHeader portalName="MANAGER" accentBg="bg-amber-600" accentText="text-amber-600" />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-amber-600 text-white rounded-full shadow-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <aside
          className={`w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 fixed lg:static inset-y-0 left-0 z-30 transition-transform lg:translate-x-0 h-full overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Badge Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-300">
              Manager Portal
            </span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-3.5 flex-1 overflow-y-auto text-sm font-semibold">
            {sidebarNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3.5 rounded-xl flex items-center gap-3.5 text-sm sm:text-[15px] font-semibold tracking-wide transition-all cursor-pointer ${isActive
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center font-medium">
            Grand Luxe Manager System
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-full">
          {activeTab === 'dashboard' && <DashboardModule setActiveTab={handleTabChange} />}
          {activeTab === 'reservations' && <BookingModule />}
          {activeTab === 'rooms' && <RoomManagementModule />}
          {activeTab === 'guests' && <GuestManagementModule />}
        </main>

      </div>
    </div>
  );
};
