import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CustomersPage({ merchant }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomers(); }, [merchant]);

  async function loadCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('total_spent', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  if (loading) return <p className="card-sub">Loading customers…</p>;

  if (customers.length === 0) {
    return (
      <div className="empty-state">
        <h3>No customers yet</h3>
        <p>Anyone who messages your WhatsApp bot will show up here automatically.</p>
      </div>
    );
  }

  return (
    <div>
      {customers.map((c) => (
        <div className="card" key={c.id}>
          <div className="card-row">
            <div>
              <div className="card-title">{c.name || c.phone}</div>
              <div className="card-sub">{c.phone}</div>
            </div>
            <span className="price-tag">GH₵{c.total_spent || 0}</span>
          </div>
          <div className="card-sub" style={{ marginTop: 10 }}>
            {c.total_orders || 0} order{c.total_orders === 1 ? '' : 's'}
            {c.last_order_at ? ` · last order ${new Date(c.last_order_at).toLocaleDateString()}` : ''}
          </div>
          {c.default_delivery_address && (
            <div className="card-sub" style={{ marginTop: 4 }}>
              📍 {c.default_delivery_address}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
