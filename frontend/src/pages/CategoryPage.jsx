import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import QuizCard from '../components/QuizCard';
import AdBlock from '../components/AdBlock';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [ads, setAds] = useState({ header: null, footer: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/categories/${slug}`),
      api.get('/ads'),
    ]).then(([catRes, adRes]) => {
      setCategory(catRes.data.data);
      const adMap = { header: null, footer: null };
      for (const ad of adRes.data.data) {
        if ((ad.position === 'header' || ad.position === 'footer') && !adMap[ad.position]) {
          adMap[ad.position] = ad;
        }
      }
      setAds(adMap);
    }).catch((err) => {
      setError(err.response?.data?.message || 'Category not found');
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mobile-shell flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-shell flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-white text-xl font-bold mb-2">{error}</h2>
        <Link to="/" className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mobile-shell pb-6">
      {ads.header && (
        <div className="px-4 pt-3">
          <AdBlock ad={ads.header} />
        </div>
      )}

      {/* Category Header */}
      <div className="px-4 pt-5 pb-4">
        <Link to="/" className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition-colors">
          <span>←</span> Back
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0"
            style={{ backgroundColor: (category.color || '#2563EB') + '22', border: `2px solid ${(category.color || '#2563EB')}40` }}
          >
            {category.icon || '📚'}
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-gray-400 text-sm mt-1">{category.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {category.quizzes?.length || 0} {category.quizzes?.length === 1 ? 'quiz' : 'quizzes'} available
            </p>
          </div>
        </div>
      </div>

      {/* Quizzes */}
      <div className="px-4">
        {category.quizzes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-gray-400 text-sm">No quizzes in this category yet.</p>
            <p className="text-gray-600 text-xs mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {category.quizzes?.map((quiz) => (
              <QuizCard key={quiz.id} quiz={{ ...quiz, category }} />
            ))}
          </div>
        )}
      </div>

      {ads.footer && (
        <div className="px-4 mt-5">
          <AdBlock ad={ads.footer} />
        </div>
      )}
    </div>
  );
}
