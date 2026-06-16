import { Link } from 'react-router-dom';

export default function QuizCard({ quiz, featured = false }) {
  const questionCount = quiz._count?.questions ?? 0;
  const playCount = quiz._count?.quizAttempts ?? quiz.totalPlays ?? 0;

  return (
    <Link
      to={`/quiz/${quiz.slug}`}
      className={`block rounded-2xl bg-card border border-white/10 hover:border-primary/50 transition-all active:scale-95 overflow-hidden ${
        featured ? 'relative' : ''
      }`}
    >
      {featured && quiz.thumbnail && (
        <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-sm leading-tight flex-1">{quiz.title}</h3>
          {quiz.isFeatured && (
            <span className="shrink-0 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>

        {quiz.category && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm">{quiz.category.icon || '📚'}</span>
            <span className="text-xs text-gray-400">{quiz.category.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>❓</span> {questionCount} Qs
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>👥</span> {playCount}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-lg">
            <span className="text-xs">🏆</span>
            <span className="text-xs font-semibold">{quiz.rewardPoints} pts</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
