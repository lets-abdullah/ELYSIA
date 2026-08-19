import React, { useState } from 'react';
import { PortalHeader } from '../shared/PortalHeader';
import { ReceptionistDashboardPage } from './pages/ReceptionistDashboardPage';
import { CheckInWizardPage } from './pages/CheckInWizardPage';
import { CheckOutExpressPage } from './pages/CheckOutExpressPage';
import { BookingModule } from '../../modules/BookingModule';
import { GuestManagementModule } from '../../modules/GuestManagementModule';

import {
  LayoutDashboard, CalendarCheck, Users, UserCheck, LogOut, Menu, X
} from 'lucide-react';

export const ReceptionistPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reservations' | 'check-in' | 'check-out' | 'guests'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'check-in', label: 'Check In', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'check-out', label: 'Check Out', icon: <LogOut className="w-5 h-5" /> },
    { id: 'guests', label: 'Guests', icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans text-slate-800 overflow-hidden">

      {/* Top Header */}
      <PortalHeader portalName="RECEPTIONIST" accentBg="bg-emerald-600" accentText="text-emerald-600" />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-emerald-600 text-white rounded-full shadow-lg"
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
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-300">
              Receptionist
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
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
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
            Grand Luxe Front Desk System
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-full">
          {activeTab === 'dashboard' && <ReceptionistDashboardPage onNavigate={setActiveTab as any} />}
          {activeTab === 'reservations' && <BookingModule />}
          {activeTab === 'check-in' && <CheckInWizardPage />}
          {activeTab === 'check-out' && <CheckOutExpressPage />}
          {activeTab === 'guests' && <GuestManagementModule />}
        </main>

      </div>
    </div>
  );
};
