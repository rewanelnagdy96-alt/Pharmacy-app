import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, User } from '../types';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, Download } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface UsersProps {
  lang: Language;
  theme: Theme;
}

export function Users({ lang, theme }: UsersProps) {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<User>>({
    id: '', username: '', role: 'user'
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      ...form,
      id: form.id || crypto.randomUUID()
    } as User;
    
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, password })
      });
      setUsers([...users, newUser]);
      setIsAdding(false);
      setForm({ id: '', username: '', role: 'user' });
      setPassword('');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Role'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => 
        [`"${u.username}"`, `"${u.role}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.users}</h2>
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
              Add User
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
              <label className="block text-xs font-medium mb-1 opacity-70">{t.username}</label>
              <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">{t.password}</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 opacity-70">Role</label>
              <select required value={form.role} onChange={e => setForm({...form, role: e.target.value as 'admin' | 'user'})} className={twMerge("w-full px-3 py-2 rounded-lg border outline-none", theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200")}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
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
              placeholder="Search users..."
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
                <th className="px-6 py-4">{t.username}</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className={twMerge(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        u.role === 'admin' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                      </div>
                      {u.username}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={twMerge(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      u.role === 'admin' 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
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
