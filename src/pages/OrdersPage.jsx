import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

// The backend API that also sends the customer a WhatsApp notification
// when status changes - set this in your .env file.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function OrdersPage({ merchant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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

  async function updateStatus(group, newStatus) {
    setErrorMsg('');
    setUpdatingId(group.id);

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const response = await fetch(`${API_URL}/api/orders/${group.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || 'Could not update status.');
      } else {
        loadOrders();
      }
    } catch (err) {
      setErrorMsg('Could not reach the server. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="card-sub">Loading orders…</p>;

  // Group line items sharing the same order_group_id into one order card
  const groups = {};
  for (const row of orders) {
    const key = row.order_group_id || row.id;
    if (!groups[key]) {
      groups[key] = {
        id: key,
        status: row.status,
        customer_phone: row.customer_phone,
        delivery_address: row.delivery_address,
        items: [],
        total: 0
      };
    }
    groups[key].items.push({ rowId: row.id, productName: row.product_name, quantity: row.quantity, totalPrice: row.total_price });
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
      {errorMsg && <div className="error-msg" style={{ marginBottom: 12 }}>{errorMsg}</div>}
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
            {g.items.map((i) => `${i.quantity} x ${i.productName}`).join(', ')}
          </div>
          <div className="card-row" style={{ marginTop: 10 }}>
            <span className="price-tag">GH₵{g.total}</span>
          </div>
          <div className="card-actions" style={{ flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.filter((s) => s !== g.status).map((s) => (
              <button
                key={s}
                className={`btn ${s === 'cancelled' ? 'btn-danger' : 'btn-secondary'}`}
                disabled={updatingId === g.id}
                onClick={() => updateStatus(g, s)}
              >
                {updatingId === g.id ? '...' : `Mark ${s}`}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
