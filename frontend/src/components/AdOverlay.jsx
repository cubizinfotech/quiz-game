import { useEffect, useState } from 'react';

export default function AdOverlay({ ad, onClose }) {
  const delay = ad?.delaySeconds ?? 0;
  const isRewarded = ad?.position === 'rewarded_video';
  const [timeLeft, setTimeLeft] = useState(delay);
  const [canClose, setCanClose] = useState(delay === 0);

  useEffect(() => {
    if (delay <= 0) { setCanClose(true); return; }
    setTimeLeft(delay);
    setCanClose(false);
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); setCanClose(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [delay]);

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4">
      <div className="relative w-full max-w-sm bg-[#1F2937] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            {isRewarded ? '🎁 Rewarded Ad' : 'Advertisement'}
          </span>
          {canClose ? (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              aria-label="Close ad"
            >
              ✕
            </button>
          ) : (
            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-yellow-400 tabular-nums">
              {timeLeft}
            </span>
          )}
        </div>

        {/* Ad content */}
        <div
          className="p-4 min-h-[80px]"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />

        {/* Rewarded: progress bar while waiting */}
        {isRewarded && !canClose && (
          <div className="px-4 pb-4">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-1000"
                style={{ width: `${((delay - timeLeft) / delay) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Watch to earn your reward</p>
          </div>
        )}

        {/* Rewarded: claim button after countdown */}
        {isRewarded && canClose && (
          <div className="px-4 pb-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
            >
              🎁 Claim Your Reward
            </button>
          </div>
        )}

        {/* Non-rewarded: skip button when canClose */}
        {!isRewarded && canClose && (
          <div className="px-4 pb-4 -mt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 rounded-xl text-sm transition-colors"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
