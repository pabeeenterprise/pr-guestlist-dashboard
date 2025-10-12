import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'loading'|'ready'|'success'|'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // 1. Parse fragment from URL
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const refresh = params.get('refresh_token');

    if (!token || !refresh) {
      setErrorMsg('Invalid reset link.');
      setStatus('error');
      return;
    }

    // 2. Set session for recovery
    supabase.auth.setSession({ access_token: token, refresh_token: refresh })
      .then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus('error');
        } else {
          setStatus('ready');
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error')   return <p style={{ color: 'red' }}>{errorMsg}</p>;
  if (status === 'success') return <p>Password reset! <a href="/login">Sign in</a>.</p>;

  // ready
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button type="submit">Update Password</button>
    </form>
  );
}
