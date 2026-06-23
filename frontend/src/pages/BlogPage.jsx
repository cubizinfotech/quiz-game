import { useNavigate } from 'react-router-dom';

const POSTS = [
  {
    id: 1,
    title: 'How to Maximize Your Quiz Score',
    excerpt: 'Learn the best strategies to improve your accuracy and climb the leaderboard faster.',
    tag: 'Tips & Tricks',
    date: 'Jun 10, 2025',
    emoji: '🧠',
  },
  {
    id: 2,
    title: 'Understanding the Coin Reward System',
    excerpt: 'A breakdown of how coins are calculated, how to earn bonus coins, and what they can be used for.',
    tag: 'Guide',
    date: 'Jun 5, 2025',
    emoji: '🪙',
  },
  {
    id: 3,
    title: 'New Quiz Categories Coming Soon',
    excerpt: 'Exciting new categories including Science, Sports, and World History are on their way!',
    tag: 'Announcement',
    date: 'May 28, 2025',
    emoji: '🚀',
  },
];

export default function BlogPage() {
  const navigate = useNavigate();

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
        <h1 className="text-white font-bold text-lg">Blog</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-white font-black text-xl mb-1">Latest Updates</h2>
          <p className="text-gray-400 text-sm">Tips, announcements, and guides from the QuizGame team.</p>
        </div>

        {/* Posts */}
        {POSTS.map((post) => (
          <div key={post.id} className="bg-card border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-2xl">
                {post.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {post.tag}
                  </span>
                  <span className="text-gray-600 text-xs">{post.date}</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-snug mb-1">{post.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{post.excerpt}</p>
              </div>
            </div>
          </div>
        ))}

        <p className="text-center text-gray-600 text-xs pt-2">More posts coming soon!</p>
      </div>
    </div>
  );
}
