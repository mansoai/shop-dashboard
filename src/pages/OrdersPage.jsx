import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
const PAYMENT_METHODS = ['cash', 'momo', 'card', 'bank transfer'];

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function OrdersPage({ merchant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMenuFor, setPaymentMenuFor] = useState(null);

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

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    };
  }

  async function updateStatus(group, newStatus) {
    setErrorMsg('');
    setUpdatingId(group.id);
    try {
      const response = await fetch(`${API_URL}/api/orders/${group.id}/status`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || 'Could not update status.');
      } else if (result.notified === false) {
        setErrorMsg(`✅ Status updated, but the customer was NOT notified — they haven't messaged in over 24 hours (WhatsApp's rule for free-form messages). Consider reaching out to them another way.`);
        loadOrders();
      } else {
        loadOrders();
      }
    } catch (err) {
      setErrorMsg('Could not reach the server. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePayment(group, paymentStatus, paymentMethod = null) {
    setErrorMsg('');
    setUpdatingId(group.id);
    setPaymentMenuFor(null);
    try {
      const response = await fetch(`${API_URL}/api/orders/${group.id}/payment`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ paymentStatus, paymentMethod })
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || 'Could not update payment status.');
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

  const groups = {};
  for (const row of orders) {
    const key = row.order_group_id || row.id;
    if (!groups[key]) {
      groups[key] = {
        id: key,
        status: row.status,
        paymentStatus: row.payment_status || 'unpaid',
        paymentMethod: row.payment_method,
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
            <div style={{ display: 'flex', gap: 6 }}>
              <span className={`status-badge status-${g.status}`}>{g.status}</span>
              <span className={`status-badge ${g.paymentStatus === 'paid' ? 'status-delivered' : 'status-pending'}`}>
                {g.paymentStatus === 'paid' ? `paid${g.paymentMethod ? ` (${g.paymentMethod})` : ''}` : 'unpaid'}
              </span>
            </div>
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

          <div className="card-actions" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {g.paymentStatus === 'paid' ? (
              <button className="btn btn-secondary" disabled={updatingId === g.id} onClick={() => updatePayment(g, 'unpaid')}>
                Mark unpaid
              </button>
            ) : (
              <>
                <button className="btn btn-primary" disabled={updatingId === g.id} onClick={() => setPaymentMenuFor(paymentMenuFor === g.id ? null : g.id)}>
                  Mark as paid
                </button>
                {paymentMenuFor === g.id && PAYMENT_METHODS.map((m) => (
                  <button key={m} className="btn btn-secondary" onClick={() => updatePayment(g, 'paid', m)}>
                    {m}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
