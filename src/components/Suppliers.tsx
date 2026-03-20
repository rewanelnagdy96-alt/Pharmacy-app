import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, Supplier } from '../types';
import { Plus, Search, Edit2, Trash2, Phone, MapPin, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SuppliersProps {
  lang: Language;
  theme: Theme;
}

export function Suppliers({ lang, theme }: SuppliersProps) {
  const t = translations[lang];
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({
    id: '', name: '', phone: '', address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(console.error);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = {
      ...form,
      id: form.id || crypto.randomUUID()
    };

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier)
      });
      
      if (res.ok) {
        fetchSuppliers();
        setIsAdding(false);
        setForm({ id: '', name: '', phone: '', address: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Address'];
    const csvContent = [
      headers.join(','),
      ...suppliers.map(s => 
        [`"${s.name}"`, `"${s.phone}"`, `"${s.address}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.suppliers}</h2>
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
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className={twMerge(
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
              <label className="block text-xs font-medium mb-1 opacity-70">Address</label>
              <input type="text" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
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

      <div className={twMerge(
        "rounded-2xl shadow-sm border overflow-hidden",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              placeholder="Search suppliers..."
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
                <th className="px-6 py-4">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{supplier.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 opacity-50" />
                      {supplier.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-50" />
                      {supplier.address}
                    </div>
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
