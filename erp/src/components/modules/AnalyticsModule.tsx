import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  TrendingUp, BarChart3, PieChart as PieChartIcon, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Award, Target, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const AnalyticsModule: React.FC = () => {
  const { rooms, bookings, invoices } = useHotel();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Computed metrics
  const totalOccupied = rooms.filter((r) => r.status === 'Occupied').length;
  const totalRooms = rooms.length;
  const occupancyRate = ((totalOccupied / (totalRooms || 1)) * 100).toFixed(1);
  const totalRev = (invoices || []).reduce((acc, i) => acc + (i?.paidAmount || 0), 0);
  const adr = (totalRev / (bookings.length || 1)).toFixed(2);
  const revPar = (totalRev / (totalRooms || 1)).toFixed(2);

  const revenueTrendData = [
    { date: 'Jul 21', revenue: 4200, occupancy: 72 },
    { date: 'Jul 22', revenue: 5100, occupancy: 78 },
    { date: 'Jul 23', revenue: 4800, occupancy: 75 },
    { date: 'Jul 24', revenue: 6200, occupancy: 85 },
    { date: 'Jul 25', revenue: 7400, occupancy: 90 },
    { date: 'Jul 26', revenue: 6800, occupancy: 82 },
    { date: 'Jul 27', revenue: 7900, occupancy: 88 }
  ];

  const roomTypeDistribution = [
    { name: 'Standard', value: rooms.filter((r) => r.type === 'Standard').length, color: '#6366f1' },
    { name: 'Deluxe', value: rooms.filter((r) => r.type === 'Deluxe').length, color: '#10b981' },
    { name: 'Suite', value: rooms.filter((r) => r.type === 'Suite').length, color: '#f59e0b' },
    { name: 'Executive', value: rooms.filter((r) => r.type === 'Executive').length, color: '#8b5cf6' },
    { name: 'Presidential', value: rooms.filter((r) => r.type === 'Presidential Suite').length, color: '#f43f5e' }
  ];

  const bookingChannelData = [
    { channel: 'Direct Web', bookings: 45, revenue: '$24,500' },
    { channel: 'Booking.com', bookings: 32, revenue: '$18,200' },
    { channel: 'Expedia', bookings: 21, revenue: '$12,400' },
    { channel: 'Corporate Desk', bookings: 18, revenue: '$15,800' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Hospitality Intelligence & Advanced Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy performance, Average Daily Rate (ADR), RevPAR, and revenue velocity metrics
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['7d', '30d', '90d', '1y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === t ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Occupancy Rate</span>
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{occupancyRate}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{totalOccupied} of {totalRooms} rooms occupied</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ADR (Avg Daily Rate)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${adr}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.2%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Average revenue per sold room</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">RevPAR</span>
            <Target className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${revPar}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.1%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Revenue per available room total</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Receipts</span>
            <BarChart3 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${(totalRev ?? 0).toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.0%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">YTD gross receipts processed</span>
        </div>
      </div>

      {/* Revenue & Occupancy Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-base mb-1">Daily Revenue Velocity ($)</h4>
        <p className="text-xs text-slate-500 mb-4">Tracking daily revenue collection and room occupancy percentages</p>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Distribution & Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Room Inventory Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 text-base mb-1">Room Category Distribution</h4>
          <p className="text-xs text-slate-500 mb-4">Breakdown of total inventory across suite tiers</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roomTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {roomTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acquisition Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 text-base mb-1">Acquisition Channel Share</h4>
          <p className="text-xs text-slate-500 mb-4">Bookings generated by distribution channels</p>
          <div className="space-y-4">
            {bookingChannelData.map((ch, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{ch.channel}</span>
                  <span className="text-[11px] text-slate-500">{ch.bookings} Reservations</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-xs block">{ch.revenue}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
