import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductsPage from './ProductsPage';
import FaqsPage from './FaqsPage';
import OrdersPage from './OrdersPage';
import SettingsPage from './SettingsPage';

export default function Dashboard({ merchant, onMerchantUpdated }) {
  const [tab, setTab] = useState('products');

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div>
          <h1>{merchant.name || 'Your shop'}</h1>
          <div className="greeting">Signed in as owner</div>
        </div>
        <button className="logout-link" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Products</button>
        <button className={`tab ${tab === 'faqs' ? 'active' : ''}`} onClick={() => setTab('faqs')}>FAQs</button>
        <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'products' && <ProductsPage merchant={merchant} />}
      {tab === 'faqs' && <FaqsPage merchant={merchant} />}
      {tab === 'orders' && <OrdersPage merchant={merchant} />}
      {tab === 'settings' && <SettingsPage merchant={merchant} onMerchantUpdated={onMerchantUpdated} />}
    </div>
  );
}
