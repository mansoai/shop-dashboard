import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function OrdersPage({ merchant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, [merchant]);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders(data || []);
    setLoading(false);
  }

  if (loading) return <p className="card-sub">Loading orders…</p>;

  // Group line items sharing the same order_group_id into one order card
  const groups = {};
  for (const row of orders) {
    const key = row.order_group_id || row.id;
    if (!groups[key]) {
      groups[key] = { id: key, status: row.status, customer_phone: row.customer_phone, delivery_address: row.delivery_address, items: [], total: 0 };
    }
    groups[key].items.push(row);
    groups[key].total += Number(row.total_price);
  }
  const groupList = Object.values(groups);

  if (groupList.length === 0) {
    return (
      <div className="empty-state">
        <h3>No orders yet</h3>
        <p>Orders placed through WhatsApp will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      {groupList.map((g) => (
        <div className="card" key={g.id}>
          <div className="card-row">
            <div>
              <div className="card-title">Order #{g.id}</div>
              <div className="card-sub">{g.customer_phone}{g.delivery_address ? ` · ${g.delivery_address}` : ''}</div>
            </div>
            <span className={`status-badge status-${g.status}`}>{g.status}</span>
          </div>
          <div className="card-sub" style={{ marginTop: 10 }}>
            {g.items.map((i) => `${i.quantity} x ${i.product_name}`).join(', ')}
          </div>
          <div className="card-row" style={{ marginTop: 10 }}>
            <span className="price-tag">GH₵{g.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
