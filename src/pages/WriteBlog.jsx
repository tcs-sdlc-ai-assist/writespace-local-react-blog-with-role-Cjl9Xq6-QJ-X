import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPosts, addPost, updatePost } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import Navbar from '../components/Navbar.jsx';

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

/**
 * Blog post create and edit form page.
 * Create mode rendered at '/write', edit mode at '/blog/:id/edit'.
 * Pre-fills form in edit mode. Ownership enforcement: users can only edit own posts, admins can edit any.
 * Form validates required title and content fields with inline errors.
 * Character counter below content textarea.
 * Save writes to localStorage via storage.js. Cancel button navigates back without saving.
 * @returns {JSX.Element} The write/edit blog page.
 */
function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getCurrentUser();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const allPosts = getPosts();
    const post = allPosts.find((p) => p.id === id);

    if (!post) {
      setNotFound(true);
      return;
    }

    const isAdmin = session && session.role === 'admin';
    const isAuthor = session && session.userId === post.authorId;

    if (!isAdmin && !isAuthor) {
      setUnauthorized(true);
      return;
    }

    setTitle(post.title);
    setContent(post.content);
  }, [id, isEditMode, session]);

  const validate = () => {
    const newErrors = {};

    if (!title || !title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length > TITLE_MAX) {
      newErrors.title = `Title must be ${TITLE_MAX} characters or less.`;
    }

    if (!content || !content.trim()) {
      newErrors.content = 'Content is required.';
    } else if (content.trim().length > CONTENT_MAX) {
      newErrors.content = `Content must be ${CONTENT_MAX} characters or less.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        updatePost({
          id,
          title: title.trim(),
          content: content.trim(),
        });
        navigate(`/blog/${id}`, { replace: true });
      } else {
        const postId = 'post-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
        const newPost = {
          id: postId,
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
          authorId: session.userId,
          authorName: session.displayName,
        };
        addPost(newPost);
        navigate(`/blog/${postId}`, { replace: true });
      }
    } catch (err) {
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/blogs');
    }
  };

  if (notFound) {
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
                The blog post you&apos;re trying to edit doesn&apos;t exist or may have been removed.
              </p>
              <button
                onClick={() => navigate('/blogs')}
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Back to All Posts
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-3xl mb-4">
                🚫
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Unauthorized
              </h1>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                You don&apos;t have permission to edit this post.
              </p>
              <button
                onClick={() => navigate('/blogs')}
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Back to All Posts
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {isEditMode ? 'Edit Post' : 'Write New Post'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isEditMode
                ? 'Update your blog post below.'
                : 'Share your thoughts with the community.'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            {errors.form && (
              <div
                className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                role="alert"
              >
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title"
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.title
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300'
                  }`}
                  maxLength={TITLE_MAX}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.title ? (
                    <span className="text-xs text-red-600">{errors.title}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-slate-400">
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={12}
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y ${
                    errors.content
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300'
                  }`}
                  maxLength={CONTENT_MAX}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.content ? (
                    <span className="text-xs text-red-600">{errors.content}</span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-slate-400">
                    {content.length}/{CONTENT_MAX}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                    loading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading
                    ? isEditMode
                      ? 'Saving…'
                      : 'Publishing…'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export { WriteBlog };
export default WriteBlog;