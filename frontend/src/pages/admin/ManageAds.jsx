import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const EMPTY_FORM = {
  name: '',
  position: 'header',
  adType: 'html',
  content: '',
  isActive: true,
  delaySeconds: 0,
  frequency: 1,
};

const POSITIONS = [
  { value: 'header',             label: 'Header',                   hint: 'Top of every page' },
  { value: 'middle',             label: 'Middle',                   hint: 'Mid-page banner' },
  { value: 'footer',             label: 'Footer',                   hint: 'Bottom of every page' },
  { value: 'welcome_popup',      label: 'Welcome Popup',            hint: 'Popup on homepage load (delay applies)' },
  { value: 'before_quiz',        label: 'Before Quiz',              hint: 'Shown before quiz starts (delay applies)' },
  { value: 'between_questions',  label: 'Between Questions',        hint: 'Shown every N questions (frequency applies)' },
  { value: 'wrong_answer',       label: 'Wrong Answer',             hint: 'Shown when user picks wrong answer' },
  { value: 'quiz_complete',      label: 'Quiz Complete',            hint: 'Shown before results are revealed' },
  { value: 'rewarded_video',     label: 'Rewarded Video',           hint: 'Watch-to-double on result page & insufficient-coins wall (delay = watch duration)' },
  { value: 'quickstart_done',    label: 'After Quick Start',        hint: 'Shown when user clicks "Play Now" after Quick Start quiz (delay applies)' },
  { value: 'quiz_card_click',    label: 'Quiz Card Click',          hint: 'Shown when user taps a quiz card before entering lobby (delay applies)' },
  { value: 'quiz_bottom',        label: 'Quiz Bottom Banner',       hint: 'Persistent banner at the bottom of the quiz play page' },
  { value: 'post_quiz_bonus',    label: 'Post-Quiz Bonus Popup',    hint: 'Popup after results claiming 100 bonus coins — user watches ad to claim (delay = watch duration)' },
];

const AD_TYPES = ['html', 'adsense'];

const positionColors = {
  header:             'bg-blue-500/20 text-blue-400',
  middle:             'bg-purple-500/20 text-purple-400',
  footer:             'bg-orange-500/20 text-orange-400',
  welcome_popup:      'bg-pink-500/20 text-pink-400',
  before_quiz:        'bg-cyan-500/20 text-cyan-400',
  between_questions:  'bg-indigo-500/20 text-indigo-400',
  wrong_answer:       'bg-red-500/20 text-red-400',
  quiz_complete:      'bg-green-500/20 text-green-400',
  rewarded_video:     'bg-yellow-500/20 text-yellow-400',
  quickstart_done:    'bg-teal-500/20 text-teal-400',
  quiz_card_click:    'bg-violet-500/20 text-violet-400',
  quiz_bottom:        'bg-slate-400/20 text-slate-300',
  post_quiz_bonus:    'bg-amber-500/20 text-amber-400',
};

const positionLabel = Object.fromEntries(POSITIONS.map((p) => [p.value, p.label]));

