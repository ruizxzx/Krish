import { loginAction } from './actions';
import { SiteCursor } from '@/components/SiteEffects';

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <SiteCursor />
      <main className="admin-login">
      <div className="admin-login-card">
        <div className="admin-eyebrow">KRISH / CMS</div>
        <h1>Content<br/><span>Studio.</span></h1>
        <p>Sign in to edit the portfolio, projects, motion settings and contact surface.</p>
        {error === 'config' && <div className="admin-alert">Supabase is not configured. Add the variables from <code>.env.example</code>.</div>}
        {error === 'invalid' && <div className="admin-alert">Invalid credentials or email is not an allowed portfolio admin.</div>}
        {error === 'missing' && <div className="admin-alert">Enter both email and password.</div>}
        <form action={loginAction} className="admin-form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit">Enter Studio ↗</button>
        </form>
        <a className="admin-back" href="/">← Back to site</a>
      </div>
      </main>
    </>
  );
}
