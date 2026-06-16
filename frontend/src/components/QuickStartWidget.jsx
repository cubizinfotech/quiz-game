import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useUserAuth } from '../context/UserAuthContext';

const OPTION_KEYS   = ['optionA', 'optionB', 'optionC', 'optionD'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
export const LS_KEY = 'quickQuizCompleted';

export default function QuickStartWidget({ onComplete }) {
  const { isGuest, updateCoins } = useUserAuth();

  const [quiz, setQuiz]                 = useState(null);
  const [questions, setQuestions]       = useState([]);
  const [current, setCurrent]           = useState(0);
  const [selected, setSelected]         = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase]               = useState('idle');
  const [reward, setReward]             = useState(null);

  const totalQ = questions.length;

  useEffect(() => {
    if (localStorage.getItem(LS_KEY) === 'true') { setPhase('empty'); return; }
    setPhase('loading');
    api.get('/quick-start')
      .then((res) => {
        const data = res.data.data;
        if (!data || !data.isActive || !data.questions?.length) { setPhase('empty'); return; }
        setQuiz(data);
        setQuestions(data.questions.slice(0, 2));
        setPhase('playing');
      })
      .catch(() => setPhase('empty'));
  }, []);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    const label = OPTION_LABELS[idx];
    setSelected(label);
    if (label === questions[current].correctAnswer) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (current + 1 < totalQ) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      finishQuiz(correctCount);
    }
  };

  const finishQuiz = async (finalCorrect) => {
    setPhase('claiming');
    localStorage.setItem(LS_KEY, 'true');
    try {
      const res = await api.post('/quick-start/complete', {
        quizId: quiz.id,
        correctAnswers: finalCorrect,
      });
      const { coinsEarned, newBalance } = res.data.data;
      setReward({ coinsEarned, newBalance });
      if (newBalance !== null) updateCoins?.(newBalance);
    } catch {
      const approxCoins = finalCorrect > 0
        ? Math.round((finalCorrect / totalQ) * (quiz?.rewardCoins || 20))
        : 0;
      setReward({ coinsEarned: approxCoins, newBalance: null });
    }
    setPhase('done');
  };

  // Called when user clicks "Start Playing" — triggers parent to show main home
  const handleStartPlaying = () => {
    setPhase('empty');
    onComplete?.();
  };

  const scoreEmoji = () => {
    if (correctCount === totalQ) return '🏆';
    if (correctCount > 0) return '⭐';
    return '💪';
  };

  if (phase === 'idle' || phase === 'empty') return null;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading Quick Start…</p>
      </div>
    );
  }

  // ── Reward modal ─────────────────────────────────────────────────────────────
  if (phase === 'claiming' || phase === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm mx-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
          {phase === 'claiming' ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Claiming your reward…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="text-5xl mb-2">{scoreEmoji()}</div>
                <h2 className="text-white text-xl font-black">
                  {correctCount === totalQ ? 'Perfect Score!' : correctCount > 0 ? 'Well done!' : 'Keep practicing!'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{correctCount}/{totalQ} correct answers</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-5 text-center">
                <p className="text-gray-400 text-xs mb-1">Coins Earned</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🪙</span>
                  <span className="text-yellow-400 text-4xl font-black">{reward?.coinsEarned ?? 0}</span>
                </div>
                {reward?.newBalance != null ? (
                  <p className="text-gray-400 text-xs mt-2">
                    New balance: <span className="text-yellow-400 font-bold">{reward.newBalance} coins</span>
                  </p>
                ) : isGuest ? (
                  <p className="text-gray-500 text-xs mt-2">Sign up to save your coins!</p>
                ) : null}
              </div>

              {isGuest && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4 text-center">
                  <p className="text-white text-sm font-bold mb-1">Save your coins!</p>
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                    Create a free account to keep your coins and compete on the leaderboard.
                  </p>
                  <Link
                    to="/signup"
                    className="block w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Create Free Account
                  </Link>
                </div>
              )}

              <button
                onClick={handleStartPlaying}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 active:scale-95 transition-all"
              >
                Start Playing →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────────
  const question   = questions[current];
  const correctIdx = OPTION_LABELS.indexOf(question.correctAnswer);

  const optionStyle = (idx) => {
    const label = OPTION_LABELS[idx];
    if (selected === null) {
      return 'bg-bg border border-white/10 text-white hover:border-primary/50 hover:bg-primary/5 active:scale-[0.97] cursor-pointer';
    }
    if (idx === correctIdx) return 'bg-green-500/20 border border-green-500 text-green-300';
    if (label === selected)  return 'bg-red-500/20 border border-red-500 text-red-300';
    return 'bg-bg border border-white/10 text-gray-500 cursor-default';
  };

  return (
    <div className="px-4 pb-2">
      {/* Title */}
      <div className="text-center mb-4 pt-2">
        <h2 className="text-white text-2xl font-black">Quick Start!</h2>
        <p className="text-gray-400 text-sm mt-1">
          Answer {totalQ} questions and win upto {quiz?.rewardCoins || 20} coins.
        </p>
      </div>

      {/* Centered progress pill */}
      <div className="flex justify-center mb-4">
        <span className="bg-[#1e2a3a] text-white text-sm font-semibold px-6 py-1.5 rounded-full border border-white/15">
          {current + 1}/{totalQ} Question
        </span>
      </div>

      {/* Question card */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 mb-4">
        <p className="text-white text-base font-semibold text-center leading-relaxed mb-5 min-h-[48px]">
          {question.questionText}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {OPTION_KEYS.map((key, idx) => (
            <button
              key={key}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`py-4 px-3 rounded-xl text-sm font-semibold text-center leading-snug transition-all duration-150 ${optionStyle(idx)}`}
            >
              {question[key]}
            </button>
          ))}
        </div>

        {selected !== null && question.explanation && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl mb-3">
            <p className="text-blue-300 text-xs font-semibold mb-0.5">💡 Explanation</p>
            <p className="text-blue-200 text-xs leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 active:scale-95 transition-all mt-1"
          >
            {current + 1 < totalQ ? 'Next Question →' : 'See Results 🎉'}
          </button>
        )}
      </div>
    </div>
  );
}