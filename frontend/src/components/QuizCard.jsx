import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdOverlay from './AdOverlay';
import { useUserAuth } from '../context/UserAuthContext';

export default function QuizCard({ quiz, ads = {} }) {
  const navigate = useNavigate();
  const { user, isGuest, updateCoins } = useUserAuth();

  const [showModal, setShowModal]     = useState(false);
  const [rewardedAd, setRewardedAd]   = useState(null);
  const [showAd, setShowAd]           = useState(false);
  const [awarding, setAwarding]       = useState(false);
  const [showClickAd, setShowClickAd] = useState(false);
  const [clickAd, setClickAd]         = useState(null);

  const questionCount = quiz._count?.questions ?? 0;
  const playCount     = quiz._count?.quizAttempts ?? quiz.totalPlays ?? 0;
  const entryFee      = quiz.entryFee ?? 0;
  const winCoins      = questionCount * 100;
  const userCoins     = user?.coins ?? 0;
  const insufficient  = entryFee > 0 && userCoins < entryFee;

  const goToQuiz = () => navigate(`/quiz/${quiz.slug}`);

  const handleClick = () => {
    if (insufficient) {
      // Prefetch rewarded ad while showing modal
      api.get('/ads').then((res) => {
        const rewarded = (res.data.data || []).find((a) => a.position === 'rewarded_video');
        setRewardedAd(rewarded ?? null);
      }).catch(() => setRewardedAd(null));
      setShowModal(true);
    } else {
      // Show quiz-card-click ad if configured, then navigate
      const quizClickAd = ads?.quiz_card_click;
      if (quizClickAd) {
        setClickAd(quizClickAd);
        setShowClickAd(true);
      } else {
        goToQuiz();
      }
    }
  };

  const handleClickAdClose = () => {
    setShowClickAd(false);
    goToQuiz();
  };

  const handleWatchAds = () => {
    setShowModal(false);
    if (rewardedAd) {
      setShowAd(true);
    }
  };

  const handleAdClose = async () => {
    setShowAd(false);
    setAwarding(true);
    try {
      const res = await api.post('/rewards/ad-bonus');
      updateCoins(res.data.data.newBalance);
    } catch {}
    setAwarding(false);
  };

  return (
    <>
      {/* Ad shown on quiz card click (before navigating to lobby) */}
      {showClickAd && clickAd && (
        <AdOverlay ad={clickAd} onClose={handleClickAdClose} />
      )}

      {/* Rewarded ad overlay for insufficient-coins flow */}
      {showAd && rewardedAd && (
        <AdOverlay ad={rewardedAd} onClose={handleAdClose} />
      )}

      {/* Insufficient coins popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 text-center w-full max-w-xs shadow-2xl">
            <p className="text-gray-800 text-base font-semibold leading-relaxed mb-6">
              You don't have enough coins to play this contest. Click on video ad to get 100 reward coins.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleWatchAds}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
              >
                Watch Ads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        onClick={handleClick}
        className="flex items-center gap-3 bg-card border border-white/10 hover:border-primary/40 rounded-2xl p-3 transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center text-2xl">
          {quiz.thumbnail
            ? <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover" />
            : <span>{quiz.category?.icon || '🎯'}</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Category + featured */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {quiz.category && (
              <span className="text-primary text-xs font-semibold truncate">{quiz.category.name}</span>
            )}
            {quiz.isFeatured && (
              <span className="shrink-0 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">⭐ Featured</span>
            )}
          </div>

          {/* Title */}
          <p className="text-white text-sm font-bold leading-snug mb-1.5">
            Play and Win&nbsp;🪙&nbsp;<span className="text-yellow-400">{winCoins}</span>
          </p>

          {/* Entry fee badge */}
          {entryFee > 0 ? (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${
              insufficient
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              Entry Fee&nbsp;🪙&nbsp;{entryFee}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-2 py-0.5 rounded-lg">
              ✓ Free Entry
            </span>
          )}
        </div>

        {/* Play button */}
        <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          insufficient ? 'bg-gray-600 shadow-none' : 'bg-primary shadow-primary/30'
        }`}>
          {awarding ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>
    </>
  );
}
