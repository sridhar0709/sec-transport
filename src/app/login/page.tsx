'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusFront, LockKeyhole, UserRound, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Supabase Auth requires an email/phone identifier. SEC users enter their ID;
// we map it to this internal email-style Auth username. No email is sent to it.
const LOGIN_DOMAIN = process.env.NEXT_PUBLIC_SEC_LOGIN_DOMAIN || 'sec-transport-login.com';

function toAuthEmail(loginId: string) {
  const normalized = loginId.trim().toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(normalized)) {
    throw new Error('Use only letters, numbers, dots, underscores, or hyphens in your login ID.');
  }
  return `${normalized}@${LOGIN_DOMAIN}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const email = toAuthEmail(loginId);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error('Invalid login ID or password.');

      // Role is read from the protected profiles table, never from a user-selected role.
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Login succeeded, but user verification failed.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Your SEC account is not provisioned. Contact the transport administrator.');
      }

      router.replace('/portal');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand"><span className="auth-brand-icon"><BusFront size={25} /></span><div><b>SEC <span>TRANSPORT</span></b><small>TRANSPORT OPERATIONS</small></div></div>
        <div className="auth-heading"><span className="auth-eyebrow">SHREENIVASA ENGINEERING COLLEGE</span><h1>Welcome back</h1><p>Sign in with your institutional login ID.</p></div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="loginId">Login ID</label>
          <div className="auth-input-wrap"><UserRound size={17}/><input id="loginId" autoComplete="username" placeholder="e.g. admin001 or STU24018" value={loginId} onChange={(e)=>setLoginId(e.target.value)} required /></div>
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap"><LockKeyhole size={17}/><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} required/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={()=>setShowPassword(v=>!v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'} <span>→</span></button>
        </form>
        <div className="auth-footer"><LockKeyhole size={13}/> Access is managed by SEC Transport Administration.</div>
      </section>
      <div className="auth-side-note"><span className="auth-live-dot"/> SEC TRANSPORT · Secure college mobility</div>
    </main>
  );
}
