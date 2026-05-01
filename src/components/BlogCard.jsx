import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

const ACCENT_COLORS = [
  'border-indigo-500',
  'border-violet-500',
  'border-pink-500',
  'border-teal-500',
  'border-indigo-400',
  'border-violet-400',
  'border-pink-400',
  'border-teal-400',
];

/**
 * Blog post card component for the blog list grid.
 * Displays title, content excerpt, date, author name with avatar, and colorful accent border.
 * Shows edit icon for admin on all cards and for users on their own posts.
 * Clicking navigates to '/blog/:id'.
 * @param {Object} props
 * @param {Object} props.post - The blog post object.
 * @param {string} props.post.id - The post id.
 * @param {string} props.post.title - The post title.
 * @param {string} props.post.content - The post content.
 * @param {string} props.post.createdAt - The post creation date (ISO string).
 * @param {string} props.post.authorId - The post author's user id.
 * @param {string} props.post.authorName - The post author's display name.
 * @param {number} [props.index=0] - The index of the card in the list, used for accent color.
 * @returns {JSX.Element} A styled blog card element.
 */
function BlogCard({ post, index = 0 }) {
  const navigate = useNavigate();
  const session = getCurrentUser();

  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const isAdmin = session && session.role === 'admin';
  const isAuthor = session && session.userId === post.authorId;
  const canEdit = isAdmin || isAuthor;

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

  const handleCardClick = () => {
    navigate(`/blog/${post.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/blog/${post.id}/edit`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${accentColor} flex flex-col h-full`}
      role="article"
      aria-label={post.title}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1 mr-2">
            {post.title}
          </h3>
          {canEdit && (
            <button
              onClick={handleEditClick}
              className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
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
          )}
        </div>
        <p className="text-sm text-slate-600 mb-4 flex-1">
          {excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
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
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number,
};

export { BlogCard };
export default BlogCard;