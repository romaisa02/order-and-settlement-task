import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function Profile() {
  const { user, logout, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({ name, email });
      setUser(updated);
      setSuccess('Profile saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    setError('');
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
      setLoggingOut(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Your data</p>
            <h1>Profile</h1>
          </div>
          <button type="button" className="ghost" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
        <p className="lede">Only you can see and change this. Updates are scoped to your account on the server.</p>

        <form onSubmit={onSubmit}>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="success" role="status">
              {success}
            </p>
          ) : null}

          <label>
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>
    </main>
  );
}
