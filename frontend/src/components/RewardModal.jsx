import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AdOverlay from './AdOverlay';

/**
 * RewardModal — shown after a quiz is submitted.
 *
 * Props:
 *   attempt      — QuizAttempt object (must have .id and .score)
 *   quiz         — Quiz object (must have .rewardCoins)
 *   isGuest      — boolean
 *   rewardedAd   — Ad object for rewarded-video, or null
 *   onClose      — called when user dismisses the modal
 *   onCoinsUpdated(newBalance) — called after a successful claim
 */
export default function RewardModal({ attempt, quiz, isGuest, rewardedAd, onClose, onCoinsUpdated, coinsEarned: earnedCoins }) {
  const [phase, setPhase] = useState('idle'); // idle | claiming | claimed | error | watching_ad
  const [result, setResult] = useState(null);  // { coinsEarned, newBalance, doubled }
  const [errorMsg, setErrorMsg] = useState('');

  // earnedCoins comes from submitAttempt response (correct * 100)
  const baseCoins = earnedCoins ?? ((attempt?.correctAnswers ?? 0) * 100);
  const doubleCoins = baseCoins * 2;

  const claim = async (doubled = false) => {
    setPhase('claiming');
    setErrorMsg('');
    try {
      const res = await api.post('/rewards/claim', { attemptId: attempt.id, doubled });
      setResult(res.data.data);
      setPhase('claimed');
      onCoinsUpdated?.(res.data.data.newBalance);
    } catch (err) {
      const data = err.response?.data;
      if (data?.data?.alreadyClaimed) {
        setErrorMsg('You already claimed this reward.');
        setPhase('error');
      } else {
        setErrorMsg(data?.message || 'Failed to claim reward. Try again.');
        setPhase('error');
      }
    }
  };

  const handleWatchAd = () => setPhase('watching_ad');
  const handleAdClose = () => {
    // Ad finished → claim with double
    claim(true);
  };

  const getScoreLabel = () => {
    if (attempt?.score === 100) return { emoji: '🏆', label: 'Perfect!' };
    if (attempt?.score >= 80) return { emoji: '🌟', label: 'Excellent!' };
    if (attempt?.score >= 60) return { emoji: '⭐', label: 'Good Job!' };
    if (attempt?.score >= 40) return { emoji: '💪', label: 'Keep Going!' };
    return { emoji: '🎯', label: 'Try Again!' };
  };

  const { emoji, label } = getScoreLabel();

  return (
    <>
      {/* Rewarded ad overlay — shown when user opts to double */}
      {phase === 'watching_ad' && rewardedAd && (
        <AdOverlay ad={rewardedAd} onClose={handleAdClose} />
      )}

      {/* Modal backdrop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={phase === 'claimed' || phase === 'error' ? onClose : undefined} />

        <div className="relative w-full max-w-md mx-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">

          {/* Score badge */}
          <div className="text-center mb-5">
            <div className="text-5xl mb-2">{emoji}</div>
            <h2 className="text-white text-xl font-black">{label}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Score: <span className="text-white font-bold">{attempt?.score}%</span>
            </p>
          </div>

          {/* ── IDLE: show reward info + action buttons ── */}
          {(phase === 'idle' || phase === 'claiming') && (
            <>
              {/* Coin reward display */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-5 text-center">
                <p className="text-gray-400 text-xs mb-1">Your Reward</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🪙</span>
                  <span className="text-yellow-400 text-4xl font-black">{baseCoins}</span>
                  <span className="text-yellow-300 text-lg font-semibold">Coins</span>
                </div>
                {baseCoins === 0 && (
                  <p className="text-gray-500 text-xs mt-1">Score higher to earn coins!</p>
                )}
              </div>

              {/* Guest CTA */}
              {isGuest ? (
                <div className="mb-4">
                  <div className="bg-primary/15 border border-primary/30 rounded-xl p-4 text-center mb-3">
                    <p className="text-white text-sm font-bold mb-1">Save your coins!</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Create a free account to permanently save your coins and compete on the leaderboard.
                    </p>
                  </div>
                  <Link
                    to="/signup"
                    className="block w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm text-center hover:bg-blue-600 active:scale-95 transition-all mb-2"
                  >
                    Create Free Account
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full py-3 border border-white/10 text-gray-400 rounded-xl text-sm hover:text-white transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Double reward via ad */}
                  {rewardedAd && baseCoins > 0 && (
                    <button
                      onClick={handleWatchAd}
                      disabled={phase === 'claiming'}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl text-sm hover:from-yellow-400 hover:to-orange-400 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>🎬 Watch Ad</span>
                      <span className="bg-black/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                        {baseCoins} → {doubleCoins} Coins
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => claim(false)}
                    disabled={phase === 'claiming' || baseCoins === 0}
                    className="w-full py-3.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-bold rounded-xl text-sm hover:bg-yellow-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {phase === 'claiming'
                      ? '⏳ Claiming…'
                      : baseCoins > 0
                        ? `🪙 Claim ${baseCoins} Coins`
                        : 'No coins this round'}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CLAIMED: show success ── */}
          {phase === 'claimed' && result && (
            <div className="text-center">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-5">
                {result.doubled && (
                  <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-lg mb-3">
                    🎬 DOUBLED!
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">🪙</span>
                  <span className="text-yellow-400 text-4xl font-black">+{result.coinsEarned}</span>
                </div>
                <p className="text-gray-400 text-xs">Coins earned this round</p>
                <div className="mt-3 pt-3 border-t border-yellow-500/20">
                  <p className="text-gray-500 text-xs">New Balance</p>
                  <p className="text-white text-2xl font-black">{result.newBalance} <span className="text-yellow-400 text-lg">🪙</span></p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 active:scale-95 transition-all"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5">
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
