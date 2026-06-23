import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AdBlock from '../components/AdBlock';
import AdOverlay from '../components/AdOverlay';
import { useUserAuth } from '../context/UserAuthContext';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS   = ['optionA', 'optionB', 'optionC', 'optionD'];

function CircularTimer({ timeLeft, totalTime }) {
  const radius        = 40;
  const circumference = 2 * Math.PI * radius;
  const progress      = totalTime > 0 ? timeLeft / totalTime : 1;
  const dashOffset    = circumference * (1 - progress);
  const mins          = Math.floor(timeLeft / 60);
  const secs          = timeLeft % 60;
  const isLow         = timeLeft <= 30;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#ffffff12" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={isLow ? '#ef4444' : '#f97316'}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-black tabular-nums ${isLow ? 'text-red-400' : 'text-white'}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const { updateCoins } = useUserAuth();

  const [quiz, setQuiz]           = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [started, setStarted]     = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount]     = useState(0);

  const [timeLeft, setTimeLeft]   = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  const [adsMap, setAdsMap]       = useState({});
  const [overlayAd, setOverlayAd] = useState(null);

  const afterOverlayRef   = useRef(null);
  const answeredCountRef  = useRef(0);
  const handleNextRef     = useRef();
  const answersRef        = useRef([]);
  const startTimeRef      = useRef(Date.now());
  const timerIntervalRef  = useRef(null);

  const showAd = useCallback((ad, afterClose) => {
    afterOverlayRef.current = afterClose || null;
    setOverlayAd(ad);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setOverlayAd(null);
    const cb = afterOverlayRef.current;
    afterOverlayRef.current = null;
    if (cb) cb();
  }, []);

  // ── Load quiz ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const safe = (fn) => fn.catch(() => ({ data: { data: null } }));
    Promise.all([
      api.get(`/quizzes/${slug}`),
      safe(api.get('/ads')),
    ]).then(([quizRes, adsRes]) => {
      const data = quizRes.data.data;
      setQuiz(data);
      setQuestions(data.questions || []);

      const tl = data.timeLimit > 0 ? data.timeLimit : 200;
      setTimeLeft(tl);
      setTotalTime(tl);

      const map = {};
      for (const ad of (adsRes.data.data || [])) {
        if (!map[ad.position]) map[ad.position] = ad;
      }
      setAdsMap(map);

      if (map.before_quiz) {
        showAd(map.before_quiz, () => setStarted(true));
      } else {
        setStarted(true);
      }
    }).catch((err) => {
      setError(err.response?.data?.message || 'Quiz not found');
      setStarted(true);
    }).finally(() => setLoading(false));
  }, [slug, showAd]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitQuiz = useCallback(async (finalAnswers) => {
    clearInterval(timerIntervalRef.current);
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await api.post(`/quizzes/${quiz.id}/attempt`, {
        answers: finalAnswers,
        timeTaken,
      });
      const { attempt, detailedAnswers, coinsEarned, newCoinBalance } = res.data.data;
      if (newCoinBalance != null) updateCoins(newCoinBalance);
      navigate('/result', {
        state: { attempt, detailedAnswers, questions, quiz, coinsEarned },
        replace: true,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 402) {
        // Insufficient coins — send back to lobby
        navigate(`/quiz/${slug}`, { replace: true, state: { insufficientCoins: true } });
      } else {
        setSubmitting(false);
      }
    }
  }, [quiz, questions, navigate, updateCoins, slug]);

  // ── Next question / submit ─────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (selected === null) return;

    const q          = questions[current];
    const newAnswers = [...answers, { questionId: q.id, selectedAnswer: selected }];
    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    if (current + 1 < questions.length) {
      answeredCountRef.current += 1;
      const btwnAd = adsMap.between_questions;
      const advance = () => { setCurrent((c) => c + 1); setSelected(null); };
      if (btwnAd && answeredCountRef.current % (btwnAd.frequency || 1) === 0) {
        showAd(btwnAd, advance);
      } else {
        advance();
      }
    } else {
      if (adsMap.quiz_complete) {
        showAd(adsMap.quiz_complete, () => submitQuiz(newAnswers));
      } else {
        submitQuiz(newAnswers);
      }
    }
  }, [selected, current, questions, answers, adsMap, showAd, submitQuiz]);
  handleNextRef.current = handleNext;

  // ── Auto-advance after selection ───────────────────────────────────────────
  useEffect(() => {
    if (selected === null) return;
    const q = questions[current];
    if (selected !== q.correctAnswer && adsMap.wrong_answer) return;
    const t = setTimeout(() => handleNextRef.current(), 1200);
    return () => clearTimeout(t);
  }, [selected, current, questions, adsMap]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || totalTime === 0) return;
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerIntervalRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [started, totalTime]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && totalTime > 0 && !submitting) {
      submitQuiz(answersRef.current);
    }
  }, [timeLeft]); // eslint-disable-line

  // ── Answer selection ───────────────────────────────────────────────────────
  const handleSelect = (label) => {
    if (selected !== null) return;
    setSelected(label);
    const q = questions[current];
    if (label === q.correctAnswer) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
      if (adsMap.wrong_answer) showAd(adsMap.wrong_answer, () => handleNextRef.current());
    }
  };

  const getOptionStyle = (label) => {
    if (selected === null) {
      return 'bg-card text-white hover:bg-primary/15 active:bg-primary/25 cursor-pointer';
    }
    const q = questions[current];
    if (label === q.correctAnswer)                          return 'bg-green-500/25 text-green-300';
    if (label === selected && selected !== q.correctAnswer) return 'bg-red-500/25 text-red-300';
    return 'bg-card text-gray-500 cursor-default';
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-white text-xl font-bold mb-2">{error}</h2>
      <button onClick={() => navigate(-1)} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold">Go Back</button>
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="text-5xl mb-4">🎯</div>
      <h2 className="text-white text-xl font-bold mb-2">No Questions Yet</h2>
      <button onClick={() => navigate(-1)} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold">Go Back</button>
    </div>
  );

  const question   = questions[current];
  const scoreCoins = correctCount * 100;

  return (
    <div className="mobile-shell flex flex-col bg-bg">
      {overlayAd && <AdOverlay ad={overlayAd} onClose={handleOverlayClose} />}

      {!started ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              {quiz.category && (
                <p className="text-primary text-xs font-bold uppercase tracking-wide mb-0.5">
                  {quiz.category.name}
                </p>
              )}
              <p className="text-white text-sm font-bold leading-snug">
                {quiz.title}&nbsp;&nbsp;🪙&nbsp;<span className="text-yellow-400">{questions.length * 100}</span>
              </p>
            </div>
            <button
              onClick={() => navigate(`/quiz/${slug}`)}
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-card border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Circular timer */}
          {totalTime > 0 && timeLeft !== null && (
            <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
          )}

          {/* Correct | Question X/Y | Wrong */}
          <div className="flex items-center justify-between px-1">
            <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-white font-black text-lg leading-none">{correctCount}</span>
            </div>
            <span className="text-white text-xs font-semibold bg-card border border-white/10 px-5 py-2 rounded-full">
              Question {current + 1}/{questions.length}
            </span>
            <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-white font-black text-lg leading-none">{wrongCount}</span>
            </div>
          </div>

          {/* Question + options card */}
          <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
            {/* Question text */}
            <div className="px-5 pt-5 pb-4 border-b border-white/5 min-h-[90px] flex items-center justify-center">
              <p className="text-white text-base font-semibold text-center leading-relaxed">
                {question.questionText}
              </p>
            </div>

            {/* 2×2 options grid */}
            <div className="grid grid-cols-2 gap-px bg-white/5">
              {OPTION_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => handleSelect(label)}
                  disabled={selected !== null}
                  className={`py-5 px-4 text-sm font-semibold text-center leading-snug transition-all duration-200 ${getOptionStyle(label)}`}
                >
                  {question[OPTION_KEYS[i]]}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {selected !== null && question.explanation && (
              <div className="m-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-xs font-semibold mb-0.5">💡 Explanation</p>
                <p className="text-blue-200 text-xs leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>

          {/* Score / submitting */}
          <div className="text-center py-1">
            {submitting ? (
              <div className="flex justify-center">
                <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <p className="text-yellow-400 text-base font-bold">
                Your Score is {scoreCoins}
              </p>
            )}
          </div>

          {/* Bottom banner ad — persistent throughout the quiz */}
          {adsMap.quiz_bottom && (
            <div className="mt-1">
              <p className="text-gray-600 text-[10px] text-center uppercase tracking-widest mb-1">Advertisement</p>
              <AdBlock ad={adsMap.quiz_bottom} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
