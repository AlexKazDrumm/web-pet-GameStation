import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <span>GameStation</span>
          <span>Крестики-нолики · Камень-ножницы-бумага</span>
        </div>
      </footer>
    </div>
  );
}