const showDelay = (pos) => ['welcome_popup', 'before_quiz', 'rewarded_video', 'quickstart_done', 'quiz_card_click', 'post_quiz_bonus'].includes(pos);
const showFrequency = (pos) => pos === 'between_questions';

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get('/ads/admin/all').then((r) => setAds(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (ad) => {
    setForm({
      name: ad.name,
      position: ad.position,
      adType: ad.adType,
      content: ad.content,
      isActive: ad.isActive,
      delaySeconds: ad.delaySeconds ?? 0,
      frequency: ad.frequency ?? 1,
    });
    setEditId(ad.id);
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
      const payload = {
        ...form,
        delaySeconds: Number(form.delaySeconds) || 0,
        frequency: Number(form.frequency) || 1,
      };
      if (editId) {
        await api.put(`/ads/${editId}`, payload);
      } else {
        await api.post('/ads', payload);
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
    if (!window.confirm('Delete this ad?')) return;
    try {
      await api.delete(`/ads/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const f = form; // shorthand

  return (
    <AdminLayout title="Advertisements">
      {error && !showForm && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{ads.length} ads</p>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
        >
          + New Ad
        </button>
      </div>

      {/* Modal — bottom-sheet on mobile, centered dialog on desktop */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4"
          onClick={closeForm}
        >
          <div
            className="w-full md:max-w-lg bg-slate-900 rounded-t-3xl md:rounded-2xl p-6 pb-8 md:pb-6 border border-white/10 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{editId ? 'Edit Ad' : 'New Ad'}</h2>
              <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Ad Name *</label>
                <input
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Homepage Welcome Popup"
                  value={f.name}
                  onChange={(e) => setForm({ ...f, name: e.target.value })}
                  required
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Placement</label>
                <select
                  className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={f.position}
                  onChange={(e) => setForm({ ...f, position: e.target.value })}
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1.5">
                  {POSITIONS.find((p) => p.value === f.position)?.hint}
                </p>
              </div>

              {/* Ad Type */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">Ad Type</label>
                <div className="flex gap-2">
                  {AD_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...f, adType: t })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        f.adType === t
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/30'
                      }`}
                    >
                      {t === 'adsense' ? 'Google AdSense' : 'Custom HTML'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delay — only for popup/before_quiz/rewarded */}
              {showDelay(f.position) && (
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    {f.position === 'rewarded_video' ? 'Watch Duration (seconds)' : 'Delay Before Showing (seconds)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={f.delaySeconds}
                    onChange={(e) => setForm({ ...f, delaySeconds: e.target.value })}
                  />
                  <p className="text-slate-500 text-xs mt-1.5">
                    {f.position === 'rewarded_video'
                      ? 'User must watch for this many seconds before claiming reward'
                      : 'Popup appears after this many seconds (0 = immediately)'}
                  </p>
                </div>
              )}

              {/* Frequency — only for between_questions */}
              {showFrequency(f.position) && (
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">Show Every N Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    value={f.frequency}
                    onChange={(e) => setForm({ ...f, frequency: e.target.value })}
                  />
                  <p className="text-slate-500 text-xs mt-1.5">
                    e.g. 2 = show after every 2nd answered question
                  </p>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                  {f.adType === 'adsense' ? 'AdSense Code *' : 'HTML Content *'}
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono transition-colors"
                  placeholder={f.adType === 'adsense' ? 'Paste your Google AdSense code…' : 'Paste HTML ad code or embed…'}
                  rows={5}
                  value={f.content}
                  onChange={(e) => setForm({ ...f, content: e.target.value })}
                  required
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div
                  onClick={() => setForm({ ...f, isActive: !f.isActive })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${f.isActive ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-slate-300 text-sm">Active</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-500 disabled:opacity-60 transition-all"
              >
                {saving ? 'Saving…' : editId ? 'Update Ad' : 'Create Ad'}
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
      ) : ads.length === 0 ? (
        <div className="bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500 text-sm">
          <div className="text-4xl mb-3">📢</div>
          <p>No ads yet. Create your first ad!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-slate-900 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-white text-sm font-semibold leading-snug">{ad.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {!ad.isActive && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-lg">Off</span>
                  )}
                  <button
                    onClick={() => openEdit(ad)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 text-xs transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-lg ${positionColors[ad.position] || 'bg-slate-700 text-slate-400'}`}>
                  {positionLabel[ad.position] || ad.position}
                </span>
                <span className="text-xs text-slate-500 uppercase">{ad.adType}</span>
                {showDelay(ad.position) && (ad.delaySeconds > 0) && (
                  <span className="text-xs text-slate-500">{ad.delaySeconds}s delay</span>
                )}
                {showFrequency(ad.position) && (
                  <span className="text-xs text-slate-500">every {ad.frequency}q</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
