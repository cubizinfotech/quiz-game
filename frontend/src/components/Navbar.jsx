import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar({ onMenuOpen }) {
  const { user } = useUserAuth();
  const [siteName, setSiteName] = useState('QuizGame');

  useEffect(() => {
    api.get('/settings').then((res) => {
      const d = res.data.data;
      setSiteName(d.site_name || 'QuizGame');
      // Apply favicon from settings, fallback to our SVG logo
      const faviconHref = d.favicon || '/logo.svg';
      const link = document.querySelector("link[rel='icon']");
      if (link) link.href = faviconHref;
    }).catch(() => {});
  }, []);

  return (
    <header className="z-10 bg-card border-b border-white/10 shrink-0">
      <div className="relative flex items-center justify-between px-4 py-3">
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

        {/* Site name — absolutely centered */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
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
