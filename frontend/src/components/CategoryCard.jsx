import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const count = category._count?.quizzes ?? 0;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-white/10 hover:border-primary/50 transition-all active:scale-95"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
        style={{ backgroundColor: category.color + '22', border: `2px solid ${category.color}40` }}
      >
        {category.icon || '📚'}
      </div>
      <span className="text-white text-xs font-semibold text-center leading-tight">{category.name}</span>
      <span className="text-gray-400 text-xs">{count} {count === 1 ? 'quiz' : 'quizzes'}</span>
    </Link>
  );
}
