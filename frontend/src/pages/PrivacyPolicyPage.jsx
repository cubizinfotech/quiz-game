import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'When you create an account, we collect your username and email address. If you play as a guest, no personal data is stored. We also collect gameplay data such as quiz attempts, scores, and coin balance to power your experience.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to operate the platform, calculate and display your coin balance, show leaderboard rankings, send important account-related notifications, and improve our quiz content and features.',
  },
  {
    title: '3. Cookies & Local Storage',
    body: 'QuizGame uses cookies and browser local storage to keep you logged in between sessions and to remember your onboarding progress. We do not use cookies for advertising tracking purposes.',
  },
  {
    title: '4. Third-Party Services',
    body: 'We may display advertisements served by third-party ad networks including Google AdSense. These services may collect anonymised usage data in accordance with their own privacy policies. We do not share your personal account data with advertisers.',
  },
  {
    title: '5. Data Security',
    body: 'Your password is stored using industry-standard hashing and is never stored in plain text. We use HTTPS to encrypt all data in transit between your device and our servers.',
  },
  {
    title: '6. Children\'s Privacy',
    body: 'QuizGame is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us so we can remove it.',
  },
  {
    title: '7. Your Rights',
    body: 'You may request deletion of your account and associated data at any time by contacting us through the Contact Us page. Upon a valid request, we will permanently remove your personal information from our systems within 30 days.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. When we do, the updated date at the top of this page will change. We encourage you to review this page periodically to stay informed.',
  },
  {
    title: '9. Contact Us',
    body: 'If you have any questions or concerns about this Privacy Policy, please reach out to us via the Contact Us page in the app. We are happy to help.',
  },
];

export default function PrivacyPolicyPage() {
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
        <h1 className="text-white font-bold text-lg">Privacy Policy</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="text-white font-black text-xl mb-1">Your Privacy Matters</h2>
          <p className="text-gray-400 text-sm">Last updated: June 30, 2025</p>
        </div>

        {/* Intro */}
        <div className="bg-card border border-white/10 rounded-2xl p-5">
          <p className="text-gray-300 text-sm leading-relaxed">
            At <span className="text-white font-semibold">QuizGame</span>, we are committed to
            protecting your personal information and being transparent about the data we collect.
            This Privacy Policy explains what information we collect, why we collect it, and how
            we use it.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-card border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-2">{section.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}

        <p className="text-center text-gray-600 text-xs pt-2 pb-2">
          © 2025 QuizGame. All rights reserved.
        </p>
      </div>
    </div>
  );
}
