import React from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { DollarSign, TrendingUp, TrendingDown, Receipt, PieChart, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const FinanceDashboardPage: React.FC = () => {
  const { invoices = [], expenses = [], payroll = [], payrollRecords = [] } = useHotel();

  const activePayroll = payroll || payrollRecords || [];

  const totalRevenue = (invoices || []).reduce((acc, i) => acc + (i?.paidAmount || 0), 0);
  const totalExpenses = (expenses || []).reduce((acc, e) => acc + (e?.amount || 0), 0);
  const totalPayroll = activePayroll.reduce((acc, p) => acc + (p?.netSalary || 0), 0);
  const netProfit = totalRevenue - (totalExpenses + totalPayroll);

  const chartData = [
    { month: 'Mar', revenue: 42000, expenses: 18000 },
    { month: 'Apr', revenue: 51000, expenses: 21000 },
    { month: 'May', revenue: 48000, expenses: 19500 },
    { month: 'Jun', revenue: 62000, expenses: 24000 },
    { month: 'Jul', revenue: 74000, expenses: 26000 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Revenue summaries, operating expenses, and payroll disbursements</p>
        </div>

        <div className="px-3.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl font-bold text-xs">
          Net Margin: +38.4%
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">${(totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last period
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">${(totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Supplies, utilities & maintenance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Payroll Outflow</span>
            <CreditCard className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">${(totalPayroll ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Staff salaries & benefits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Profit Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600">${(netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Net after expenses & payroll</span>
        </div>

      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-base mb-1">Financial Trajectory (Revenue vs Expenses)</h4>
        <p className="text-xs text-slate-500 mb-4 font-medium">Monthly cashflow analytics</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevFin)" name="Revenue ($)" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpFin)" name="Expenses ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
