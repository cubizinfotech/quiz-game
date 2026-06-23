import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useUserAuth } from '../context/UserAuthContext';

export default function CoinHistoryPage() {
  const navigate = useNavigate();
  const { isGuest, user } = useUserAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) { setLoading(false); return; }
    api.get('/users/history')
      .then((res) => setHistory(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isGuest]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalCoins = history.reduce((sum, h) => sum + (h.coinsEarned || 0), 0);

  return (
    <div className="mobile-shell min-h-screen bg-bg pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
        >
          ←
        </button>
        <h1 className="text-white font-bold text-lg">Coin History</h1>
      </div>

      {isGuest ? (
        <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-lg mb-2">Sign in to view history</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Create a free account to track your coins and quiz progress.
          </p>
          <Link
            to="/login"
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center pt-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 pt-5 space-y-4">
          {/* Balance card */}
          <div className="bg-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
              <span className="text-3xl">🪙</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Current Balance</p>
              <p className="text-yellow-400 text-3xl font-black">{user?.coins ?? 0}</p>
              <p className="text-gray-500 text-xs">coins</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-white font-semibold text-sm">No history yet</p>
              <p className="text-gray-500 text-xs mt-1">Complete a quiz to start earning coins!</p>
              <Link
                to="/"
                className="mt-4 px-5 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition-colors"
              >
                Browse Quizzes
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-xs px-1">
                {history.length} quiz{history.length !== 1 ? 'zes' : ''} completed
              </p>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary text-base">🎯</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{item.quizTitle}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.correctAnswers}/{item.totalQuestions} correct · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-yellow-400 font-bold text-sm">+{item.coinsEarned ?? 0}</p>
                      <p className="text-gray-600 text-xs">coins</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
