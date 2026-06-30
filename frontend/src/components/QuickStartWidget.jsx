import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import AdOverlay from './AdOverlay';
import PostQuizBonusPopup from './PostQuizBonusPopup';
import { useUserAuth } from '../context/UserAuthContext';

const OPTION_KEYS   = ['optionA', 'optionB', 'optionC', 'optionD'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
export const LS_KEY = 'quickQuizCompleted';

export default function QuickStartWidget({ onComplete, onResult, onNavHide }) {
  const { isGuest, updateCoins } = useUserAuth();

  const [quiz, setQuiz]                 = useState(null);
  const [questions, setQuestions]       = useState([]);
  const [current, setCurrent]           = useState(0);
  const [selected, setSelected]         = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase]               = useState('idle');
  const [reward, setReward]             = useState(null);
  const [doneAd, setDoneAd]             = useState(null);
  const [showDoneAd, setShowDoneAd]     = useState(false);
  const [betweenAd, setBetweenAd]       = useState(null);
  const [showBetweenAd, setShowBetweenAd] = useState(false);
  const [bonusAd, setBonusAd]           = useState(null);
  const [showBonusPopup, setShowBonusPopup] = useState(false);

  const totalQ            = questions.length;
  const handleNextRef     = useRef();
  const afterBetweenAdRef = useRef(null);
  const pendingFinishRef  = useRef(null);
  const correctCountRef   = useRef(0);

  useEffect(() => {
    return () => onNavHide?.(false);
  }, [onNavHide]);

  useEffect(() => {
    if (sessionStorage.getItem(LS_KEY) === 'true') { setPhase('empty'); return; }
    setPhase('loading');
    Promise.all([
      api.get('/quick-start'),
      api.get('/ads').catch(() => ({ data: { data: [] } })),
    ]).then(([res, adsRes]) => {
      const data = res.data.data;
      if (!data || !data.isActive || !data.questions?.length) { setPhase('empty'); return; }
      setQuiz(data);
      setQuestions(data.questions.slice(0, 2));
      const ads = adsRes.data.data || [];
      const between = ads.find((a) => a.position === 'quickstart_between');
      const bonus   = ads.find((a) => a.position === 'post_quiz_bonus');
      if (between) setBetweenAd(between);
      if (bonus)   setBonusAd(bonus);
      setPhase('playing');
    }).catch(() => setPhase('empty'));
  }, []);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    const label = OPTION_LABELS[idx];
    setSelected(label);
    if (label === questions[current].correctAnswer) {
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    }
    handleNextRef.current();
  };

  const handleNext = () => {
    const isLastQuestion = current + 1 >= totalQ;

    const advance = () => {
      if (!isLastQuestion) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else if (bonusAd) {
        // Show bonus popup before finishing
        pendingFinishRef.current = () => finishQuiz(correctCountRef.current);
        setShowBonusPopup(true);
      } else {
        finishQuiz(correctCountRef.current);
      }
    };

    if (betweenAd) {
      afterBetweenAdRef.current = advance;
      setShowBetweenAd(true);
    } else {
      advance();
    }
  };
  handleNextRef.current = handleNext;

  const handleBetweenAdClose = () => {
    setShowBetweenAd(false);
    const cb = afterBetweenAdRef.current;
    afterBetweenAdRef.current = null;
    if (cb) cb();
  };

  const handleBonusClose = () => {
    setShowBonusPopup(false);
    const cb = pendingFinishRef.current;
    pendingFinishRef.current = null;
    if (cb) cb();
  };

  const handleBonusCoinsUpdated = (newBalance) => {
    if (newBalance != null) updateCoins(newBalance);
  };

  const finishQuiz = async (finalCorrect) => {
    setPhase('claiming');
    onResult?.();
    sessionStorage.setItem(LS_KEY, 'true');
    let coinsEarned = finalCorrect * 100;
    try {
      const [completeRes, adsRes] = await Promise.all([
        api.post('/quick-start/complete', { quizId: quiz.id, correctAnswers: finalCorrect }),
        api.get('/ads').catch(() => ({ data: { data: [] } })),
      ]);
      const data = completeRes.data.data;
      coinsEarned = data.coinsEarned ?? coinsEarned;
      if (data.newBalance != null) updateCoins(data.newBalance);
      const ad = (adsRes.data.data || []).find((a) => a.position === 'quickstart_done');
      if (ad) setDoneAd(ad);
    } catch { /* coins not awarded if API fails */ }
    setReward({ coinsEarned });
    setPhase('done');
  };

  const handleStartPlaying = () => {
    if (doneAd) {
      setShowDoneAd(true);
    } else {
      setPhase('empty');
      onComplete?.();
    }
  };

  const handleDoneAdClose = () => {
    setShowDoneAd(false);
    setPhase('empty');
    onComplete?.();
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

  // ── Reward page ──────────────────────────────────────────────────────────────
  if (phase === 'claiming' || phase === 'done') {
    return (
      <div className="px-4 pb-6 pt-2">
        {showDoneAd && doneAd && (
          <AdOverlay ad={doneAd} onClose={handleDoneAdClose} />
        )}

        <div className="bg-card border border-white/10 rounded-3xl p-6 text-center shadow-2xl mb-6">
          {phase === 'claiming' ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Calculating your reward…</p>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-3">🏆</div>
              <p className="text-white text-xl font-bold leading-snug">
                You Have got{' '}
                <span className="text-yellow-400 font-black">{reward?.coinsEarned ?? 0}</span>
                {' '}coins
              </p>
              <button
                onClick={handleStartPlaying}
                className="mt-5 w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-2xl text-base active:scale-95 transition-all"
              >
                Play Now
              </button>
            </>
          )}
        </div>

        {phase === 'done' && (
          <div>
            <h2 className="text-white text-xl font-black text-center">
              Play Quiz and Win Coins!
            </h2>
            <div className="w-24 h-0.5 bg-primary/50 mx-auto mt-1.5 mb-5" />
            <ul className="space-y-3.5">
              {[
                'Play Quizzes in 25+ categories like GK, Sports, Bollywood, Business, Cricket & more!',
                'Compete with lakhs of other players!',
                'Win coins for every game',
                'Trusted by millions of other quiz enthusiasts like YOU!',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm leading-relaxed">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
      {showBetweenAd && betweenAd && (
        <AdOverlay ad={betweenAd} onClose={handleBetweenAdClose} />
      )}

      {showBonusPopup && bonusAd && (
        <PostQuizBonusPopup
          bonusAd={bonusAd}
          onClose={handleBonusClose}
          onCoinsUpdated={handleBonusCoinsUpdated}
        />
      )}

      {/* Title */}
      <div className="text-center mb-4 pt-2">
        <h2 className="text-white text-2xl font-black">Quick Start!</h2>
        <p className="text-gray-400 text-sm mt-1">
          Answer {totalQ} questions and win up to {totalQ * 100} coins.
        </p>
      </div>

      {/* Progress pill */}
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
      </div>
    </div>
  );
}
