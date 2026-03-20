import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, AccountingEntry } from '../types';
import { Plus, Save, Edit2, CheckCircle2, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface AccountingProps {
  lang: Language;
  theme: Theme;
}

export function Accounting({ lang, theme }: AccountingProps) {
  const t = translations[lang];
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AccountingEntry>>({
    date: new Date().toISOString().split('T')[0],
    field1: 0,
    field2: 0,
    field3: 0,
    field4: 0,
    status: 'draft'
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = () => {
    fetch('/api/accounting')
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  };

  const handleSave = async (status: 'draft' | 'finished') => {
    const entry = {
      id: editingId || crypto.randomUUID(),
      ...form,
      status
    };

    try {
      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      
      if (res.ok) {
        fetchEntries();
        setIsAdding(false);
        setEditingId(null);
        setForm({
          date: new Date().toISOString().split('T')[0],
          field1: 0,
          field2: 0,
          field3: 0,
          field4: 0,
          status: 'draft'
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (entry: AccountingEntry) => {
    setEditingId(entry.id);
    setForm(entry);
    setIsAdding(true);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Field 1', 'Field 2', 'Field 3', 'Field 4', 'Status'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => 
        [e.date, e.field1, e.field2, e.field3, e.field4, e.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `accounting_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.accounting}</h2>
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
              Add Entry
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className={twMerge(
          "p-6 rounded-2xl shadow-sm border",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.date}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={twMerge(
                  "w-full px-3 py-2 rounded-lg border outline-none",
                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.field1}</label>
              <input
                type="number"
                value={form.field1}
                onChange={(e) => setForm({ ...form, field1: Number(e.target.value) })}
                className={twMerge(
                  "w-full px-3 py-2 rounded-lg border outline-none",
                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.field2}</label>
              <input
                type="number"
                value={form.field2}
                onChange={(e) => setForm({ ...form, field2: Number(e.target.value) })}
                className={twMerge(
                  "w-full px-3 py-2 rounded-lg border outline-none",
                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.field3}</label>
              <input
                type="number"
                value={form.field3}
                onChange={(e) => setForm({ ...form, field3: Number(e.target.value) })}
                className={twMerge(
                  "w-full px-3 py-2 rounded-lg border outline-none",
                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.field4}</label>
              <input
                type="number"
                value={form.field4}
                onChange={(e) => setForm({ ...form, field4: Number(e.target.value) })}
                className={twMerge(
                  "w-full px-3 py-2 rounded-lg border outline-none",
                  theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => handleSave('draft')}
              className="px-4 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave('finished')}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.finish}
            </button>
          </div>
        </div>
      )}

      <div className={twMerge(
        "rounded-2xl shadow-sm border overflow-hidden",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={twMerge(
              "font-medium border-b",
              theme === 'dark' ? "bg-slate-900/50 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
            )}>
              <tr>
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.field1}</th>
                <th className="px-6 py-4">{t.field2}</th>
                <th className="px-6 py-4">{t.field3}</th>
                <th className="px-6 py-4">{t.field4}</th>
                <th className="px-6 py-4">{t.status}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center opacity-50">
                    No entries found.
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">{entry.date}</td>
                    <td className="px-6 py-4 font-medium">{entry.field1.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">{entry.field2.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">{entry.field3.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">{entry.field4.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={twMerge(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        entry.status === 'finished' 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {entry.status === 'finished' ? t.finished : t.draft}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => startEdit(entry)}
                        className="p-1.5 opacity-50 hover:opacity-100 hover:text-teal-500 transition-all rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
