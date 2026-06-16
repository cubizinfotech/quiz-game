import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith('/quiz/') || pathname === '/result';

  return (
    <div className="mobile-shell flex flex-col">
      {!hideNav && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
