import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, Medicine } from '../types';
import { Plus, Search, Edit2, Trash2, Download, Printer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface InventoryProps {
  lang: Language;
  theme: Theme;
}

export function Inventory({ lang, theme }: InventoryProps) {
  const t = translations[lang];
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Medicine>>({
    id: '', barcode: '', name: '', category: '', price: 0, cost: 0, stock: 0, expiry_date: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = () => {
    fetch('/api/medicines')
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(console.error);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const medicine = {
      ...form,
      id: form.id || crypto.randomUUID()
    };

    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      
      if (res.ok) {
        fetchMedicines();
        setIsAdding(false);
        setForm({ id: '', barcode: '', name: '', category: '', price: 0, cost: 0, stock: 0, expiry_date: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Barcode', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Expiry Date'];
    const csvContent = [
      headers.join(','),
      ...medicines.map(m => 
        [m.barcode, `"${m.name}"`, `"${m.category}"`, m.price, m.cost, m.stock, m.expiry_date].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBarcode = (barcode: string, name: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Print Barcode - ${name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .label { text-align: center; padding: 20px; border: 1px dashed #ccc; }
            .name { font-weight: bold; margin-bottom: 10px; font-size: 14px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="name">${name}</div>
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${barcode}&code=Code128&translate-esc=on" alt="Barcode ${barcode}"/>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.barcode.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.inventory}</h2>
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
              {t.addMedicine}
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.barcode}</label>
              <input type="text" required value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.medicineName}</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Category</label>
              <input type="text" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.price}</label>
              <input type="number" required value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Cost</label>
              <input type="number" required value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.quantity}</label>
              <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Expiry Date</label>
              <input type="date" required value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
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
              placeholder={t.searchMedicine}
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
                <th className="px-6 py-4">{t.barcode}</th>
                <th className="px-6 py-4">{t.medicineName}</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">{t.price}</th>
                <th className="px-6 py-4">{t.quantity}</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMedicines.map(medicine => (
                <tr key={medicine.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">{medicine.barcode}</td>
                  <td className="px-6 py-4 font-medium">{medicine.name}</td>
                  <td className="px-6 py-4">{medicine.category}</td>
                  <td className="px-6 py-4">${medicine.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={twMerge(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      medicine.stock > 0 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {medicine.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">{medicine.expiry_date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handlePrintBarcode(medicine.barcode, medicine.name)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                      title={t.printBarcode}
                    >
                      <Printer className="w-4 h-4" />
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
