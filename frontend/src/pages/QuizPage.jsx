import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProgressBar from '../components/ProgressBar';
import AdOverlay from '../components/AdOverlay';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['optionA', 'optionB', 'optionC', 'optionD'];

export default function QuizPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [startTime] = useState(Date.now());

  // Ad state
  const [adsMap, setAdsMap] = useState({});
  const [overlayAd, setOverlayAd] = useState(null);
  const afterOverlayRef = useRef(null);
  const answeredCountRef = useRef(0);

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

  useEffect(() => {
    const safe = (fn) => fn.catch(() => ({ data: { data: null } }));
    Promise.all([
      api.get(`/quizzes/${slug}`),
      safe(api.get('/ads')),
    ]).then(([quizRes, adsRes]) => {
      const data = quizRes.data.data;
      setQuiz(data);
      setQuestions(data.questions || []);

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

  const handleSelect = (label) => {
    if (selected !== null) return;
    setSelected(label);
    const q = questions[current];
    if (label !== q.correctAnswer && adsMap.wrong_answer) {
      showAd(adsMap.wrong_answer, null);
    }
  };

  const handleNext = useCallback(async () => {
    if (selected === null) return;

    const q = questions[current];
    const newAnswers = [...answers, { questionId: q.id, selectedAnswer: selected }];
    setAnswers(newAnswers);

    const submitAndNavigate = async () => {
      setSubmitting(true);
      try {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const res = await api.post(`/quizzes/${quiz.id}/attempt`, {
          answers: newAnswers,
          timeTaken,
        });
        navigate('/result', {
          state: {
            attempt: res.data.data.attempt,
            detailedAnswers: res.data.data.detailedAnswers,
            questions,
            quiz,
          },
          replace: true,
        });
      } catch {
        setSubmitting(false);
      }
    };

    if (current + 1 < questions.length) {
      answeredCountRef.current += 1;
      const btwnAd = adsMap.between_questions;
      const freq = btwnAd?.frequency || 1;
      const advance = () => {
        setCurrent((c) => c + 1);
        setSelected(null);
      };
      if (btwnAd && answeredCountRef.current % freq === 0) {
        showAd(btwnAd, advance);
      } else {
        advance();
      }
    } else {
      if (adsMap.quiz_complete) {
        showAd(adsMap.quiz_complete, submitAndNavigate);
      } else {
        submitAndNavigate();
      }
    }
  }, [selected, current, questions, answers, quiz, startTime, navigate, adsMap, showAd]);

  const getOptionStyle = (label) => {
    if (selected === null) {
      return 'bg-card border border-white/10 text-white hover:border-primary/60 hover:bg-primary/10 active:scale-98';
    }
    const q = questions[current];
    if (label === q.correctAnswer) {
      return 'bg-green-500/20 border border-green-500 text-green-300';
    }
    if (label === selected && selected !== q.correctAnswer) {
      return 'bg-red-500/20 border border-red-500 text-red-300';
    }
    return 'bg-card border border-white/10 text-gray-500';
  };

  if (loading) {
    return (
      <div className="mobile-shell flex items-center justify-center min-h-screen bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-shell flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-white text-xl font-bold mb-2">{error}</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mobile-shell flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-white text-xl font-bold mb-2">No Questions Yet</h2>
        <p className="text-gray-400 text-sm">This quiz has no questions.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const question = questions[current];
  const isLast = current + 1 === questions.length;

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-bg">
      {/* Ad overlays (before_quiz, wrong_answer, between_questions, quiz_complete) */}
      {overlayAd && <AdOverlay ad={overlayAd} onClose={handleOverlayClose} />}

      {/* Waiting for before_quiz overlay to dismiss */}
      {!started ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top bar */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-xl">
                <span className="text-sm">🏆</span>
                <span className="text-sm font-semibold">{quiz.rewardPoints} pts</span>
              </div>
            </div>
            <ProgressBar current={current + 1} total={questions.length} />
          </div>

          {/* Quiz info */}
          <div className="px-4 mb-4">
            <p className="text-gray-400 text-xs mb-1">{quiz.title}</p>
          </div>

          {/* Question */}
          <div className="px-4 flex-1">
            <div className="bg-card rounded-2xl border border-white/10 p-5 mb-5">
              <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-3">
                Question {current + 1}
              </p>
              <h2 className="text-white text-base font-semibold leading-relaxed">
                {question.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {OPTION_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => handleSelect(label)}
                  disabled={selected !== null}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 ${getOptionStyle(label)}`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                    selected === null
                      ? 'bg-white/10 text-gray-300'
                      : label === question.correctAnswer
                      ? 'bg-green-500 text-white'
                      : label === selected
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}>
                    {label}
                  </span>
                  <span className="text-sm leading-snug">{question[OPTION_KEYS[i]]}</span>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {selected !== null && question.explanation && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                <p className="text-blue-300 text-xs font-semibold mb-1">💡 Explanation</p>
                <p className="text-blue-200 text-sm leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="px-4 py-5">
            <button
              onClick={handleNext}
              disabled={selected === null || submitting}
              className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
                selected !== null && !submitting
                  ? 'bg-primary text-white hover:bg-blue-600 active:scale-95'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting
                ? 'Submitting...'
                : isLast
                ? '🎉 Submit Quiz'
                : 'Next Question →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
