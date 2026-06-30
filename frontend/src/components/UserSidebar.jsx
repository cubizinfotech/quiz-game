import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

const NAV_ITEMS = [
  { to: '/',               label: 'Home',            icon: <HomeIcon /> },
  { to: '/contest-rules',  label: 'Contest Rules',   icon: <TrophyIcon /> },
  { to: '/coin-history',   label: 'Coin History',    icon: <HistoryIcon /> },
  { to: '/blog',           label: 'Blog',            icon: <BlogIcon /> },
  { to: '/contact',        label: 'Contact Us',      icon: <ContactIcon /> },
  { to: '/report',          label: 'Report an Issue', icon: <ReportIcon /> },
  { to: '/about',           label: 'About Us',        icon: <AboutIcon /> },
  { to: '/privacy-policy', label: 'Privacy Policy',  icon: <PrivacyIcon /> },
];

export default function UserSidebar({ open, onClose }) {
  const { user, isGuest, logout } = useUserAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleSignIn = () => { onClose(); navigate('/login'); };
  const handleLogout = async () => { onClose(); await logout(); navigate('/'); };

  return (
    <>
      {open && (
        <div className="absolute inset-0 bg-black/60 z-40" onClick={onClose} />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-50 w-72 bg-bg border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User section */}
        <div className="relative px-5 pt-6 pb-5 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>

          <div className="w-16 h-16 rounded-full bg-card border-2 border-white/10 flex items-center justify-center mb-3 overflow-hidden">
            {!isGuest ? (
              <span className="text-white text-2xl font-black">
                {(user?.username?.[0] || 'U').toUpperCase()}
              </span>
            ) : (
              <svg className="w-9 h-9 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>

          <p className="text-white font-bold text-lg leading-tight">
            {isGuest ? 'Guest' : user?.username}
          </p>
          <p className="text-gray-400 text-sm mb-4">Play Quiz &amp; earn coins</p>

          {isGuest ? (
            <button
              onClick={handleSignIn}
              className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors uppercase tracking-widest"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center justify-between">
              {user?.coins > 0 && (
                <span className="text-yellow-400 text-sm font-bold">🪙 {user.coins} coins</span>
              )}
              <button
                onClick={handleLogout}
                className="text-red-400 text-sm hover:text-red-300 transition-colors ml-auto"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-4 px-5 py-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
