import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, Theme, Medicine, SaleItem } from '../types';
import { Search, Plus, Trash2, Printer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface POSProps {
  lang: Language;
  theme: Theme;
}

export function POS({ lang, theme }: POSProps) {
  const t = translations[lang];
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetch('/api/medicines')
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(console.error);
  }, []);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.barcode.includes(searchQuery)
  );

  const addToCart = (medicine: Medicine) => {
    const existing = cart.find(item => item.medicine_id === medicine.id);
    if (existing) {
      setCart(cart.map(item => 
        item.medicine_id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        medicine_id: medicine.id,
        name: medicine.name,
        quantity: 1,
        price: medicine.price
      }]);
    }
    setSearchQuery('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = total - discount;

  const handlePrint = () => {
    if (cart.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = new Date().toLocaleString();
    const receiptHtml = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>DYEP Pharmacy</h2>
            <p>${date}</p>
          </div>
          <div class="divider"></div>
          ${cart.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item">
            <span>Subtotal:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Discount:</span>
            <span>$${discount.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="total">
            <span>Total:</span>
            <span>$${finalTotal.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="header">
            <p>Thank you for your visit!</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const sale = {
      id: crypto.randomUUID(),
      total,
      discount,
      final_total: finalTotal,
      date: new Date().toISOString(),
      items: cart
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      
      if (res.ok) {
        setCart([]);
        setDiscount(0);
        alert('Sale completed successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Error completing sale');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className={twMerge(
        "flex-1 flex flex-col rounded-2xl shadow-sm border overflow-hidden",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className={twMerge(
          "p-4 border-b",
          theme === 'dark' ? "border-slate-700" : "border-slate-200"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchMedicine}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const exactMatch = medicines.find(m => m.barcode === searchQuery);
                  if (exactMatch) {
                    addToCart(exactMatch);
                    setSearchQuery('');
                  } else if (filteredMedicines.length === 1) {
                    addToCart(filteredMedicines[0]);
                    setSearchQuery('');
                  }
                }
              }}
              className={twMerge(
                "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all",
                theme === 'dark' 
                  ? "bg-slate-900 border-slate-700 focus:border-teal-500 text-white" 
                  : "bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              )}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMedicines.map(medicine => (
              <button
                key={medicine.id}
                onClick={() => addToCart(medicine)}
                className={twMerge(
                  "p-4 rounded-xl text-left transition-all hover:scale-105",
                  theme === 'dark' 
                    ? "bg-slate-700 hover:bg-slate-600" 
                    : "bg-slate-50 hover:bg-teal-50 hover:shadow-md hover:shadow-teal-500/10"
                )}
              >
                <h4 className="font-semibold mb-1 truncate">{medicine.name}</h4>
                <p className={twMerge(
                  "text-sm mb-2",
                  theme === 'dark' ? "text-slate-400" : "text-slate-500"
                )}>{medicine.barcode}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    ${medicine.price.toFixed(2)}
                  </span>
                  <span className={twMerge(
                    "text-xs px-2 py-1 rounded-md",
                    medicine.stock > 0 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {medicine.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className={twMerge(
        "w-full lg:w-96 flex flex-col rounded-2xl shadow-sm border overflow-hidden flex-shrink-0",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className={twMerge(
          "p-4 border-b font-semibold text-lg",
          theme === 'dark' ? "border-slate-700" : "border-slate-200"
        )}>
          {t.receipt}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className={twMerge(
              "flex items-center justify-between p-3 rounded-xl border",
              theme === 'dark' ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50"
            )}>
              <div className="flex-1 min-w-0 pr-3">
                <h5 className="font-medium truncate">{item.name}</h5>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  >-</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  >+</button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No items in cart
            </div>
          )}
        </div>

        <div className={twMerge(
          "p-4 border-t space-y-4",
          theme === 'dark' ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50"
        )}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t.total}</span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t.discount}</span>
            <input 
              type="number" 
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={twMerge(
                "w-24 px-2 py-1 text-right rounded border outline-none",
                theme === 'dark' ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
              )}
            />
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>{t.finalTotal}</span>
            <span className="text-teal-600 dark:text-teal-400">${finalTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handlePrint}
              disabled={cart.length === 0}
              className={twMerge(
              "flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              theme === 'dark' ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            )}>
              <Printer className="w-4 h-4" />
              {t.printInvoice}
            </button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="py-3 rounded-xl font-medium bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.finish}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
