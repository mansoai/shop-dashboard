import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!session) return;
    loadMerchant();
  }, [session]);

  async function loadMerchant() {
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setMerchant(data);
  }

  if (loading) return null;

  if (!session) {
    return showSignup
      ? <Signup onSwitchToLogin={() => setShowSignup(false)} />
      : <Login onSwitchToSignup={() => setShowSignup(true)} />;
  }

  if (!merchant) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>No shop linked yet</h1>
          <p className="tagline">This login isn't connected to a shop. Contact support to get set up.</p>
          <button className="btn btn-secondary btn-block" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  return <Dashboard merchant={merchant} />;
}
