import { useState } from 'react';
import api from '../api/axios';
import AdOverlay from './AdOverlay';

export default function PostQuizBonusPopup({ bonusAd, onClose, onCoinsUpdated }) {
  const [phase, setPhase] = useState('idle'); // idle | watching | done | error

  const handleClaim = () => setPhase('watching');

  const handleAdClose = async () => {
    setPhase('done');
    try {
      const res = await api.post('/rewards/ad-bonus');
      onCoinsUpdated?.(res.data.data.newBalance);
    } catch { /* ignore — coins display may be stale */ }
  };

  return (
    <>
      {phase === 'watching' && <AdOverlay ad={bonusAd} onClose={handleAdClose} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={phase === 'done' ? onClose : undefined}
        />
        <div className="relative bg-card border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">

          {phase === 'idle' && (
            <>
              <div className="text-5xl mb-3">🎁</div>
              <h2 className="text-white text-xl font-black mb-2">Claim 100 Bonus Coins!</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Watch a short ad and get <span className="text-yellow-400 font-bold">100 free coins</span> added to your balance instantly.
              </p>
              <button
                onClick={handleClaim}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-2xl text-base active:scale-95 transition-all mb-3 flex items-center justify-center gap-2"
              >
                🪙 Claim 100 Coins
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                No Thanks
              </button>
            </>
          )}

          {phase === 'done' && (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-white text-xl font-black mb-2">+100 Coins Added!</h2>
              <p className="text-gray-400 text-sm mb-6">Coins have been added to your account.</p>
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl text-base active:scale-95 transition-all"
              >
                Continue →
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
