import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';

/**
 * Authenticated blog list page rendered at '/blogs'.
 * Displays all posts from localStorage in a responsive grid sorted newest first.
 * Shows empty state with CTA if no posts exist.
 * @returns {JSX.Element} The home/blog list page.
 */
function Home() {
  const allPosts = getPosts();
  const sortedPosts = allPosts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              All Posts
            </h1>
            <Link
              to="/write"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Write New Post
            </Link>
          </div>

          {sortedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 text-3xl mb-4">
                ✍️
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                No posts yet
              </h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                It looks like there are no blog posts yet. Be the first to share your thoughts with the community!
              </p>
              <Link
                to="/write"
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Write Your First Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export { Home };
export default Home;