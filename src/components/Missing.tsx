import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { Plus, Search, Trash2, AlertCircle, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MissingProps {
  lang: Language;
  theme: Theme;
}

export function Missing({ lang, theme }: MissingProps) {
  const t = translations[lang];
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'medicine' });

  useEffect(() => {
    fetch('/api/missing')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: crypto.randomUUID(),
      name: form.name,
      type: form.type,
      date: new Date().toISOString()
    };

    try {
      await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      setItems([...items, newItem]);
      setIsAdding(false);
      setForm({ name: '', type: 'medicine' });
    } catch (error) {
      console.error('Error saving missing item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/missing/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting missing item:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Type', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => 
        [`"${item.name}"`, `"${item.type}"`, new Date(item.date).toLocaleDateString()].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `missing_items_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.missingMedicines}</h2>
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
              Add Missing Item
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Item Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Type</label>
              <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")}>
                <option value="medicine">Medicine</option>
                <option value="consumable">Consumable</option>
              </select>
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
              placeholder="Search missing items..."
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
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={twMerge(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      item.type === 'medicine' 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
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
