import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (!user) {
    return null;
  }

  const initial = (user.name.trim().charAt(0) || user.email.charAt(0) || '?').toUpperCase();

  async function onLogout() {
    setLogoutError('');
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      setLogoutError(err instanceof ApiError ? err.message : 'Something went wrong');
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Orders
        </Link>

        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="user-menu-trigger"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="user-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="user-menu-label">{user.name}</span>
          </button>

          {menuOpen ? (
            <div className="user-menu-dropdown" role="menu">
              <div className="user-menu-meta">
                <p className="user-menu-name">{user.name}</p>
                <p className="user-menu-email">{user.email}</p>
              </div>
              <Link to="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <button type="button" role="menuitem" onClick={onLogout} disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Log out'}
              </button>
              {logoutError ? (
                <p className="error user-menu-error" role="alert">
                  {logoutError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <Outlet />
    </div>
  );
}
