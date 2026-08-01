import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SettingsPage({ merchant, onMerchantUpdated }) {
  const [shopName, setShopName] = useState(merchant.name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(merchant.whatsapp_number || '');
  const [shopMsg, setShopMsg] = useState('');
  const [shopSaving, setShopSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const [planInfo, setPlanInfo] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  const [confirmText, setConfirmText] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateMsg, setDeactivateMsg] = useState('');

  useEffect(() => { loadPlan(); }, [merchant]);

  async function loadPlan() {
    setPlanLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('name', (merchant.plan || 'free').toLowerCase())
      .maybeSingle();
    setPlanInfo(data);
    setPlanLoading(false);
  }

  async function handleShopSave(e) {
    e.preventDefault();
    setShopMsg('');
    setShopSaving(true);

    const { error } = await supabase
      .from('merchants')
      .update({
        name: shopName.trim(),
        whatsapp_number: whatsappNumber.trim()
      })
      .eq('id', merchant.id);

    setShopSaving(false);

    if (error) {
      setShopMsg('❌ Could not save: ' + error.message);
    } else {
      setShopMsg('✅ Saved!');
      await onMerchantUpdated?.();
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPwMsg('');

    if (newPassword.length < 6) {
      setPwMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg('Passwords do not match.');
      return;
    }

    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);

    if (error) {
      if (error.message.toLowerCase().includes('session')) {
        setPwMsg('⚠️ Your login session has expired. Please sign out and sign back in, then try again.');
      } else {
        setPwMsg('❌ Could not update password: ' + error.message);
      }
    } else {
      setPwMsg('✅ Password updated!');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  async function handleDeactivate() {
    setDeactivateMsg('');
    setDeactivating(true);

    const { error } = await supabase
      .from('merchants')
      .update({ is_active: false })
      .eq('id', merchant.id);

    if (error) {
      setDeactivateMsg('❌ Could not deactivate: ' + error.message);
      setDeactivating(false);
      return;
    }

    // Sign out immediately so they can't keep using a "deactivated" account
    await supabase.auth.signOut();
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Your plan</h3>
        {planLoading ? (
          <p className="card-sub">Loading…</p>
        ) : planInfo ? (
          <div>
            <div className="card-row">
              <div>
                <div className="card-title" style={{ textTransform: 'capitalize' }}>{planInfo.name}</div>
                <div className="card-sub">{planInfo.description}</div>
              </div>
              <span className="price-tag">
                {Number(planInfo.price_ghs) === 0 ? 'Free' : `GH₵${planInfo.price_ghs}/mo`}
              </span>
            </div>
            <div className="card-sub" style={{ marginTop: 10 }}>
              Products: {planInfo.max_products ?? 'Unlimited'} · Orders/month: {planInfo.max_orders_per_month ?? 'Unlimited'}
            </div>
          </div>
        ) : (
          <p className="card-sub">No plan info found for "{merchant.plan || 'free'}".</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Shop details</h3>
        <form className="stack" onSubmit={handleShopSave}>
          <div>
            <label>Shop name</label>
            <input value={shopName} onChange={(e) => setShopName(e.target.value)} required />
          </div>
          <div>
            <label>WhatsApp number (owner's own number)</label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 233241234567"
              required
            />
            <p className="card-sub" style={{ marginTop: 4 }}>
              This is the number used for admin commands (like "orders" or "status") and order notifications.
            </p>
          </div>
          {shopMsg && <div className={shopMsg.startsWith('✅') ? 'card-sub' : 'error-msg'}>{shopMsg}</div>}
          <button type="submit" className="btn btn-primary" disabled={shopSaving}>
            {shopSaving ? 'Saving...' : 'Save shop details'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Change password</h3>
        <form className="stack" onSubmit={handlePasswordSave}>
          <div>
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          {pwMsg && <div className={pwMsg.startsWith('✅') ? 'card-sub' : 'error-msg'}>{pwMsg}</div>}
          <button type="submit" className="btn btn-primary" disabled={pwSaving}>
            {pwSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <h3 style={{ marginBottom: 6, color: 'var(--danger)' }}>Deactivate account</h3>
        <p className="card-sub" style={{ marginBottom: 14 }}>
          This blocks you from logging in and stops your WhatsApp assistant from replying to customers.
          Your products, orders, and customer history are kept safe — you can reactivate anytime by
          logging back in.
        </p>
        <label>Type DELETE to confirm</label>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          style={{ marginBottom: 10 }}
        />
        {deactivateMsg && <div className="error-msg" style={{ marginBottom: 10 }}>{deactivateMsg}</div>}
        <button
          className="btn btn-danger"
          disabled={confirmText !== 'DELETE' || deactivating}
          onClick={handleDeactivate}
        >
          {deactivating ? 'Deactivating...' : 'Deactivate my account'}
        </button>
      </div>
    </div>
  );
}