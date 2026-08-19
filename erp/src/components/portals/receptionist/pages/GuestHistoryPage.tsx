import React, { useState } from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { Users, Search, Award, Calendar, DollarSign, Star, ShieldAlert } from 'lucide-react';

export const GuestHistoryPage: React.FC = () => {
  const { guests } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGuests = guests.filter((g) =>
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.idCardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Guest Profile & Stay History CRM</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Historical stay logs, lifetime spent valuation, VIP membership tier, and guest preferences
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, Passport / CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Guest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGuests.map((gst) => (
          <div key={gst.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{gst.fullName}</h4>
                  {gst.vipStatus && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                      <Star className="w-3 h-3 fill-amber-500" /> VIP Guest
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500 block mt-0.5">{gst.idCardNumber}</span>
              </div>

              <span className="font-black text-emerald-700 text-sm bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                ${(gst.totalSpent ?? 0).toLocaleString()} spent
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Email</span>
                <span className="text-slate-700 font-medium truncate block">{gst.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
                <span className="text-slate-700 font-medium block">{gst.phone}</span>
              </div>
            </div>

            {gst.notes && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-slate-800 block text-[10px] uppercase mb-0.5">Special Preferences</span>
                <p className="italic">"{gst.notes}"</p>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
