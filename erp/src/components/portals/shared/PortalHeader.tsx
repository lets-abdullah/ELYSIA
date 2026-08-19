import React, { useState } from 'react';
import { useHotel } from '../../../context/HotelContext';
import { Building2, LogOut, Bell, User } from 'lucide-react';

interface PortalHeaderProps {
  portalName: string;
  accentBg: string;
  accentText: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ portalName, accentBg, accentText }) => {
  const { setActivePortal, currentUser, activityLogs } = useHotel();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs w-full max-w-full">
      
      {/* Portal Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className={`p-1.5 sm:p-2 rounded-xl text-white font-bold flex items-center justify-center shrink-0 ${accentBg}`}>
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
            ELYSIA
          </span>
          <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${accentBg} text-white shrink-0`}>
            {portalName}
          </span>
        </div>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
            title="System Audit Feed"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 whitespace-nowrap">Recent Activity Log</span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{activityLogs.length} events</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span className="whitespace-nowrap">{log.user} ({log.userRole})</span>
                      <span className="whitespace-nowrap">{log.timestamp}</span>
                    </div>
                    <p className="font-medium text-slate-800 text-[11px]">{log.action}: {log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout / Exit Portal Button */}
        <button
          onClick={() => setActivePortal('login')}
          className="px-2.5 sm:px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
          title="Logout to Login Screen"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-tight whitespace-nowrap">{currentUser.name}</span>
            <span className="text-[10px] text-slate-500 font-medium block whitespace-nowrap">{currentUser.role}</span>
          </div>
        </div>
      </div>

    </header>
  );
};

