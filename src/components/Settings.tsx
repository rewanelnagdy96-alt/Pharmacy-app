import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SettingsProps {
  lang: Language;
  theme: Theme;
}

export function Settings({ lang, theme }: SettingsProps) {
  const t = translations[lang];
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pharmacy_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Backup downloaded successfully' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to download backup' });
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite all current data.')) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Database restored successfully. Please refresh the page.' });
      } else {
        throw new Error('Restore failed');
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to restore backup. Invalid file format.' });
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.settings}</h2>
      </div>

      {message && (
        <div className={twMerge(
          "p-4 rounded-xl flex items-center gap-3",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        )}>
          <AlertTriangle className="w-5 h-5" />
          {message.text}
        </div>
      )}

      <div className={twMerge(
        "p-6 rounded-2xl shadow-sm border",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Backup & Restore</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your database backups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h4 className="font-medium">Download Backup</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Save a copy of your entire database to your computer. It's recommended to do this regularly.
            </p>
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download JSON Backup
            </button>
          </div>

          <div className="space-y-4 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h4 className="font-medium">Restore Backup</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a previously saved backup file. Warning: This will overwrite all current data.
            </p>
            <label className="w-full flex items-center justify-center gap-2 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl transition-colors font-medium cursor-pointer">
              <Upload className="w-5 h-5" />
              {isRestoring ? 'Restoring...' : 'Upload JSON Backup'}
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestore}
                disabled={isRestoring}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
