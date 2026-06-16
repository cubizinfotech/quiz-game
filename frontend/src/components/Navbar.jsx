import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, isAuthenticated, logout } = useUserAuth();
  const [siteName, setSiteName] = useState('QuizGame');
  const [logo, setLogo] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => {
      setSiteName(res.data.data.site_name || 'QuizGame');
      setLogo(res.data.data.logo || '');
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto object-contain" onError={() => setLogo('')} />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
          )}
          <span className="text-white font-bold text-base">{siteName}</span>
        </Link>

        {/* Right side: nav + auth */}
        <div className="flex items-center gap-1">
          {/* Home nav item */}
          <Link
            to="/"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Auth section */}
          {isAuthenticated ? (
            /* Logged-in user: avatar + dropdown */
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.username?.[0] || 'U'}
                </div>
                {user?.coins > 0 && (
                  <span className="hidden sm:inline text-yellow-400 text-xs font-bold">🪙{user.coins}</span>
                )}
                <span className="hidden sm:inline max-w-[80px] truncate">{user?.username}</span>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-card border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    {(user?.totalPoints > 0 || user?.coins > 0) && (
                      <div className="px-4 py-2 border-b border-white/10 space-y-0.5">
                        {user?.totalPoints > 0 && (
                          <p className="text-yellow-400 text-xs font-semibold">🏆 {user.totalPoints} pts</p>
                        )}
                        {user?.coins > 0 && (
                          <p className="text-yellow-300 text-xs font-semibold">🪙 {user.coins} coins</p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Guest: Login + Sign Up buttons */
            <div className="flex items-center gap-1">
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-lg text-sm bg-primary text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
