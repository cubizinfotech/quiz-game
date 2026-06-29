import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import AdBlock from '../components/AdBlock';
import { useUserAuth } from '../context/UserAuthContext';

export default function QuizLobbyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isGuest, user, updateCoins } = useUserAuth();

  const { state: locationState } = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const safe = (fn) => fn.catch(() => ({ data: { data: null } }));
    Promise.all([
      api.get(`/quizzes/${slug}`),
      safe(api.get('/ads')),
    ]).then(([quizRes, adsRes]) => {
      const data = quizRes.data.data;
      if (!data) { navigate('/', { replace: true }); return; }
      setQuiz(data);
      for (const a of (adsRes.data.data || [])) {
        if (a.position === 'header') { setAd(a); break; }
      }
    }).catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) return null;

  const questionCount = quiz.questions?.length ?? quiz._count?.questions ?? 0;
  const totalCoins    = questionCount * 100;
  const timeLimit     = quiz.timeLimit ?? 200;
  const entryFee      = quiz.entryFee ?? 0;
  const userCoins     = user?.coins ?? 0;

  const startQuiz = () => navigate(`/quiz/${slug}/play`);

  const joinNow = async () => {
    setJoinError('');
    setJoining(true);
    try {
      const res = await api.post(`/quizzes/${quiz.id}/join`);
      const { newBalance } = res.data.data;
      if (newBalance != null) updateCoins(newBalance);
      startQuiz();
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 402) {
        const need = data?.data?.required ?? entryFee;
        const have = data?.data?.balance ?? userCoins;
        setJoinError(`You need 🪙 ${need} coins to join. You only have 🪙 ${have}.`);
      } else if (status === 401) {
        navigate('/login', { state: { from: `/quiz/${slug}` } });
      } else {
        setJoinError('Something went wrong. Please try again.');
      }
      setJoining(false);
    }
  };

  return (
    <div className="pb-10">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Ad banner */}
      {ad && (
        <div className="px-4 pt-3 pb-1">
          <AdBlock ad={ad} />
          <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mt-1">Advertisement</p>
        </div>
      )}

      {/* Redirected-back insufficient coins banner */}
      {locationState?.insufficientCoins && !joinError && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-red-400 text-lg shrink-0">&#9888;&#65039;</span>
          <p className="text-red-300 text-sm">You don&apos;t have enough coins to play this quiz.</p>
        </div>
      )}

      {/* Quiz info card */}
      <div className="mx-4 mt-4 bg-card border border-white/10 rounded-2xl p-5">
        {/* Quiz identity */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center text-3xl shrink-0">
            {quiz.thumbnail
              ? <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover" />
              : <span>{quiz.category?.icon || '🎯'}</span>
            }
          </div>
          <div className="min-w-0">
            {quiz.category && (
              <p className="text-primary text-xs font-bold uppercase tracking-wide mb-0.5">
                {quiz.category.name}
              </p>
            )}
            <h2 className="text-white text-base font-bold leading-snug mb-1.5">
              Play and Win&nbsp;🪙&nbsp;<span className="text-yellow-400">{totalCoins}</span>
            </h2>
            {entryFee > 0 ? (
              <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Entry Fee&nbsp;🪙&nbsp;{entryFee}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                ✓ Free Entry
              </span>
            )}
          </div>
        </div>

        {/* Join error */}
        {joinError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-red-400 text-lg shrink-0">⚠️</span>
            <p className="text-red-300 text-sm">{joinError}</p>
          </div>
        )}

        {/* Join button */}
        <button
          onClick={joinNow}
          disabled={joining}
          className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl text-base active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Joining…
            </>
          ) : entryFee > 0 ? `Join Now · 🪙 ${entryFee}` : 'Join Now'}
        </button>

        {/* Guest CTA — prompt to create an account (no bypass) */}
        {isGuest && (
          <p className="text-center text-gray-500 text-xs mt-3">
            <button
              onClick={() => navigate('/signup', { state: { from: `/quiz/${slug}` } })}
              className="text-primary hover:underline font-semibold"
            >
              Create a free account
            </button>
            {' '}to save your coins &amp; progress
          </p>
        )}
      </div>

      {/* Rules */}
      <ul className="mx-4 mt-6 space-y-3.5">
        {[
          `You have ${timeLimit} seconds to answer all questions`,
          'Answer as many questions as you can',
          'For every correct answer you will get 100 coins',
          'You can take help by using the lifelines present in the contest.',
          'Lifelines can be used for free or by using a given amount of coins for each lifeline.',
        ].map((rule, i) => (
          <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm leading-relaxed">
            <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}
