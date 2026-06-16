import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

export default function SignupPage() {
  const { signup, isGuest } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-shell min-h-screen bg-bg flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">Q</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Create your account</h1>
          {isGuest ? (
            <p className="text-green-400 text-sm font-medium">
              ✓ Your quiz history will be saved!
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Free forever. Start tracking your progress.</p>
          )}
        </div>

        {/* Form */}
        <div className="bg-card border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Username</label>
              <input
                type="text"
                autoComplete="username"
                className="w-full bg-bg border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="quizmaster"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <p className="text-gray-600 text-xs mt-1">Letters, numbers, underscores. 3–50 chars.</p>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full bg-bg border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-bg border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-bg border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 disabled:opacity-60 active:scale-95 transition-all mt-2"
            >
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-primary font-semibold hover:text-blue-400">
            Sign in
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400">
            Continue as guest →
          </Link>
        </p>
      </div>
    </div>
  );
}
