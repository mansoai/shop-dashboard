import { useState } from 'react';
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

  return (
    <div>
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
    </div>
  );
}
