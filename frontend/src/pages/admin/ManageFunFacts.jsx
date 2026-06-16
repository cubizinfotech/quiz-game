import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const EMPTY_FORM = { title: '', description: '', image: '', isActive: true };

export default function ManageFunFacts() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get('/fun-facts/admin/all').then((r) => setFacts(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (fact) => {
    setForm({ title: fact.title, description: fact.description, image: fact.image || '', isActive: fact.isActive });
    setEditId(fact.id);
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, image: form.image || undefined };
      if (editId) {
        await api.put(`/fun-facts/${editId}`, payload);
      } else {
        await api.post('/fun-facts', payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fun fact?')) return;
    try {
      await api.delete(`/fun-facts/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout title="Fun Facts">
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{facts.length} facts</p>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
        >
          + New Fact
        </button>
      </div>

      {/* Modal — bottom-sheet on mobile, centered dialog on desktop */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4"
          onClick={closeForm}
        >
          <div
            className="w-full md:max-w-lg bg-slate-900 rounded-t-3xl md:rounded-2xl p-6 pb-8 md:pb-6 border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{editId ? 'Edit Fun Fact' : 'New Fun Fact'}</h2>
              <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Title *</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Fun fact title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Description *</label>
                <textarea
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  placeholder="The fun fact content…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Image URL (optional)</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://…"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-24 w-auto rounded-xl object-cover" />
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-slate-300 text-sm">Active</span>
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 transition-all"
              >
                {saving ? 'Saving…' : editId ? 'Update Fact' : 'Create Fact'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : facts.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500 text-sm">
          <div className="text-4xl mb-3">💡</div>
          <p>No fun facts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {facts.map((fact) => (
            <div key={fact.id} className="bg-slate-900 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
              <div className="flex gap-4">
                {fact.image ? (
                  <img src={fact.image} alt={fact.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-3xl shrink-0">💡</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 justify-between mb-1">
                    <p className="text-white text-sm font-semibold leading-snug">{fact.title}</p>
                    {!fact.isActive && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-lg shrink-0">Inactive</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{fact.description}</p>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => openEdit(fact)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 bg-white/5 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(fact.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
