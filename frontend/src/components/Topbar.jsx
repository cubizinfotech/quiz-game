export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-sm border-b border-white/10 flex items-center gap-4 px-4 md:px-6 shrink-0">
      {/* Hamburger — mobile/tablet only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1">
        <h1 className="text-white font-bold text-xl">{title}</h1>
      </div>
    </header>
  );
}
