import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  // Public pages (no login required) - checked first, before any auth logic
  const path = window.location.pathname;
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/about') return <AboutPage />;
  if (path === '/reset-password') return <ResetPasswordPage />;

  const [session, setSession] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgotPassword'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) setMerchant(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadMerchant = useCallback(async () => {
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (!freshSession) return null;
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', freshSession.user.id)
      .single();
    setMerchant(data);
    return data;
  }, []);

  useEffect(() => {
    if (!session) return;
    loadMerchant();
  }, [session, loadMerchant]);

  if (loading) return null;

  if (!session) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} onMerchantCreated={loadMerchant} />;
    }
    if (authView === 'forgotPassword') {
      return <ForgotPasswordPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onSwitchToSignup={() => setAuthView('signup')}
        onSwitchToForgotPassword={() => setAuthView('forgotPassword')}
      />
    );
  }

  if (!merchant) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Setting up your shop…</h1>
          <p className="tagline">This should only take a moment. If this doesn't update, tap the button below.</p>
          <button className="btn btn-secondary btn-block" onClick={loadMerchant}>
            Check again
          </button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (merchant.is_active === false) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Account deactivated</h1>
          <p className="tagline">
            This account has been deactivated. Your data is safe. Contact support if you'd like to reactivate it.
          </p>
          <button className="btn btn-secondary btn-block" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard merchant={merchant} onMerchantUpdated={loadMerchant} />;
}