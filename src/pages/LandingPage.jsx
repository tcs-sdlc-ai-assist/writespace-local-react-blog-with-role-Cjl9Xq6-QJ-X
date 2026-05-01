import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';

const FEATURES = [
  {
    icon: '✍️',
    title: 'Write & Publish',
    description:
      'Create beautiful blog posts with a clean, distraction-free writing experience. Share your thoughts with the world.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: '👥',
    title: 'Role-Based Access',
    description:
      'Admins manage users and all content. Authors control their own posts. Everyone enjoys a personalized experience.',
    gradient: 'from-violet-500 to-pink-500',
  },
  {
    icon: '⚡',
    title: 'Instant & Local',
    description:
      'No server required. All data is stored locally in your browser for lightning-fast performance and total privacy.',
    gradient: 'from-pink-500 to-teal-500',
  },
];

const ACCENT_COLORS = [
  'border-indigo-500',
  'border-violet-500',
  'border-pink-500',
];

/**
 * Public landing page component rendered at '/'.
 * Displays hero section, features section, latest posts preview, and footer.
 * @returns {JSX.Element} The landing page.
 */
function LandingPage() {
  const navigate = useNavigate();
  const session = getCurrentUser();

  const allPosts = getPosts();
  const latestPosts = allPosts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const handlePostClick = (postId) => {
    if (session) {
      navigate(`/blog/${postId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Welcome to{' '}
            <span className="text-pink-200">WriteSpace</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            A clean, modern blogging platform where ideas come to life.
            Write, share, and manage your content — all from your browser.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 text-base font-semibold bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-base font-semibold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Everything you need to start blogging, right in your browser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br ${feature.gradient} text-white text-2xl mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      {latestPosts.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                Latest Posts
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Check out what our community has been writing about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post, index) => {
                const excerpt =
                  post.content && post.content.length > 120
                    ? post.content.slice(0, 120) + '…'
                    : post.content || '';

                const formattedDate = post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';

                const authorRole =
                  post.authorId === 'admin-001' ? 'admin' : 'user';

                const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

                return (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className={`bg-slate-50 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${accentColor} flex flex-col h-full`}
                    role="article"
                    aria-label={post.title}
                  >
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-3">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 flex-1">
                        {excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200">
                        <div className="flex items-center space-x-2">
                          {getAvatar(authorRole, 'sm')}
                          <span className="text-sm font-medium text-slate-700">
                            {post.authorName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wide">
                WriteSpace
              </span>
              <span className="text-sm text-slate-400">
                — Your space to write.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { LandingPage };
export default LandingPage;