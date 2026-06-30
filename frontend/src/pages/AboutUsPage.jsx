import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '1M+',  label: 'Players' },
  { value: '25+',  label: 'Categories' },
  { value: '500+', label: 'Quizzes' },
  { value: '10M+', label: 'Questions Answered' },
];

const VALUES = [
  { emoji: '🎯', title: 'Fun First',       desc: 'Every quiz is designed to be engaging, challenging, and rewarding.' },
  { emoji: '🏆', title: 'Fair Play',       desc: 'Transparent coin rewards and leaderboards that everyone can trust.' },
  { emoji: '📚', title: 'Quality Content', desc: 'Every question is reviewed for accuracy before it goes live.' },
  { emoji: '🌍', title: 'For Everyone',    desc: 'From GK to Bollywood — something for every kind of quiz lover.' },
];

export default function AboutUsPage() {
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
        <h1 className="text-white font-bold text-lg">About Us</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Hero banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🎮</div>
          <h2 className="text-white font-black text-2xl mb-2">QuizGame</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            India's fastest-growing quiz platform where knowledge meets rewards.
          </p>
        </div>

        {/* Who we are */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-3">Who We Are</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            QuizGame was built by a passionate team of developers and educators who believe
            learning should be fun and rewarding. We started with a simple idea — what if you
            could earn real coins just by answering questions correctly?
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Today, millions of players across India compete daily across categories like
            GK, Sports, Bollywood, Cricket, Finance, and Science — proving that curiosity
            is its own reward.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-4">QuizGame by the Numbers</h3>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-bg border border-white/10 rounded-xl py-4 text-center">
                <p className="text-primary font-black text-2xl">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our mission */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-3">Our Mission</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            To make learning addictive. We want every person who opens QuizGame to walk
            away a little smarter, a little richer in coins, and excited to come back tomorrow.
            We are committed to building a platform that is fair, fun, and accessible to everyone.
          </p>
        </div>

        {/* Our values */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-4">Our Values</h3>
          <div className="flex flex-col gap-3">
            {VALUES.map((v) => (
              <div key={v.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                  {v.emoji}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{v.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact nudge */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            Have a question or suggestion? We'd love to hear from you.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Contact Us
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs pt-2 pb-2">
          © 2025 QuizGame. Made with ❤️ in India.
        </p>
      </div>
    </div>
  );
}
