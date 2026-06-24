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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">

      {/* Floating skip / close badge — top-right of viewport */}
      <div className="absolute top-4 right-4 z-10">
        {canClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-black/70 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Close ✕
          </button>
        ) : (
          <span className="flex items-center gap-1.5 bg-black/70 text-gray-300 text-xs font-semibold px-4 py-2 rounded-full">
            Skip in {timeLeft}s
          </span>
        )}
      </div>

      {/* Raw ad content — no custom wrapper */}
      <div className="w-full max-w-sm">
        <div dangerouslySetInnerHTML={{ __html: ad.content }} />

        {/* Rewarded-only: progress bar + claim button */}
        {isRewarded && (
          <div className="mt-4">
            {!canClose && (
              <>
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-1000"
                    style={{ width: `${((delay - timeLeft) / delay) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">Watch to earn your reward</p>
              </>
            )}
            {canClose && (
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
              >
                🎁 Claim Your Reward
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
