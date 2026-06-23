import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar({ onMenuOpen }) {
  const { user } = useUserAuth();
  const [siteName, setSiteName] = useState('QuizGame');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    api.get('/settings').then((res) => {
      setSiteName(res.data.data.site_name || 'QuizGame');
      setLogo(res.data.data.logo || '');
    }).catch(() => {});
  }, []);

  return (
    <header className="z-10 bg-card border-b border-white/10 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuOpen}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <span className="w-5 h-0.5 bg-current rounded-full" />
          <span className="w-5 h-0.5 bg-current rounded-full" />
          <span className="w-5 h-0.5 bg-current rounded-full" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 flex-1">
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto object-contain" onError={() => setLogo('')} />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
          )}
          <span className="text-white font-bold text-base">{siteName}</span>
        </Link>

        {/* Coins badge */}
        <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-full px-3 py-1.5 shrink-0">
          <span className="text-base leading-none">🪙</span>
          <span className="text-yellow-400 font-bold text-sm tabular-nums">
            {user?.coins ?? 0}
          </span>
        </div>
      </div>
    </header>
  );
}
