import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

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

  // Always reads the CURRENT session fresh (not a possibly-stale closure value),
  // so this is safe to call from anywhere, at any time, including right after
  // signup creates a new shop record.
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
    return showSignup
      ? <Signup onSwitchToLogin={() => setShowSignup(false)} onMerchantCreated={loadMerchant} />
      : <Login onSwitchToSignup={() => setShowSignup(true)} />;
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

  return <Dashboard merchant={merchant} onMerchantUpdated={loadMerchant} />;
}
