/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Language, Theme } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Accounting } from './components/Accounting';
import { Inventory } from './components/Inventory';
import { Suppliers } from './components/Suppliers';
import { Reports } from './components/Reports';
import { Users } from './components/Users';
import { Clients } from './components/Clients';
import { Missing } from './components/Missing';
import { Returns } from './components/Returns';
import { Settings } from './components/Settings';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout 
            lang={lang} setLang={setLang} 
            theme={theme} setTheme={setTheme} 
          />
        }>
          <Route index element={<Dashboard lang={lang} theme={theme} />} />
          <Route path="pos" element={<POS lang={lang} theme={theme} />} />
          <Route path="accounting" element={<Accounting lang={lang} theme={theme} />} />
          <Route path="inventory" element={<Inventory lang={lang} theme={theme} />} />
          <Route path="suppliers" element={<Suppliers lang={lang} theme={theme} />} />
          <Route path="reports" element={<Reports lang={lang} theme={theme} />} />
          <Route path="users" element={<Users lang={lang} theme={theme} />} />
          <Route path="clients" element={<Clients lang={lang} theme={theme} />} />
          <Route path="missing" element={<Missing lang={lang} theme={theme} />} />
          <Route path="returns" element={<Returns lang={lang} theme={theme} />} />
          <Route path="settings" element={<Settings lang={lang} theme={theme} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

