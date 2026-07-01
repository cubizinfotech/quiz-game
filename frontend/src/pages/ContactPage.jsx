import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
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
        <h1 className="text-white font-bold text-lg">Contact Us</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="text-white font-black text-xl mb-1">Get in Touch</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Have a question, suggestion, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📧', label: 'Email', value: 'support@Quziky.com' },
            { icon: '⏱️', label: 'Response Time', value: 'Within 24 hours' },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-gray-500 text-xs mb-0.5">{item.label}</p>
              <p className="text-white text-xs font-semibold leading-snug">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {sent ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-green-400 font-bold text-base mb-1">Message Sent!</h3>
            <p className="text-gray-400 text-sm">
              Thanks for reaching out. We'll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold text-sm">Send us a Message</h3>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Your Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold block mb-1.5">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="How can we help you?"
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-600 active:scale-95 transition-all"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
