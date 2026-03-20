import React, { useEffect, useState } from 'react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { DollarSign, FileText, AlertTriangle, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DashboardProps {
  lang: Language;
  theme: Theme;
}

export function Dashboard({ lang, theme }: DashboardProps) {
  const t = translations[lang];
  const [stats, setStats] = useState({
    todaySales: 0,
    invoicesCount: 0,
    missingMedicines: 0,
    nearExpiry: 0
  });

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const cards = [
    {
      title: t.todaySales,
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: t.invoicesCount,
      value: stats.invoicesCount,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: t.missingMedicines,
      value: stats.missingMedicines,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-900/30'
    },
    {
      title: t.nearExpiry,
      value: stats.nearExpiry,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={twMerge(
              "p-6 rounded-2xl shadow-sm border transition-colors duration-200",
              theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={twMerge(
                  "text-sm font-medium mb-1",
                  theme === 'dark' ? "text-slate-400" : "text-slate-500"
                )}>
                  {card.title}
                </p>
                <h3 className={twMerge(
                  "text-3xl font-bold",
                  theme === 'dark' ? "text-slate-100" : "text-slate-800"
                )}>
                  {card.value}
                </h3>
              </div>
              <div className={twMerge("w-12 h-12 rounded-xl flex items-center justify-center", card.bg)}>
                <Icon className={twMerge("w-6 h-6", card.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
