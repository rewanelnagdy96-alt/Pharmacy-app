import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, Medicine } from '../types';
import { RotateCcw, Search, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ReturnsProps {
  lang: Language;
  theme: Theme;
}

export function Returns({ lang, theme }: ReturnsProps) {
  const t = translations[lang];
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMedicines();
    fetchReturns();
  }, []);

  const fetchMedicines = () => {
    fetch('/api/medicines')
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(console.error);
  };

  const fetchReturns = () => {
    fetch('/api/returns')
      .then(res => res.json())
      .then(data => setReturns(data))
      .catch(console.error);
  };

  const handleReturn = async () => {
    if (!selectedMedicine || quantity <= 0) return;

    const returnData = {
      id: crypto.randomUUID(),
      sale_id: 'manual', // In a full system, this would link to a specific sale
      medicine_id: selectedMedicine.id,
      quantity: quantity,
      refund_amount: selectedMedicine.price * quantity,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
      });
      
      if (res.ok) {
        fetchReturns();
        fetchMedicines();
        setSelectedMedicine(null);
        setQuantity(1);
        setSearchQuery('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Medicine', 'Quantity', 'Refund Amount'];
    const csvContent = [
      headers.join(','),
      ...returns.map(r => 
        [new Date(r.date).toLocaleDateString(), `"${r.medicine_name}"`, r.quantity, r.refund_amount].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `returns_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.barcode.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.returns}</h2>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <h3 className="text-lg font-medium mb-4">Process Return</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchMedicine}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={twMerge(
                "w-full pl-10 pr-4 py-2 rounded-xl border outline-none",
                theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
              )}
            />
          </div>

          {searchQuery && !selectedMedicine && (
            <div className="max-h-48 overflow-y-auto mb-4 border rounded-xl dark:border-slate-700">
              {filteredMedicines.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMedicine(m);
                    setSearchQuery(m.name);
                  }}
                  className={twMerge(
                    "w-full text-left px-4 py-2 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700",
                    theme === 'dark' ? "border-slate-700" : "border-slate-100"
                  )}
                >
                  {m.name} - ${m.price.toFixed(2)}
                </button>
              ))}
            </div>
          )}

          {selectedMedicine && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <div className="font-medium">{selectedMedicine.name}</div>
                  <div className="text-sm text-slate-500">${selectedMedicine.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm">{t.quantity}</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={twMerge(
                      "w-20 px-2 py-1 rounded border outline-none",
                      theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Refund Amount:</span>
                <span className="text-rose-500">${(selectedMedicine.price * quantity).toFixed(2)}</span>
              </div>

              <button
                onClick={handleReturn}
                className="w-full py-3 rounded-xl font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Process Return
              </button>
              
              <button
                onClick={() => {
                  setSelectedMedicine(null);
                  setSearchQuery('');
                  setQuantity(1);
                }}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          )}
        </div>

        <div className={twMerge(
          "p-6 rounded-2xl shadow-sm border flex flex-col",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <h3 className="text-lg font-medium mb-4">Recent Returns</h3>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={twMerge(
                  "border-b",
                  theme === 'dark' ? "border-slate-700" : "border-slate-200"
                )}>
                  <th className="py-3 px-4 font-medium opacity-70">{t.date}</th>
                  <th className="py-3 px-4 font-medium opacity-70">Medicine</th>
                  <th className="py-3 px-4 font-medium opacity-70">Qty</th>
                  <th className="py-3 px-4 font-medium opacity-70 text-right">Refund</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r: any) => (
                  <tr key={r.id} className={twMerge(
                    "border-b last:border-0",
                    theme === 'dark' ? "border-slate-700/50" : "border-slate-100"
                  )}>
                    <td className="py-3 px-4 text-sm">{new Date(r.date).toLocaleString()}</td>
                    <td className="py-3 px-4">{r.medicine_name}</td>
                    <td className="py-3 px-4">{r.quantity}</td>
                    <td className="py-3 px-4 text-right font-medium text-rose-500">
                      ${r.refund_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No recent returns
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
