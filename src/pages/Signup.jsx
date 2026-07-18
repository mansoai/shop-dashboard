import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Signup({ onSwitchToLogin, onMerchantCreated }) {
  const [shopName, setShopName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Create the login
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const newUser = signUpData.user;
    if (!newUser) {
      setError('Something went wrong creating your account. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Create the shop record linked to this login
    const { error: merchantError } = await supabase.from('merchants').insert({
      user_id: newUser.id,
      name: shopName.trim(),
      whatsapp_number: whatsappNumber.trim()
    });

    setLoading(false);

    if (merchantError) {
      setError('Account created, but we could not set up your shop: ' + merchantError.message);
      return;
    }

    // If email confirmation is required, there won't be an active session yet
    if (!signUpData.session) {
      setCheckEmail(true);
    } else {
      // Session is already active - tell the parent to re-check for the
      // shop record NOW that we know it actually exists, instead of relying
      // on the earlier automatic check that may have run too early.
      await onMerchantCreated?.();
    }
  }

  if (checkEmail) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Check your email 📩</h1>
          <p className="tagline">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
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
        <h1>Set up your shop</h1>
        <p className="tagline">Create your account to manage your shop on Manso AI</p>
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shopName">Shop name</label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Auntie Ama's Kitchen"
              required
            />
          </div>
          <div>
            <label htmlFor="whatsappNumber">Your WhatsApp number</label>
            <input
              id="whatsappNumber"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 233241234567"
              required
            />
          </div>
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
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating your shop...' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          Already have an account?{' '}
          <button
            type="button"
            className="logout-link"
            style={{ textDecoration: 'underline', color: 'var(--accent)' }}
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
