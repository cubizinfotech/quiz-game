import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

export default function LoginPage() {
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">Q</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to track your progress</p>
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
                autoComplete="current-password"
                className="w-full bg-bg border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 disabled:opacity-60 active:scale-95 transition-all mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" state={{ from }} className="text-primary font-semibold hover:text-blue-400">
            Create one free
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
