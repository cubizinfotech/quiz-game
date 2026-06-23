import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import UserSidebar from './UserSidebar';

export default function Layout() {
  const { pathname } = useLocation();
  const hideNav = /^\/quiz\/.+\/play$/.test(pathname) || pathname === '/result';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {!hideNav && <Navbar onMenuOpen={() => setSidebarOpen(true)} />}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
