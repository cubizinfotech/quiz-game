import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/quizzes', label: 'Quizzes', icon: '🎯' },
  { to: '/admin/categories', label: 'Categories', icon: '📚' },
  { to: '/admin/ads', label: 'Advertisements', icon: '📢' },
  { to: '/admin/fun-facts', label: 'Fun Facts', icon: '💡' },
  { to: '/admin/quick-start', label: 'Quick Start Quiz', icon: '🚀' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <span className="text-white font-black text-lg">Q</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-none">Quziky</p>
            <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <span className="w-5 text-center text-base">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
              Site
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="w-5 text-center text-base">🌐</span>
              <span>View Site</span>
            </a>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
              <span className="text-blue-400 text-xs font-bold">
                {(admin?.name || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{admin?.name || 'Admin'}</p>
              <p className="text-slate-500 text-xs truncate">{admin?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-500 hover:text-red-400 transition-colors text-base shrink-0"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
