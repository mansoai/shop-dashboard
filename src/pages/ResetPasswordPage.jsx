import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    // Clicking the emailed link already logs the user in with a temporary
    // "recovery" session, so this directly sets their new password.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(
        error.message.toLowerCase().includes('session')
          ? 'This reset link has expired. Please request a new one.'
          : error.message
      );
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Password updated ✅</h1>
          <p className="tagline">You're all set — taking you to your dashboard.</p>
          <button className="btn btn-primary btn-block" onClick={() => { window.location.href = '/'; }}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Set a new password</h1>
        <p className="tagline">Choose a new password for your account</p>
        <form className="stack" onSubmit={handleSubmit}>
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
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}