import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

function StatCard({ label, value, icon, badge, badgeColor, sub }) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div className="text-4xl font-black text-white mb-1">{value ?? '—'}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      {sub && <div className="text-slate-600 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/recent-attempts'),
    ]).then(([s, a]) => {
      setStats(s.data.data);
      setAttempts(a.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Main stats — 2 col mobile → 3 col lg → 5 col xl */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Quizzes"
          value={stats?.totalQuizzes}
          icon="🎯"
          badge={`${stats?.publishedQuizzes ?? 0} live`}
          badgeColor="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          label="Categories"
          value={stats?.totalCategories}
          icon="📚"
          badge={`${stats?.activeCategories ?? 0} active`}
          badgeColor="bg-green-500/20 text-green-400"
        />
        <StatCard
          label="Registered Users"
          value={stats?.registeredUsers}
          icon="👤"
          badge="registered"
          badgeColor="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          label="Guest Sessions"
          value={stats?.guestUsers}
          icon="👥"
          badge="anonymous"
          badgeColor="bg-slate-500/20 text-slate-400"
          sub={`${stats?.totalUsers ?? 0} total users`}
        />
        <StatCard
          label="Quiz Attempts"
          value={stats?.totalAttempts}
          icon="📝"
          badge="all time"
          badgeColor="bg-yellow-500/20 text-yellow-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-white font-bold text-base mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/quizzes/new"
              className="flex flex-col items-center gap-2 bg-blue-600/10 border border-blue-600/30 text-blue-400 rounded-xl p-4 text-sm font-semibold hover:bg-blue-600/20 transition-colors text-center"
            >
              <span className="text-2xl">➕</span>
              <span>New Quiz</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex flex-col items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 text-sm font-semibold hover:bg-green-500/20 transition-colors text-center"
            >
              <span className="text-2xl">📚</span>
              <span>Categories</span>
            </Link>
            <Link
              to="/admin/ads"
              className="flex flex-col items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-4 text-sm font-semibold hover:bg-yellow-500/20 transition-colors text-center"
            >
              <span className="text-2xl">📢</span>
              <span>Manage Ads</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex flex-col items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl p-4 text-sm font-semibold hover:bg-purple-500/20 transition-colors text-center"
            >
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="lg:col-span-2">
          <h2 className="text-white font-bold text-base mb-4">Recent Attempts</h2>
          {attempts.length === 0 ? (
            <div className="bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center py-16 text-slate-500 text-sm">
              No attempts yet.
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3">Quiz</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Player</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3">Score</th>
                    <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-white text-sm font-medium truncate max-w-[160px] block">
                          {a.quiz?.title}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {a.user ? (
                          <span className="text-slate-400 text-sm flex items-center gap-1.5">
                            {a.user.isGuest && (
                              <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">guest</span>
                            )}
                            {a.user.username}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm">Anonymous</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-lg ${
                          a.score >= 80
                            ? 'bg-green-500/20 text-green-400'
                            : a.score >= 50
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {a.score}%
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className="text-slate-500 text-sm">
                          {new Date(a.completedAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
