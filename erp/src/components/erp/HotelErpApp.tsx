import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { ToastContainer } from '../common/ToastContainer';
import { LoginScreen } from '../portals/LoginScreen';
import { AdminPortal } from '../portals/admin/AdminPortal';
import { ManagerPortal } from '../portals/manager/ManagerPortal';
import { ReceptionistPortal } from '../portals/receptionist/ReceptionistPortal';
import { Building2 } from 'lucide-react';

export const HotelErpApp: React.FC = () => {
  const { activePortal } = useHotel();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Main ERP Portals Container */}
      <div className="flex-1 flex flex-col">
        {activePortal === 'login' && <LoginScreen />}
        {activePortal === 'admin' && <AdminPortal />}
        {activePortal === 'manager' && <ManagerPortal />}
        {activePortal === 'receptionist' && <ReceptionistPortal />}
      </div>

      <ToastContainer />
    </div>
  );
};
