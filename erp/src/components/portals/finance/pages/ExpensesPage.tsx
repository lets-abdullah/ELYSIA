import React, { useState } from 'react';
import { useHotel } from '../../../../context/HotelContext';
import { Expense } from '../../../../types';
import { TrendingDown, Plus, Edit, Trash2, CheckCircle, X } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses = [], addExpense, deleteExpense } = useHotel();
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Supplies' | 'Utilities' | 'Maintenance' | 'F&B Ingredients' | 'Marketing' | 'Other'>('Utilities');
  const [amount, setAmount] = useState<number>(450);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Corporate Card' | 'Petty Cash'>('Bank Transfer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      title,
      category,
      amount,
      date: new Date().toISOString().split('T')[0],
      vendor,
      paymentMethod,
      status: 'Paid'
    });
    setShowAddModal(false);
    setTitle('');
    setVendor('');
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-violet-600" />
            <span>Hotel Expenses & Disbursements</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Log vendor disbursements, utility payments, linen orders, and maintenance receipts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense Voucher</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No expense vouchers recorded.</div>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 uppercase">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Vendor: {exp.vendor} • Paid via {exp.paymentMethod} on {exp.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 text-base">${exp.amount.toFixed(2)}</span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-violet-600" />
                <span>Record Expense Voucher</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Power & Electricity Invoice"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Supplies">Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="F&B Ingredients">F&B Ingredients</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Metro Electric Grid"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
                >
                  Record Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
