import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — offset by sidebar width on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
