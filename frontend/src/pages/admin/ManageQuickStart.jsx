import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];

const BLANK_QUESTION = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
});

export default function ManageQuickStart() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [isActive, setIsActive]       = useState(true);
  const [rewardCoins, setRewardCoins] = useState(20);
  const [questions, setQuestions]     = useState([BLANK_QUESTION(), BLANK_QUESTION()]);
  const [exists, setExists]           = useState(false);

  useEffect(() => {
    api.get('/quick-start/admin')
      .then((res) => {
        const data = res.data.data;
        if (data) {
          setExists(true);
          setIsActive(data.isActive);
          setRewardCoins(data.rewardCoins);
          if (data.questions?.length > 0) {
            const qs = [...data.questions];
            while (qs.length < 2) qs.push(BLANK_QUESTION());
            setQuestions(qs.slice(0, 2));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateQ = (idx, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/quick-start/admin', { isActive, rewardCoins, questions });
      setExists(true);
      setSuccess('Quick Start quiz saved successfully!');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs?.[0]?.message || err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!exists) return;
    setToggling(true);
    try {
      const res = await api.patch('/quick-start/admin/toggle');
      setIsActive(res.data.data.isActive);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Toggle failed');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Quick Start Quiz">
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quick Start Quiz">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-600'}`} />
          <span className="text-white text-sm font-semibold">
            {isActive ? 'Active — shown to first-time visitors' : 'Inactive — hidden from homepage'}
          </span>
        </div>
        {exists && (
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              isActive
                ? 'bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25'
                : 'bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25'
            }`}
          >
            {toggling ? '…' : isActive ? 'Disable' : 'Enable'}
          </button>
        )}
      </div>

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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Settings */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4 pb-3 border-b border-white/10">
            ⚙️ Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold block mb-1.5">🪙 Reward Coins</label>
              <input
                type="number"
                min="0"
                required
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                value={rewardCoins}
                onChange={(e) => setRewardCoins(Number(e.target.value))}
              />
              <p className="text-slate-600 text-xs mt-1">Max coins user can earn (based on score)</p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center justify-between w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 cursor-pointer">
                <div>
                  <p className="text-white text-sm font-semibold">Active</p>
                  <p className="text-slate-500 text-xs">Show widget on homepage</p>
                </div>
                <div
                  onClick={() => setIsActive((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isActive ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4 pb-3 border-b border-white/10">
              ❓ Question {qIdx + 1} of 2
            </h2>

            <div className="space-y-4">
              {/* Question text */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Question Text *</label>
                <textarea
                  rows={2}
                  required
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  placeholder="Enter the question…"
                  value={q.questionText}
                  onChange={(e) => updateQ(qIdx, 'questionText', e.target.value)}
                />
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['optionA', 'optionB', 'optionC', 'optionD'].map((key, oIdx) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                      Option {ANSWER_OPTIONS[oIdx]} *
                    </label>
                    <input
                      required
                      className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder={`Option ${ANSWER_OPTIONS[oIdx]}`}
                      value={q[key]}
                      onChange={(e) => updateQ(qIdx, key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Correct answer + Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Correct Answer *</label>
                  <select
                    required
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={q.correctAnswer}
                    onChange={(e) => updateQ(qIdx, 'correctAnswer', e.target.value)}
                  >
                    {ANSWER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>Option {opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Explanation (optional)</label>
                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Brief explanation…"
                    value={q.explanation}
                    onChange={(e) => updateQ(qIdx, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 active:scale-95 transition-all"
        >
          {saving ? 'Saving…' : exists ? '💾 Save Changes' : '🚀 Create Quick Start Quiz'}
        </button>
      </form>
    </AdminLayout>
  );
}
