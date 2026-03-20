import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { Plus, Search, DollarSign, User as UserIcon, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ClientsProps {
  lang: Language;
  theme: Theme;
}

export function Clients({ lang, theme }: ClientsProps) {
  const t = translations[lang];
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', initialDebt: 0 });
  
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionType, setTransactionType] = useState<'add_debt' | 'payment'>('payment');

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(console.error);
  }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      id: crypto.randomUUID(),
      name: form.name,
      phone: form.phone,
      debt: form.initialDebt
    };

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      setClients([...clients, newClient]);
      setIsAdding(false);
      setForm({ name: '', phone: '', initialDebt: 0 });
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const newDebt = transactionType === 'add_debt' 
      ? selectedClient.debt + transactionAmount 
      : Math.max(0, selectedClient.debt - transactionAmount);

    try {
      await fetch(`/api/clients/${selectedClient.id}/debt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debt: newDebt })
      });

      setClients(clients.map(c => 
        c.id === selectedClient.id ? { ...c, debt: newDebt } : c
      ));
      
      setSelectedClient(null);
      setTransactionAmount(0);
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Debt'];
    const csvContent = [
      headers.join(','),
      ...clients.map(c => 
        [`"${c.name}"`, `"${c.phone}"`, c.debt].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients & Debts</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className={twMerge(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium border",
              theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
            )}
          >
            <Download className="w-4 h-4" />
            {t.exportCSV}
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSaveClient} className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Phone</label>
              <input type="text" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Initial Debt</label>
              <input type="number" required value={form.initialDebt} onChange={e => setForm({...form, initialDebt: Number(e.target.value)})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {selectedClient && (
        <form onSubmit={handleTransaction} className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <h3 className="font-medium mb-4">Transaction for {selectedClient.name} (Current Debt: ${selectedClient.debt.toFixed(2)})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Transaction Type</label>
              <select value={transactionType} onChange={e => setTransactionType(e.target.value as any)} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")}>
                <option value="payment">Payment (Reduce Debt)</option>
                <option value="add_debt">Add Debt (Increase Debt)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Amount</label>
              <input type="number" min="0.01" step="0.01" required value={transactionAmount} onChange={e => setTransactionAmount(Number(e.target.value))} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setSelectedClient(null)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              Submit Transaction
            </button>
          </div>
        </form>
      )}

      <div className={twMerge(
        "rounded-2xl shadow-sm border overflow-hidden",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={twMerge(
                "w-full pl-10 pr-4 py-2 rounded-xl border outline-none transition-all",
                theme === 'dark' ? "bg-slate-900 border-slate-700 focus:border-teal-500" : "bg-slate-50 border-slate-200 focus:border-teal-500"
              )}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={twMerge(
              "font-medium border-b",
              theme === 'dark' ? "bg-slate-900/50 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
            )}>
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Current Debt</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">{client.phone}</td>
                  <td className="px-6 py-4">
                    <span className={twMerge(
                      "font-semibold",
                      client.debt > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      ${client.debt.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50 rounded-lg transition-colors text-xs font-medium"
                    >
                      Add Transaction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
