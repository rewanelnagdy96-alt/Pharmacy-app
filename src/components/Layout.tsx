import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3, 
  Calculator, 
  Users, 
  Moon,
  Sun,
  Globe,
  UserCircle,
  AlertCircle,
  RotateCcw,
  Settings as SettingsIcon,
  Bell
} from 'lucide-react';
import { translations } from '../translations';
import { Language, Theme } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LayoutProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function Layout({ lang, setLang, theme, setTheme }: LayoutProps) {
  const t = translations[lang];
  const location = useLocation();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [notifications, setNotifications] = React.useState<{lowStock: any[], nearExpiry: any[], expired: any[]}>({ lowStock: [], nearExpiry: [], expired: [] });
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
  }, []);

  const totalNotifications = notifications.lowStock.length + notifications.nearExpiry.length + notifications.expired.length;

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t.dashboard },
    { path: '/pos', icon: ShoppingCart, label: t.pos },
    { path: '/inventory', icon: Package, label: t.inventory },
    { path: '/suppliers', icon: Truck, label: t.suppliers },
    { path: '/clients', icon: UserCircle, label: t.clients },
    { path: '/missing', icon: AlertCircle, label: t.missingMedicines },
    { path: '/returns', icon: RotateCcw, label: t.returns },
    { path: '/reports', icon: BarChart3, label: t.reports },
    { path: '/accounting', icon: Calculator, label: t.accounting },
    { path: '/users', icon: Users, label: t.users },
    { path: '/settings', icon: SettingsIcon, label: t.settings },
  ];

  return (
    <div className={twMerge(
      "min-h-screen flex transition-colors duration-200",
      theme === 'dark' ? "bg-slate-900 text-slate-100" : "bg-stone-50 text-slate-800"
    )} dir={dir}>
      
      {/* Sidebar */}
      <aside className={twMerge(
        "w-64 flex-shrink-0 border-r transition-colors duration-200",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
        lang === 'ar' ? "border-l border-r-0" : ""
      )}>
        <div className="h-16 flex items-center px-6 border-b border-inherit">
          <h1 className="text-xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
            {t.title}
          </h1>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={twMerge(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" 
                    : theme === 'dark'
                      ? "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={twMerge(
          "h-16 flex items-center justify-between px-8 border-b transition-colors duration-200",
          theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {menuItems.find(i => i.path === location.pathname)?.label || t.title}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={twMerge(
                  "p-2 rounded-lg transition-colors relative",
                  theme === 'dark' ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                )}
                title={t.notifications}
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </button>

              {showNotifications && (
                <div className={twMerge(
                  "absolute top-full mt-2 w-80 rounded-xl shadow-lg border overflow-hidden z-50",
                  lang === 'ar' ? "left-0" : "right-0",
                  theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <div className={twMerge("p-3 border-b font-medium", theme === 'dark' ? "border-slate-700" : "border-slate-200")}>
                    {t.notifications}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {totalNotifications === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {notifications.expired.map(item => (
                          <div key={`exp-${item.id}`} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-sm">
                            <span className="font-semibold text-rose-600 dark:text-rose-400">Expired:</span> {item.name}
                          </div>
                        ))}
                        {notifications.lowStock.map(item => (
                          <div key={`low-${item.id}`} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">Low Stock:</span> {item.name} ({item.stock} left)
                          </div>
                        ))}
                        {notifications.nearExpiry.map(item => (
                          <div key={`near-${item.id}`} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Expiring Soon:</span> {item.name} ({item.expiry_date})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={twMerge(
                "p-2 rounded-lg transition-colors",
                theme === 'dark' ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              )}
              title={t.theme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className={twMerge(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                theme === 'dark' ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <Globe className="w-4 h-4" />
              <span>{t.language}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
