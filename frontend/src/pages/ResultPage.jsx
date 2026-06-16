import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import RewardModal from '../components/RewardModal';
import { useUserAuth } from '../context/UserAuthContext';

const OPTION_KEYS = { A: 'optionA', B: 'optionB', C: 'optionC', D: 'optionD' };

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isGuest, updateCoins } = useUserAuth();

  const [rewardedAd, setRewardedAd] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [coinBalance, setCoinBalance] = useState(null);

  useEffect(() => {
    if (!state?.attempt) { navigate('/', { replace: true }); return; }
    const safe = (fn) => fn.catch(() => ({ data: { data: null } }));
    safe(api.get('/ads')).then((res) => {
      for (const ad of (res.data.data || [])) {
        if (ad.position === 'rewarded_video') { setRewardedAd(ad); break; }
      }
    });
    // Show reward modal automatically after a short delay
    const t = setTimeout(() => setShowRewardModal(true), 600);
    return () => clearTimeout(t);
  }, [state, navigate]);

  if (!state?.attempt) return null;

  const { attempt, detailedAnswers, questions, quiz } = state;
  const { score, correctAnswers, wrongAnswers, totalQuestions, pointsEarned } = attempt;

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreEmoji = () => {
    if (score === 100) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 50) return '👍';
    return '💪';
  };

  const getScoreMessage = () => {
    if (score === 100) return 'Perfect Score!';
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good Job!';
    if (score >= 40) return 'Keep Practicing!';
    return 'Better Luck Next Time!';
  };

  const handleCoinsUpdated = (newBalance) => {
    setCoinBalance(newBalance);
    updateCoins?.(newBalance);
  };

  return (
    <div className="mobile-shell pb-8 bg-bg">
      {/* Reward Modal */}
      {showRewardModal && (
        <RewardModal
          attempt={attempt}
          quiz={quiz}
          isGuest={isGuest}
          rewardedAd={rewardedAd}
          onClose={() => setShowRewardModal(false)}
          onCoinsUpdated={handleCoinsUpdated}
        />
      )}

      {/* Score Hero */}
      <div className="px-4 pt-8 pb-5">
        <div className="bg-gradient-to-br from-card to-bg border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3">{getScoreEmoji()}</div>
          <h1 className="text-white text-xl font-bold mb-1">{getScoreMessage()}</h1>
          <p className="text-gray-400 text-sm mb-5">{quiz?.title}</p>

          <div className={`text-6xl font-black mb-1 ${getScoreColor()}`}>
            {score}%
          </div>
          <p className="text-gray-400 text-sm">Your Score</p>

          {pointsEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-xl">
              <span>🏆</span>
              <span className="font-bold">+{pointsEarned} points earned!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{totalQuestions}</div>
            <div className="text-gray-400 text-xs mt-1">Total</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{correctAnswers}</div>
            <div className="text-green-400 text-xs mt-1">Correct</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-red-400">{wrongAnswers}</div>
            <div className="text-red-400 text-xs mt-1">Wrong</div>
          </div>
        </div>
      </div>

      {/* Coin Balance (shown after claiming) */}
      {coinBalance !== null && (
        <div className="px-4 mb-5">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-white text-sm font-bold">Coin Balance</p>
                <p className="text-gray-400 text-xs">Updated just now</p>
              </div>
            </div>
            <span className="text-yellow-400 text-2xl font-black">{coinBalance}</span>
          </div>
        </div>
      )}

      {/* Signup CTA — shown to guests only */}
      {isGuest && (
        <div className="px-4 mb-5">
          <div className="bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/40 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📈</span>
              <div>
                <p className="text-white font-bold text-sm mb-1">Save your progress!</p>
                <p className="text-gray-300 text-xs leading-relaxed mb-3">
                  Create a free account to track your scores, earn coins, and appear on the leaderboard.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/signup"
                    state={{ from: '/result' }}
                    className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl text-center hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    state={{ from: '/result' }}
                    className="px-4 py-2.5 border border-white/20 text-gray-300 text-sm font-semibold rounded-xl text-center hover:border-white/40 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 mb-6 flex flex-col gap-3">
        {/* Reopen reward modal if not yet dismissed */}
        {!showRewardModal && (
          <button
            onClick={() => setShowRewardModal(true)}
            className="w-full py-3.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold rounded-2xl text-sm hover:bg-yellow-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            🪙 View Reward
          </button>
        )}
        <Link
          to={`/quiz/${quiz?.slug}`}
          className="w-full py-4 bg-primary text-white text-base font-bold rounded-2xl text-center hover:bg-blue-600 active:scale-95 transition-all"
        >
          🔁 Play Again
        </Link>
        <Link
          to="/"
          className="w-full py-4 bg-card border border-white/10 text-white text-base font-semibold rounded-2xl text-center hover:border-primary/50 active:scale-95 transition-all"
        >
          🏠 Home
        </Link>
      </div>

      {/* Answer Review */}
      {detailedAnswers?.length > 0 && (
        <div className="px-4">
          <h2 className="text-white font-bold text-base mb-3">📋 Answer Review</h2>
          <div className="flex flex-col gap-3">
            {detailedAnswers.map((ans, i) => {
              const q = questions?.find((q) => q.id === ans.questionId);
              return (
                <div
                  key={ans.questionId}
                  className={`rounded-2xl border p-4 ${
                    ans.isCorrect
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      ans.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {ans.isCorrect ? '✓' : '✗'}
                    </span>
                    <p className="text-white text-sm leading-snug">{q?.questionText || `Question ${i + 1}`}</p>
                  </div>

                  <div className="flex flex-col gap-1 pl-8">
                    {!ans.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 w-16 shrink-0">Your answer:</span>
                        <span className="text-xs text-red-300 bg-red-500/20 px-2 py-0.5 rounded-lg">
                          {ans.selectedAnswer}: {q?.[OPTION_KEYS[ans.selectedAnswer]] || ans.selectedAnswer}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 w-16 shrink-0">Correct:</span>
                      <span className="text-xs text-green-300 bg-green-500/20 px-2 py-0.5 rounded-lg">
                        {ans.correctAnswer}: {q?.[OPTION_KEYS[ans.correctAnswer]] || ans.correctAnswer}
                      </span>
                    </div>
                    {ans.explanation && (
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">💡 {ans.explanation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
