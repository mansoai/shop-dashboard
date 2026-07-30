import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Check your email 📩</h1>
          <p className="tagline">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
          </p>
          <button className="btn btn-secondary btn-block" onClick={onSwitchToLogin}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Reset your password</h1>
        <p className="tagline">Enter your email and we'll send you a reset link</p>
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          <button
            type="button"
            className="logout-link"
            style={{ textDecoration: 'underline', color: 'var(--accent)' }}
            onClick={onSwitchToLogin}
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}