import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, getUsers, removePost } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';

/**
 * Admin-only dashboard page rendered at '/admin'.
 * Displays gradient banner header with welcome message, four StatCard components,
 * quick-action buttons, and recent posts section with edit/delete controls.
 * Non-admins are redirected via ProtectedRoute wrapper in the router.
 * @returns {JSX.Element} The admin dashboard page.
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const session = getCurrentUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);

  const allPosts = getPosts();
  const allUsers = getUsers();

  const totalPosts = allPosts.length;
  const totalUsers = allUsers.length;
  const totalAdmins = allUsers.filter((u) => u.role === 'admin').length;
  const totalRegularUsers = allUsers.filter((u) => u.role === 'user').length;

  const recentPosts = allPosts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const handleEditPost = (postId) => {
    navigate(`/blog/${postId}/edit`);
  };

  const handleDeleteClick = (postId) => {
    setDeletePostId(postId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletePostId) {
      removePost(deletePostId);
    }
    setShowConfirm(false);
    setDeletePostId(null);
    navigate('/admin', { replace: true });
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeletePostId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Welcome back, {session ? session.displayName : 'Admin'}!
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Here&apos;s an overview of your WriteSpace platform.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Posts"
              value={totalPosts}
              icon="📝"
              gradient="from-indigo-500 to-violet-500"
            />
            <StatCard
              label="Total Users"
              value={totalUsers}
              icon="👥"
              gradient="from-violet-500 to-pink-500"
            />
            <StatCard
              label="Total Admins"
              value={totalAdmins}
              icon="👑"
              gradient="from-pink-500 to-teal-500"
            />
            <StatCard
              label="Total Regular Users"
              value={totalRegularUsers}
              icon="📖"
              gradient="from-teal-500 to-indigo-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4 mb-8">
            <Link
              to="/write"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Write New Post
            </Link>
            <Link
              to="/admin/users"
              className="px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Manage Users
            </Link>
          </div>

          {/* Recent Posts */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Recent Posts
            </h2>
            {recentPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-2xl mb-4">
                  ✍️
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  No posts yet
                </h3>
                <p className="text-sm text-slate-500 mb-4 max-w-md">
                  There are no blog posts yet. Create the first one!
                </p>
                <Link
                  to="/write"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Write Your First Post
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => {
                  const authorRole =
                    post.authorId === 'admin-001' ? 'admin' : 'user';

                  const formattedDate = post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';

                  const excerpt =
                    post.content && post.content.length > 100
                      ? post.content.slice(0, 100) + '…'
                      : post.content || '';

                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
                    >
                      <div
                        className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/blog/${post.id}`)}
                      >
                        {getAvatar(authorRole, 'sm')}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {post.title}
                          </span>
                          <span className="text-xs text-slate-500 truncate">
                            {excerpt}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-slate-400">
                              by {post.authorName}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-400">
                              {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label={`Edit ${post.title}`}
                          title="Edit post"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.id)}
                          className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${post.title}`}
                          title="Delete post"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-2xl mb-4">
                🗑️
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Delete Post
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex items-center space-x-3 w-full">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AdminDashboard };
export default AdminDashboard;