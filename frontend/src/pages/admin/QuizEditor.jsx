import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const BLANK_QUESTION = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  orderIndex: 0,
});

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [quizForm, setQuizForm] = useState({
    title: '',
    categoryId: '',
    description: '',
    rewardPoints: 10,
    rewardCoins: 10,
    timeLimit: 0,
    entryFee: 0,
    isPublished: true,
    isFeatured: false,
  });
  const [questions, setQuestions] = useState([BLANK_QUESTION()]);
  const [activeTab, setActiveTab] = useState('quiz');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/categories?active=true').then((r) => setCategories(r.data.data));

    if (isEdit) {
      Promise.all([
        api.get(`/quizzes/${id}/questions`),
        api.get('/quizzes?limit=200'),
      ]).then(([qRes, quizzesRes]) => {
        setQuestions(qRes.data.data.length > 0 ? qRes.data.data : [BLANK_QUESTION()]);
        const quiz = quizzesRes.data.data.quizzes.find((q) => String(q.id) === String(id));
        if (quiz) {
          setQuizForm({
            title: quiz.title,
            categoryId: quiz.categoryId,
            description: quiz.description || '',
            rewardPoints: quiz.rewardPoints,
            rewardCoins: quiz.rewardCoins ?? 10,
            timeLimit: quiz.timeLimit || 0,
            entryFee: quiz.entryFee ?? 0,
            isPublished: quiz.isPublished,
            isFeatured: quiz.isFeatured,
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...BLANK_QUESTION(), orderIndex: prev.length }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i })));
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const isQuestionFilled = (q) =>
    q.questionText.trim() &&
    q.optionA.trim() &&
    q.optionB.trim() &&
    q.optionC.trim() &&
    q.optionD.trim();

  const saveQuiz = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let quizId = id;
      if (isEdit) {
        await api.put(`/quizzes/${id}`, quizForm);
      } else {
        const res = await api.post('/quizzes', quizForm);
        quizId = res.data.data.id;
      }

      const validQuestions = questions.filter(isQuestionFilled);
      if (validQuestions.length > 0) {
        await api.put(`/quizzes/${quizId}/questions/bulk`, {
          questions: validQuestions.map((q, i) => ({ ...q, orderIndex: i })),
        });
        setSuccess(`Quiz saved with ${validQuestions.length} question${validQuestions.length > 1 ? 's' : ''}!`);
      } else {
        setSuccess('Quiz details saved! Switch to the Questions tab to add questions.');
      }

      if (!isEdit) {
        setTimeout(() => navigate(`/admin/quizzes/${quizId}/edit`), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Quiz' : 'New Quiz'}>
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Quiz' : 'New Quiz'}>
      <button
        onClick={() => navigate('/admin/quizzes')}
        className="flex items-center gap-1.5 text-slate-400 text-sm mb-5 hover:text-white transition-colors"
      >
        ← Back to Quizzes
      </button>

      {error && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/15 border border-green-500/40 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
          ✓ {success}
        </div>
      )}

      {/* Desktop: side-by-side — Mobile/tablet: tabbed */}
      <form onSubmit={saveQuiz}>
        {/* Tab switcher — hidden on large desktop where both panels are visible */}
        <div className="flex gap-2 mb-5 lg:hidden">
          {['quiz', 'questions'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {tab === 'quiz' ? '📋 Quiz Details' : `❓ Questions (${questions.filter(isQuestionFilled).length}/${questions.length})`}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[420px_1fr] lg:gap-6 lg:items-start">
          {/* ── QUIZ DETAILS PANEL ── */}
          <div className={`${activeTab === 'questions' ? 'hidden' : ''} lg:block`}>
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-white font-semibold text-sm hidden lg:block mb-4 pb-3 border-b border-white/10">
                📋 Quiz Details
              </h2>

              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Quiz Title *</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter quiz title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Category *</label>
                <select
                  className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={quizForm.categoryId}
                  onChange={(e) => setQuizForm({ ...quizForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Description</label>
                <textarea
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  placeholder="Short description of the quiz"
                  rows={3}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Reward Points</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={quizForm.rewardPoints}
                    onChange={(e) => setQuizForm({ ...quizForm, rewardPoints: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">🪙 Reward Coins</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={quizForm.rewardCoins}
                    onChange={(e) => setQuizForm({ ...quizForm, rewardCoins: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">🪙 Entry Fee (coins)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="0 = Free"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={quizForm.entryFee}
                    onChange={(e) => setQuizForm({ ...quizForm, entryFee: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">⏱ Timer (seconds) — shown as countdown during quiz</label>
                  <input
                    type="number"
                    min="30"
                    step="10"
                    placeholder="e.g. 200"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })}
                  />
                  <p className="text-slate-600 text-xs mt-1">Quiz auto-submits when timer reaches 0. Default: 200s.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-slate-800 border border-white/10 rounded-xl divide-y divide-white/10">
                <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-semibold">Published</p>
                    <p className="text-slate-500 text-xs">Visible to all users</p>
                  </div>
                  <div
                    onClick={() => setQuizForm({ ...quizForm, isPublished: !quizForm.isPublished })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${quizForm.isPublished ? 'bg-blue-600' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${quizForm.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-semibold">Featured</p>
                    <p className="text-slate-500 text-xs">Shown prominently on homepage</p>
                  </div>
                  <div
                    onClick={() => setQuizForm({ ...quizForm, isFeatured: !quizForm.isFeatured })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${quizForm.isFeatured ? 'bg-yellow-500' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${quizForm.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 active:scale-95 transition-all"
              >
                {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '🚀 Create Quiz'}
              </button>
            </div>
          </div>

          {/* ── QUESTIONS PANEL ── */}
          <div className={`${activeTab === 'quiz' ? 'hidden' : ''} lg:block`}>
            <div className="space-y-4">
              <div className="hidden lg:flex items-center justify-between mb-1">
                <h2 className="text-white font-semibold text-sm">
                  ❓ Questions ({questions.filter(isQuestionFilled).length}/{questions.length})
                </h2>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-900 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wide">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-red-400 text-xs hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <textarea
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none mb-3 transition-colors"
                    placeholder="Enter question *"
                    rows={2}
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {ANSWER_OPTIONS.map((label) => {
                      const field = `option${label}`;
                      return (
                        <div key={label} className="relative">
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${
                            q.correctAnswer === label ? 'text-green-400' : 'text-slate-500'
                          }`}>
                            {label}
                          </span>
                          <input
                            className={`w-full bg-slate-800 border rounded-xl pl-7 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors ${
                              q.correctAnswer === label
                                ? 'border-green-500/50 focus:border-green-500'
                                : 'border-white/10 focus:border-blue-500'
                            }`}
                            placeholder={`Option ${label} *`}
                            value={q[field]}
                            onChange={(e) => updateQuestion(idx, field, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-slate-400 text-xs font-semibold">Correct Answer:</span>
                    <div className="flex gap-1.5">
                      {ANSWER_OPTIONS.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => updateQuestion(idx, 'correctAnswer', label)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            q.correctAnswer === label
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Explanation (optional)"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3.5 border-2 border-dashed border-white/20 text-slate-400 rounded-2xl text-sm hover:border-blue-500/50 hover:text-blue-400 transition-colors"
              >
                + Add Question
              </button>

              {/* Save button duplicated in questions panel for convenience on large screens */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 active:scale-95 transition-all lg:hidden"
              >
                {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '🚀 Create Quiz'}
              </button>
            </div>
          </div>
        </div>

        {/* Floating save button visible on desktop (below both columns) */}
        <div className="hidden lg:block mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white font-bold rounded-xl text-sm px-8 py-3.5 hover:bg-blue-500 disabled:opacity-60 active:scale-95 transition-all"
          >
            {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '🚀 Create Quiz'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
