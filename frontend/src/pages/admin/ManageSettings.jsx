import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function ManageSettings() {
  const [form, setForm] = useState({
    site_name: '',
    logo: '',
    favicon: '',
    footer_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings').then((r) => {
      const data = r.data.data;
      setForm({
        site_name: data.site_name || '',
        logo: data.logo || '',
        favicon: data.favicon || '',
        footer_text: data.footer_text || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/settings', form);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      {success && (
        <div className="bg-green-500/15 border border-green-500/40 text-green-400 text-sm px-4 py-3 rounded-xl mb-5">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings panels */}
          <div className="lg:col-span-2 space-y-5">
            {/* Site Identity */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-base mb-4 pb-3 border-b border-white/10">
                Site Identity
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Site Name</label>
                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="QuizGame"
                    value={form.site_name}
                    onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Logo URL</label>
                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="/logo.png or https://…"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  />
                  {form.logo && (
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      className="mt-3 h-12 w-auto object-contain rounded-xl bg-white/5 p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Favicon URL</label>
                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="/favicon.ico"
                    value={form.favicon}
                    onChange={(e) => setForm({ ...form, favicon: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-base mb-4 pb-3 border-b border-white/10">
                Footer
              </h2>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Footer Text</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="© 2026 QuizGame. All rights reserved."
                  value={form.footer_text}
                  onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Preview + Save */}
          <div className="space-y-5">
            {/* Preview card */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Preview</h2>
              <div className="flex items-center gap-3 mb-4">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-black">Q</span>
                  </div>
                )}
                <div>
                  <p className="text-white font-bold text-sm">{form.site_name || 'QuizGame'}</p>
                  <p className="text-slate-500 text-xs">{form.footer_text || '© 2024 QuizGame'}</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs">This is how your site appears in the navbar and footer.</p>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 active:scale-95 transition-all"
            >
              {saving ? 'Saving…' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
