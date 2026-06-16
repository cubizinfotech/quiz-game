import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import QuizCard from '../components/QuizCard';
import FunFactCard from '../components/FunFactCard';
import AdBlock from '../components/AdBlock';
import AdOverlay from '../components/AdOverlay';
import QuickStartWidget, { LS_KEY } from '../components/QuickStartWidget';

// ─── Onboarding sections (shown below the quiz on first visit) ────────────────

const WHY_FEATURES = [
  { icon: '🏆', title: 'Daily Rewards',   desc: 'Login daily to get bonus coins and special rewards' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Play seamlessly on any device — mobile, tablet, or desktop' },
  { icon: '⚡', title: 'Live Contests',   desc: 'Join real-time quiz competitions with players worldwide' },
];

function WhyChoose() {
  return (
    <section className="px-4 mb-5">
      <div className="bg-card border border-white/10 rounded-2xl p-5">
        <h2 className="text-white text-base font-bold text-center mb-4">
          Why Choose Our Quiz Platform?
        </h2>
        <div className="flex flex-col gap-3">
          {WHY_FEATURES.map((f) => (
            <div key={f.title} className="bg-bg border border-white/10 rounded-xl px-4 py-3.5 text-center">
              <p className="text-white text-sm font-bold mb-1">{f.icon} {f.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Tab Bar ─────────────────────────────────────────────────────────

function CategoryTabs({ categories, activeCategory, onSelect, quizCountByCategory, totalCount }) {
  return (
    <div className="sticky top-14 z-30 bg-bg border-b border-white/10">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2.5 whitespace-nowrap">
          <button
            onClick={() => onSelect(null)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ${
              activeCategory === null
                ? 'bg-primary text-white'
                : 'bg-card text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            All
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === null ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'
            }`}>
              {totalCount}
            </span>
          </button>

          {categories.map((cat) => {
            const count    = quizCountByCategory[cat.id] || 0;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-card text-gray-400 border border-white/10 hover:text-white'
                }`}
              >
                {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [latest, setLatest]         = useState([]);
  const [funFacts, setFunFacts]     = useState([]);
  const [ads, setAds]               = useState({});
  const [settings, setSettings]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [welcomeAd, setWelcomeAd]   = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Onboarding is done when localStorage flag is set (permanent across sessions)
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(LS_KEY) === 'true'
  );

  const welcomeTimerRef = useRef(null);
  const topRef          = useRef(null);

  useEffect(() => {
    const safe = (fn) => fn.catch(() => ({ data: { data: null } }));
    Promise.all([
      safe(api.get('/categories?active=true')),
      safe(api.get('/quizzes/featured')),
      safe(api.get('/quizzes?published=true&limit=200')),
      safe(api.get('/fun-facts')),
      safe(api.get('/ads')),
      safe(api.get('/settings')),
    ]).then(([catRes, featRes, latestRes, factRes, adRes, settRes]) => {
      setCategories(catRes.data.data || []);
      setFeatured(featRes.data.data || []);
      setLatest(latestRes.data.data?.quizzes || []);
      setFunFacts(factRes.data.data || []);
      setSettings(settRes.data.data || {});

      const adMap = {};
      for (const ad of (adRes.data.data || [])) {
        if (!adMap[ad.position]) adMap[ad.position] = ad;
      }
      setAds(adMap);

      const popup = adMap.welcome_popup;
      if (popup && !sessionStorage.getItem('welcome_popup_shown')) {
        const delay = (popup.delaySeconds || 0) * 1000;
        welcomeTimerRef.current = setTimeout(() => setWelcomeAd(popup), delay);
      }
    }).finally(() => setLoading(false));

    return () => clearTimeout(welcomeTimerRef.current);
  }, []);

  const closeWelcomeAd = () => {
    sessionStorage.setItem('welcome_popup_shown', '1');
    setWelcomeAd(null);
  };

  // Called by QuickStartWidget when user clicks "Start Playing"
  const handleOnboardingDone = () => {
    setOnboardingDone(true);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const allQuizzes = useMemo(() => {
    const ids = new Set(featured.map((q) => q.id));
    return [...featured, ...latest.filter((q) => !ids.has(q.id))];
  }, [featured, latest]);

  const quizCountByCategory = useMemo(() => {
    const map = {};
    for (const quiz of allQuizzes) {
      const catId = quiz.category?.id ?? quiz.categoryId;
      if (catId) map[catId] = (map[catId] || 0) + 1;
    }
    return map;
  }, [allQuizzes]);

  const filteredQuizzes = useMemo(() =>
    activeCategory
      ? allQuizzes.filter((q) => (q.category?.id ?? q.categoryId) === activeCategory)
      : allQuizzes,
  [allQuizzes, activeCategory]);

  const displayFeatured = filteredQuizzes.filter((q) => q.isFeatured);
  const displayOthers   = filteredQuizzes.filter((q) => !q.isFeatured);
  const activeCatName   = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.name
    : null;

  if (loading) {
    return (
      <div className="mobile-shell flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mobile-shell pb-6" ref={topRef}>
      {welcomeAd && <AdOverlay ad={welcomeAd} onClose={closeWelcomeAd} />}

      {/* Header Ad — shown in both modes */}
      {ads.header && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
          <AdBlock ad={ads.header} />
        </div>
      )}

      {/* ══ ONBOARDING MODE — first visit ══════════════════════════════════════ */}
      {!onboardingDone && (
        <>
          <div className="pt-3">
            <QuickStartWidget onComplete={handleOnboardingDone} />
          </div>

          <WhyChoose />

          {ads.middle && (
            <div className="px-4 mb-5">
              <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
              <AdBlock ad={ads.middle} />
            </div>
          )}

          {funFacts.length > 0 && (
            <section className="mb-5">
              <div className="px-4 mb-3">
                <h2 className="text-white font-bold text-base">#Fun Fact</h2>
              </div>
              <div className="px-4 flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {funFacts.map((fact) => (
                  <FunFactCard key={fact.id} fact={fact} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ══ MAIN HOME — after onboarding ═══════════════════════════════════════ */}
      {onboardingDone && (
        <>
          {categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              quizCountByCategory={quizCountByCategory}
              totalCount={allQuizzes.length}
            />
          )}

          <div className="pt-4">
            {filteredQuizzes.length === 0 ? (
              <section className="px-4 mb-5">
                <div className="flex flex-col items-center justify-center py-10 text-center bg-card border border-white/10 rounded-2xl">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-white font-semibold text-sm">No quizzes in this category</p>
                  <p className="text-gray-500 text-xs mt-1">Try another category or check back later.</p>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Show All
                  </button>
                </div>
              </section>
            ) : activeCategory ? (
              <section className="mb-5">
                <div className="flex items-center justify-between px-4 mb-3">
                  <h2 className="text-white font-bold text-base">
                    {categories.find((c) => c.id === activeCategory)?.icon || '📚'} {activeCatName}
                  </h2>
                  <span className="text-xs text-gray-400">{filteredQuizzes.length} quizzes</span>
                </div>
                <div className="px-4 flex flex-col gap-3">
                  {filteredQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} featured={quiz.isFeatured} />
                  ))}
                </div>
              </section>
            ) : (
              <>
                {displayFeatured.length > 0 && (
                  <section className="mb-5">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h2 className="text-white font-bold text-base">⭐ Featured</h2>
                    </div>
                    <div className="px-4 flex flex-col gap-3">
                      {displayFeatured.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} featured />
                      ))}
                    </div>
                  </section>
                )}

                {ads.middle && displayFeatured.length > 0 && displayOthers.length > 0 && (
                  <div className="px-4 mb-5">
                    <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
                    <AdBlock ad={ads.middle} />
                  </div>
                )}

                {displayOthers.length > 0 && (
                  <section className="mb-5">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h2 className="text-white font-bold text-base">🎯 Latest Quizzes</h2>
                      <span className="text-xs text-gray-400">{displayOthers.length} quizzes</span>
                    </div>
                    <div className="px-4 flex flex-col gap-3">
                      {displayOthers.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                      ))}
                    </div>
                  </section>
                )}

                {ads.middle && displayFeatured.length === 0 && (
                  <div className="px-4 mb-5">
                    <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
                    <AdBlock ad={ads.middle} />
                  </div>
                )}
              </>
            )}
          </div>

          {funFacts.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-white font-bold text-base">💡 Fun Facts</h2>
              </div>
              <div className="px-4 flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {funFacts.map((fact) => (
                  <FunFactCard key={fact.id} fact={fact} />
                ))}
              </div>
            </section>
          )}

          {ads.footer && (
            <div className="px-4 mb-2">
              <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
              <AdBlock ad={ads.footer} />
            </div>
          )}
        </>
      )}

      <p className="text-center text-gray-600 text-xs px-4 mt-4">
        {settings.footer_text || `© ${new Date().getFullYear()} ${settings.site_name || 'QuizGame'}. All rights reserved.`}
      </p>
    </div>
  );
}