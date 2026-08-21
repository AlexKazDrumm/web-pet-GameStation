import { NavLink, useNavigate } from 'react-router-dom';
import { displayName } from '../../lib/format';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../ui/Button';
import styles from './Navbar.module.css';

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `${styles.link} ${isActive ? styles.active : ''}`;

export function Navbar() {
  const navigate = useNavigate();
  const { token, user, clear } = useAuthStore();
  const authed = Boolean(token);

  const signOut = (): void => {
    clear();
    navigate('/');
  };

  return (
    <header className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          GameStation
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" end className={linkClass}>
            Игры
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Лидеры
          </NavLink>
          <NavLink to="/reviews" className={linkClass}>
            Отзывы
          </NavLink>

          {authed && (
            <>
              <NavLink to="/messages" className={linkClass}>
                Сообщения
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Профиль
              </NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={linkClass}>
                  Админ
                </NavLink>
              )}
              <span className={styles.sep} aria-hidden="true" />
              <span className={styles.who}>{user ? displayName(user.email) : ''}</span>
              <Button size="sm" onClick={signOut}>
                Выйти
              </Button>
            </>
          )}

          {!authed && (
            <>
              <span className={styles.sep} aria-hidden="true" />
              <Button size="sm" variant="primary" onClick={() => navigate('/login')}>
                Войти
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
