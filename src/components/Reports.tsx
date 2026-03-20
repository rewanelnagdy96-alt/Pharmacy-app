import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { BarChart3, TrendingUp, AlertTriangle, Clock, Calendar, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ReportsProps {
  lang: Language;
  theme: Theme;
}

export function Reports({ lang, theme }: ReportsProps) {
  const t = translations[lang];
  const [reportType, setReportType] = useState('daily');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = () => {
    fetch(`/api/reports?type=${reportType}`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(console.error);
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const isMedicineReport = ['missing', 'expiry'].includes(reportType);
    const headers = isMedicineReport ? ['Medicine', 'Stock/Expiry'] : ['Date', 'Amount'];
    
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) => {
        if (isMedicineReport) {
          return [`"${row.name}"`, row.stock || row.expiry_date].join(',');
        } else {
          return [row.date || row.month, row.total || row.profit].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTypes = [
    { id: 'daily', label: 'Daily Sales', icon: Calendar },
    { id: 'monthly', label: 'Monthly Sales', icon: BarChart3 },
    { id: 'profits', label: 'Profits', icon: TrendingUp },
    { id: 'missing', label: 'Missing Medicines', icon: AlertTriangle },
    { id: 'expiry', label: 'Near Expiry', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.reports}</h2>
        <button
          onClick={handleExportCSV}
          disabled={!data || data.length === 0}
          className={twMerge(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium border",
            theme === 'dark' ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 disabled:opacity-50" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50"
          )}
        >
          <Download className="w-4 h-4" />
          {t.exportCSV}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={twMerge(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                reportType === type.id
                  ? "bg-teal-600 text-white"
                  : theme === 'dark'
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      <div className={twMerge(
        "p-6 rounded-2xl shadow-sm border min-h-[400px] flex flex-col",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        {data ? (
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                {React.createElement(reportTypes.find(r => r.id === reportType)?.icon || BarChart3, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-xl font-semibold">{reportTypes.find(r => r.id === reportType)?.label}</h3>
            </div>
            
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={twMerge(
                      "border-b",
                      theme === 'dark' ? "border-slate-700" : "border-slate-200"
                    )}>
                      <th className="py-3 px-4 font-medium opacity-70">
                        {['missing', 'expiry'].includes(reportType) ? 'Medicine' : 'Date'}
                      </th>
                      <th className="py-3 px-4 font-medium opacity-70 text-right">
                        {['missing'].includes(reportType) ? 'Stock' : 
                         ['expiry'].includes(reportType) ? 'Expiry Date' : 'Amount'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row: any, idx: number) => (
                      <tr key={idx} className={twMerge(
                        "border-b last:border-0",
                        theme === 'dark' ? "border-slate-700/50" : "border-slate-100"
                      )}>
                        <td className="py-3 px-4">{row.label}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {['missing'].includes(reportType) ? row.value : 
                           ['expiry'].includes(reportType) ? row.value : 
                           `$${Number(row.value || 0).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                No data available for this report.
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-4"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
