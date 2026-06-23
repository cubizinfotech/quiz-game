import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ISSUE_TYPES = [
  'Quiz content error',
  'Wrong answer marked correct',
  'App bug / crash',
  'Account / login issue',
  'Coins not credited',
  'Other',
];

export default function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: '', description: '', email: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mobile-shell min-h-screen bg-bg pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
        >
          ←
        </button>
        <h1 className="text-white font-bold text-lg">Report an Issue</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-white font-black text-xl mb-1">Found a Problem?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Help us improve by reporting bugs, errors, or anything that doesn't seem right.
          </p>
        </div>

        {sent ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-green-400 font-bold text-base mb-1">Report Submitted!</h3>
            <p className="text-gray-400 text-sm mb-4">
              Thank you for helping us improve. Our team will review your report shortly.
            </p>
            <button
              onClick={() => { setSent(false); setForm({ type: '', description: '', email: '' }); }}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
            {/* Issue type */}
            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Issue Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="" disabled>Select issue type…</option>
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the issue in detail. Include the quiz name, question, or page where it happened."
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">
                Your Email <span className="text-gray-600">(optional — for follow-up)</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm active:scale-95 transition-all"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
