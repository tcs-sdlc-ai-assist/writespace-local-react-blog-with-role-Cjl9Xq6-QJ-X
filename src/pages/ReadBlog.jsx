import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPosts, removePost } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import Navbar from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';

/**
 * Single blog post reading page rendered at '/blog/:id'.
 * Displays full post content with title, author avatar, display name, formatted date.
 * Admin sees edit and delete buttons on all posts; user sees them only on own posts.
 * Delete action shows confirmation dialog and removes post from localStorage, redirecting to '/blogs'.
 * Invalid/missing ID shows 'Post not found' message with link back to blogs.
 * @returns {JSX.Element} The blog post reading page.
 */
function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getCurrentUser();
  const [showConfirm, setShowConfirm] = useState(false);

  const allPosts = getPosts();
  const post = allPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-3xl mb-4">
                🔍
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Post not found
              </h1>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                The blog post you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
              <Link
                to="/blogs"
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Back to All Posts
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin = session && session.role === 'admin';
  const isAuthor = session && session.userId === post.authorId;
  const canEdit = isAdmin || isAuthor;
  const canDelete = isAdmin || isAuthor;

  const authorRole = post.authorId === 'admin-001' ? 'admin' : 'user';

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const handleEdit = () => {
    navigate(`/blog/${post.id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    removePost(post.id);
    navigate('/blogs', { replace: true });
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              to="/blogs"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to All Posts
            </Link>
          </div>

          <article className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex-1 mr-4">
                {post.title}
              </h1>
              {(canEdit || canDelete) && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {canEdit && (
                    <button
                      onClick={handleEdit}
                      className="p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      aria-label="Edit post"
                      title="Edit post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Delete post"
                      title="Delete post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-100">
              {getAvatar(authorRole, 'md')}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {post.authorName}
                </span>
                <span className="text-xs text-slate-400">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </article>
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

export { ReadBlog };
export default ReadBlog;