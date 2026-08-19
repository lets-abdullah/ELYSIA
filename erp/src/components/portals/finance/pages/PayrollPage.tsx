import React from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { DollarSign, CheckCircle, CreditCard } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { payroll = [], payrollRecords = [] } = useHotel();
  const list = payroll || payrollRecords || [];

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-violet-600" />
          <span>Staff Payroll Records</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Automated payroll processing, bonus allowances, tax withholdings, and pay stub records
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Employee Name</th>
                <th className="p-4">Department / Role</th>
                <th className="p-4">Pay Period</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Bonuses</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Payable</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{p.staffName}</td>
                  <td className="p-4 text-slate-600">{p.department} ({p.position})</td>
                  <td className="p-4 font-mono text-slate-500">{p.paymentDate || '—'}</td>
                  <td className="p-4 font-bold text-slate-900">${(p.baseSalary ?? 0).toLocaleString()}</td>
                  <td className="p-4 text-emerald-600 font-bold">+${(p.bonus ?? 0).toLocaleString()}</td>
                  <td className="p-4 text-rose-600 font-bold">-${(p.deductions ?? 0).toLocaleString()}</td>
                  <td className="p-4 font-black text-slate-900 text-sm">${(p.netSalary ?? 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" /> Paid Direct Deposit
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
