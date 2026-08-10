import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="card">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in</h1>
        <p className="lede">Sign in with your email and password to open your profile.</p>

        <form onSubmit={onSubmit}>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="switch">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
