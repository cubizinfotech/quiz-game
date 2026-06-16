import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const EMPTY_FORM = { name: '', description: '', icon: '', color: '#2563EB', isActive: true };

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get('/categories').then((r) => setCategories(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color, isActive: cat.isActive });
    setEditId(cat.id);
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
      if (editId) {
        await api.put(`/categories/${editId}`, form);
      } else {
        await api.post('/categories', form);
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
    if (!window.confirm('Delete this category? All quizzes in it will be deleted too.')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{categories.length} categories</p>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
        >
          + New Category
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
              <h2 className="text-white font-bold text-lg">{editId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Name *</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Category name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Description</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Icon Emoji</label>
                  <input
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. 🧠"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Color</label>
                  <div className="flex items-center gap-3 bg-slate-800 border border-white/10 rounded-xl px-4 py-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-slate-400 text-sm font-mono">{form.color}</span>
                  </div>
                </div>
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
                {saving ? 'Saving…' : editId ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500 text-sm">
          <div className="text-4xl mb-3">📚</div>
          <p>No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/20 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}40` }}
              >
                {cat.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold truncate">{cat.name}</span>
                  {!cat.isActive && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-lg shrink-0">Inactive</span>
                  )}
                </div>
                <span className="text-slate-500 text-xs">{cat._count?.quizzes ?? 0} {cat._count?.quizzes === 1 ? 'quiz' : 'quizzes'}</span>
                {cat.description && (
                  <p className="text-slate-500 text-xs truncate mt-0.5">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 transition-colors text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
