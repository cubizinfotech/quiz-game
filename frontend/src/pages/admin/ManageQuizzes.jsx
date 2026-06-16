import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (filter === 'published') params.set('published', 'true');
    if (filter === 'draft') params.set('published', 'false');
    if (catFilter) params.set('categoryId', catFilter);
    params.set('limit', '100');

    Promise.all([
      api.get(`/quizzes?${params}`),
      api.get('/categories'),
    ]).then(([q, c]) => {
      setQuizzes(q.data.data.quizzes);
      setCategories(c.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, catFilter]);

  const togglePublish = async (id) => {
    await api.patch(`/quizzes/${id}/publish`);
    load();
  };

  const toggleFeature = async (id) => {
    await api.patch(`/quizzes/${id}/feature`);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all its questions?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout title="Quizzes">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {['all', 'published', 'draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-2 rounded-xl font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="text-sm bg-slate-800 text-slate-400 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Link
          to="/admin/quizzes/new"
          className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
        >
          + New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500 text-sm">
          <div className="text-4xl mb-3">🎯</div>
          <p>No quizzes found. Create your first quiz!</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden md:grid grid-cols-[1fr_160px_80px_80px_160px] gap-4 px-5 py-3 border-b border-white/10">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Quiz</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Category</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Questions</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Points</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Actions</span>
          </div>

          <div className="divide-y divide-white/5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_160px_80px_80px_160px] md:items-center gap-3 md:gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
              >
                {/* Title + badges */}
                <div className="flex items-start gap-2 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-snug">{quiz.title}</p>
                    {/* Mobile meta row */}
                    <div className="flex items-center gap-2 mt-1 md:hidden flex-wrap">
                      <span className="text-slate-500 text-xs">{quiz.category?.icon} {quiz.category?.name}</span>
                      <span className="text-slate-500 text-xs">❓ {quiz._count?.questions ?? 0}</span>
                      <span className="text-slate-500 text-xs">🏆 {quiz.rewardPoints}pts</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {quiz.isFeatured && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-lg">⭐</span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-lg ${
                      quiz.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {quiz.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Category — desktop only */}
                <span className="hidden md:block text-slate-400 text-sm truncate">
                  {quiz.category?.icon} {quiz.category?.name}
                </span>

                {/* Question count — desktop only */}
                <span className="hidden md:block text-slate-400 text-sm">
                  {quiz._count?.questions ?? 0}
                </span>

                {/* Points — desktop only */}
                <span className="hidden md:block text-slate-400 text-sm">
                  {quiz.rewardPoints}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/quizzes/${quiz.id}/edit`}
                    className="flex-1 md:flex-none text-center text-xs bg-slate-800 border border-white/10 text-slate-300 px-3 py-2 rounded-xl hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-600/40 transition-colors"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => togglePublish(quiz.id)}
                    className={`flex-1 md:flex-none text-xs px-3 py-2 rounded-xl transition-colors ${
                      quiz.isPublished
                        ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                        : 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {quiz.isPublished ? '⏸ Unpublish' : '▶ Publish'}
                  </button>
                  <button
                    onClick={() => toggleFeature(quiz.id)}
                    title={quiz.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors text-sm"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    title="Delete quiz"
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-white/10 text-slate-500 text-xs">
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} found
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
