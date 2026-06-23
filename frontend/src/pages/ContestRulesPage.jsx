import { useNavigate } from 'react-router-dom';

const RULES = [
  {
    title: 'Eligibility',
    icon: '✅',
    points: [
      'Open to all registered users aged 13 and above.',
      'Guest users can play but cannot claim prizes.',
      'One account per person — duplicate accounts will be disqualified.',
    ],
  },
  {
    title: 'How to Participate',
    icon: '🎯',
    points: [
      'Create a free account and log in.',
      'Browse available quizzes and pick one.',
      'Answer all questions to complete the quiz.',
      'Earn points based on correct answers.',
    ],
  },
  {
    title: 'Scoring & Points',
    icon: '🏆',
    points: [
      'Each quiz has a fixed reward of points upon completion.',
      'Points are calculated proportionally to correct answers.',
      'Bonus coins are awarded for perfect scores.',
      'Points accumulate across all quizzes on the leaderboard.',
    ],
  },
  {
    title: 'Coins & Rewards',
    icon: '🪙',
    points: [
      'Coins are earned by completing quizzes and daily Quick Start.',
      'Coins can be redeemed for special rewards (coming soon).',
      'Coins do not expire as long as your account is active.',
    ],
  },
  {
    title: 'Fair Play',
    icon: '⚖️',
    points: [
      'Using bots, scripts, or automated tools is strictly prohibited.',
      'Sharing answers during live contests will result in disqualification.',
      'Any attempt to exploit bugs must be reported, not abused.',
      'Decisions made by the platform are final.',
    ],
  },
];

export default function ContestRulesPage() {
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
        <h1 className="text-white font-bold text-lg">Contest Rules</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">📜</div>
          <h2 className="text-white font-black text-xl mb-1">Rules & Guidelines</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Please read and understand all rules before participating in quizzes and contests.
          </p>
        </div>

        {/* Rule sections */}
        {RULES.map((section) => (
          <div key={section.title} className="bg-card border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h3 className="text-white font-bold text-base">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-center text-gray-600 text-xs pt-2">
          Rules are subject to change. Last updated June 2025.
        </p>
      </div>
    </div>
  );
}
