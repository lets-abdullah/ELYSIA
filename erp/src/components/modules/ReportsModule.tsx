import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Bed,
  Users,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useHotel } from '../../context/HotelContext';

type ReportTab = 'revenue' | 'occupancy' | 'bookings' | 'guests' | 'staff';

export const ReportsModule: React.FC = () => {
  const { rooms, guests, staff, bookings, invoices, hotelSettings } = useHotel();
  const [activeReport, setActiveReport] = useState<ReportTab>('revenue');

  const currentTaxRate = hotelSettings?.taxRate !== undefined ? hotelSettings.taxRate : 10.0;

  // Revenue analytics from live bookings (Price per night * nights + Dynamic Tax, No Security Charges)
  const totalRevenue = (bookings || [])
    .filter((b) => b.paymentStatus === 'Paid' || (b.paidAmount && b.paidAmount > 0))
    .reduce((sum, bk) => {
      const total = bk.totalAmount || 0;
      const nights = bk.nights || (bk.checkInDate && bk.checkOutDate
        ? Math.max(1, Math.ceil((new Date(bk.checkOutDate).getTime() - new Date(bk.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1);
      const baseRoomPrice = bk.pricePerNight
        ? (bk.pricePerNight * nights)
        : (total > 0 ? Math.round(total / (1 + currentTaxRate / 100)) : 0);
      const tax = Math.round(baseRoomPrice * (currentTaxRate / 100));
      const totalAmount = baseRoomPrice + tax;
      const isPaid = bk.paymentStatus === 'Paid' || (bk.paidAmount && bk.paidAmount >= total);
      return sum + (isPaid ? totalAmount : (bk.paidAmount || 0));
    }, 0);

  const monthlyRevenueData = [
    { month: 'Current Period', revenue: totalRevenue, expenses: Math.round(totalRevenue * 0.35) }
  ];

  // Room type occupancy distribution
  const roomTypeDistribution = [
    { type: 'Standard', count: rooms.filter((r) => r.type === 'Standard').length, color: '#3b82f6' },
    { type: 'Deluxe', count: rooms.filter((r) => r.type === 'Deluxe').length, color: '#f59e0b' },
    { type: 'Suite', count: rooms.filter((r) => r.type === 'Suite').length, color: '#10b981' },
    { type: 'Executive', count: rooms.filter((r) => r.type === 'Executive').length, color: '#8b5cf6' },
    { type: 'Presidential', count: rooms.filter((r) => r.type === 'Presidential Suite').length, color: '#f43f5e' }
  ];

  // Booking channels / status breakdown
  const bookingStatusData = [
    { status: 'Checked-in', value: bookings.filter((b) => b.status === 'Checked-in').length },
    { status: 'Confirmed', value: bookings.filter((b) => b.status === 'Confirmed').length },
    { status: 'Checked-out', value: bookings.filter((b) => b.status === 'Checked-out').length },
    { status: 'Pending', value: bookings.filter((b) => b.status === 'Pending').length },
    { status: 'Cancelled', value: bookings.filter((b) => b.status === 'Cancelled').length }
  ];

  // Staff by department
  const deptDistribution = [
    { department: 'Reception', count: staff.filter((s) => s.department === 'Reception').length },
    { department: 'Housekeeping', count: staff.filter((s) => s.department === 'Housekeeping').length },
    { department: 'Restaurant', count: staff.filter((s) => s.department === 'Restaurant').length },
    { department: 'Security', count: staff.filter((s) => s.department === 'Security').length },
    { department: 'Maintenance', count: staff.filter((s) => s.department === 'Maintenance').length },
    { department: 'Accounts', count: staff.filter((s) => s.department === 'Accounts').length }
  ];

  const exportReportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Module,Metric,Value\n';
    csvContent += `Revenue,Total Collected,$${totalRevenue}\n`;
    csvContent += `Rooms,Total Rooms,${rooms.length}\n`;
    csvContent += `Occupancy,Occupied Rooms,${rooms.filter((r) => (r.status || '').toLowerCase() === 'occupied').length}\n`;
    csvContent += `Guests,Registered Guests,${guests.length}\n`;
    csvContent += `Staff,Active Employees,${staff.length}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grand_Luxe_Hotel_ERP_Report_${activeReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Hotel ERP Reports & Analytics</h3>
            <p className="text-xs text-slate-500">Comprehensive data summaries for financial audit and hotel management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
          <button
            onClick={exportReportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm shadow-indigo-200"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveReport('revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeReport === 'revenue'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Financial Revenue
        </button>
        <button
          onClick={() => setActiveReport('occupancy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeReport === 'occupancy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-4 h-4" /> Room Occupancy
        </button>
        <button
          onClick={() => setActiveReport('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeReport === 'bookings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Booking Trends
        </button>
        <button
          onClick={() => setActiveReport('guests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeReport === 'guests'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Guest CRM Stats
        </button>
        <button
          onClick={() => setActiveReport('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeReport === 'staff'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" /> HR Department
        </button>
      </div>

      {/* Active Tab Content */}
      {activeReport === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-base mb-1">Monthly Revenue vs Operational Expenses</h4>
            <p className="text-xs text-slate-500 mb-4">Comparison of hotel gross receipts against operational overhead</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Gross Revenue ($)" />
                  <Bar dataKey="expenses" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Expenses ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'occupancy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h4 className="font-bold text-slate-900 text-base mb-1">Room Allocation by Type</h4>
            <p className="text-xs text-slate-500 mb-4">Total room inventory distribution</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roomTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Occupancy Summary Metrics</h4>
              <p className="text-xs text-slate-500 mb-4">Key indicators for floor managers</p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600">Total Rooms:</span>
                  <span className="font-bold text-slate-900 font-mono">{rooms.length}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl flex items-center justify-between">
                  <span className="text-amber-800 font-medium">Occupied Rooms:</span>
                  <span className="font-bold text-amber-700 font-mono">
                    {rooms.filter((r) => (r.status || '').toLowerCase() === 'occupied').length}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <span className="text-emerald-800 font-medium">Available Rooms:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {rooms.filter((r) => (r.status || '').toLowerCase() === 'available').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'bookings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1">Booking Status Distribution</h4>
          <p className="text-xs text-slate-500 mb-4">Current reservation pipeline states</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Bookings Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'staff' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-1">Staff Headcount by Department</h4>
          <p className="text-xs text-slate-500 mb-4">Human resource allocation across hotel services</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Employee Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'guests' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-2">Guest CRM Analytics & Loyalty Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Total Registered CRM Profiles</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{guests.length}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <span className="text-amber-800 font-semibold">VIP Guests</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {guests.filter((g) => g.vipStatus).length}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <span className="text-emerald-800 font-semibold">Total Guest Spending</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                ${guests.reduce((sum, g) => sum + (g.totalSpent || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
