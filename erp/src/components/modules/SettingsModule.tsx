import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Sliders, Building, DollarSign, Clock, Shield, Bell, Save, CheckCircle
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { showToast } = useHotel();
  
  const [hotelName, setHotelName] = useState('Grand Luxe Resort & Spa');
  const [currency, setCurrency] = useState('USD ($)');
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [taxRate, setTaxRate] = useState('10.0');
  const [serviceCharge, setServiceCharge] = useState('5.0');
  const [autoHousekeepingDispatch, setAutoHousekeepingDispatch] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configuration Saved', 'System preferences and hotel policy parameters updated successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-indigo-600" />
          <span>System Settings & Operational Policies</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Configure hotel profile settings, tax & VAT rates, check-in policies, and automated dispatch workflows
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hotel Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600">
            <Building className="w-5 h-5" />
            <h4 className="font-bold text-slate-900 text-sm">Property Identity</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hotel Property Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Operating Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="AED (AED)">AED - UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">TimeZone</label>
                <input
                  type="text"
                  readOnly
                  value="America/New_York (UTC-5)"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Check-In / Check-Out Policy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-emerald-600">
            <Clock className="w-5 h-5" />
            <h4 className="font-bold text-slate-900 text-sm">Guest Stay Timings & Policies</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Check-In Time</label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Check-Out Time</label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automated notifications will be triggered to Housekeeping 30 minutes prior to standard check-out time.
          </p>
        </div>

        {/* Financial & Tax Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-violet-600">
            <DollarSign className="w-5 h-5" />
            <h4 className="font-bold text-slate-900 text-sm">Billing & Tax Configuration</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Occupancy Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Service Surcharge (%)</label>
              <input
                type="number"
                step="0.1"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-amber-600">
            <Bell className="w-5 h-5" />
            <h4 className="font-bold text-slate-900 text-sm">Workflow Automations</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="font-bold text-slate-900 block">Auto-Dispatch Housekeeping</span>
                <span className="text-[11px] text-slate-500">Auto-create cleaning ticket on guest checkout</span>
              </div>
              <input
                type="checkbox"
                checked={autoHousekeepingDispatch}
                onChange={(e) => setAutoHousekeepingDispatch(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="font-bold text-slate-900 block">System Event Alerts</span>
                <span className="text-[11px] text-slate-500">Send instant activity notifications to manager panel</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
