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
  {
    id: 4,
    title: 'Top 5 Bollywood Quiz Questions That Stump Everyone',
    excerpt: 'Think you know Bollywood? These five tricky questions have the lowest correct-answer rates on our platform.',
    tag: 'Fun',
    date: 'May 20, 2025',
    emoji: '🎬',
  },
  {
    id: 5,
    title: 'How to Use Lifelines Wisely',
    excerpt: 'Lifelines can save your score — but only if used at the right moment. Here\'s a smart guide on when to use each one.',
    tag: 'Tips & Tricks',
    date: 'May 15, 2025',
    emoji: '💡',
  },
  {
    id: 6,
    title: 'Cricket Quiz: Test Your IPL Knowledge',
    excerpt: 'IPL fans, this one\'s for you! Play our Cricket category and see how well you know your favourite teams and players.',
    tag: 'Sports',
    date: 'May 10, 2025',
    emoji: '🏏',
  },
  {
    id: 7,
    title: 'Daily Login Streaks — Why Consistency Pays Off',
    excerpt: 'Logging in every day builds your streak and unlocks bonus coin rewards. Find out how streaks are calculated.',
    tag: 'Guide',
    date: 'May 5, 2025',
    emoji: '🔥',
  },
  {
    id: 8,
    title: 'Introducing the Leaderboard: Climb to the Top',
    excerpt: 'The new leaderboard ranks players by total coins earned this week. Here\'s how the scoring works and how to rank higher.',
    tag: 'Announcement',
    date: 'Apr 28, 2025',
    emoji: '🏆',
  },
  {
    id: 9,
    title: 'GK Quiz: Boost Your General Knowledge in 10 Minutes',
    excerpt: 'General Knowledge quizzes are one of the best ways to sharpen your mind. Try our GK category and challenge yourself daily.',
    tag: 'Tips & Tricks',
    date: 'Apr 20, 2025',
    emoji: '🌍',
  },
  {
    id: 10,
    title: 'How We Pick Our Quiz Questions',
    excerpt: 'Every question on Quziky goes through a quality check. Learn about our content process and how we ensure accuracy.',
    tag: 'Behind the Scenes',
    date: 'Apr 14, 2025',
    emoji: '🔍',
  },
  {
    id: 11,
    title: 'Business & Finance Quiz: Are You Financially Literate?',
    excerpt: 'Our Business category tests everything from stock markets to startup fundamentals. See how you score!',
    tag: 'Finance',
    date: 'Apr 8, 2025',
    emoji: '📈',
  },
  {
    id: 12,
    title: 'Referral Program: Earn Coins by Inviting Friends',
    excerpt: 'Share your invite link and earn bonus coins for every friend who signs up and plays their first quiz.',
    tag: 'Announcement',
    date: 'Apr 1, 2025',
    emoji: '🎁',
  },
  {
    id: 13,
    title: 'Science Quiz: From Atoms to the Universe',
    excerpt: 'Explore physics, chemistry, biology, and space in our Science category — now live with 50+ questions.',
    tag: 'Science',
    date: 'Mar 25, 2025',
    emoji: '🔬',
  },
  {
    id: 14,
    title: '5 Common Mistakes Quiz Players Make',
    excerpt: 'Rushing through questions, skipping lifelines, ignoring the timer — avoid these habits to boost your score significantly.',
    tag: 'Tips & Tricks',
    date: 'Mar 18, 2025',
    emoji: '⚠️',
  },
  {
    id: 15,
    title: 'Quziky Reaches 1 Million Players!',
    excerpt: 'We\'ve hit a huge milestone — 1 million players and counting! Thank you for being part of this incredible journey.',
    tag: 'Milestone',
    date: 'Mar 10, 2025',
    emoji: '🎉',
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
          <p className="text-gray-400 text-sm">Tips, announcements, and guides from the Quziky team.</p>
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

        <p className="text-center text-gray-600 text-xs pt-2">Stay tuned for more updates!</p>
      </div>
    </div>
  );
}
