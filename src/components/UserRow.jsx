import React from 'react';
import PropTypes from 'prop-types';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * User table row/card component for the user management panel.
 * Displays avatar, display name, username, role badge pill, created date, and delete button.
 * Delete button is disabled for the hard-coded admin (admin-001) and for the currently logged-in user.
 * @param {Object} props
 * @param {Object} props.user - The user object.
 * @param {string} props.user.id - The user id.
 * @param {string} props.user.displayName - The user display name.
 * @param {string} props.user.username - The username.
 * @param {'admin' | 'user'} props.user.role - The user role.
 * @param {string} props.user.createdAt - The user creation date (ISO string).
 * @param {Function} props.onDelete - Callback invoked with user id when delete is clicked.
 * @returns {JSX.Element} A styled user row/card element.
 */
function UserRow({ user, onDelete }) {
  const session = getCurrentUser();

  const isHardCodedAdmin = user.id === 'admin-001';
  const isCurrentUser = session && session.userId === user.id;
  const deleteDisabled = isHardCodedAdmin || isCurrentUser;

  let deleteTooltip = 'Delete user';
  if (isHardCodedAdmin) {
    deleteTooltip = 'Cannot delete the default admin account';
  } else if (isCurrentUser) {
    deleteTooltip = 'Cannot delete your own account';
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const isAdmin = user.role === 'admin';

  const handleDelete = () => {
    if (!deleteDisabled && onDelete) {
      onDelete(user.id);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
      role="row"
      aria-label={user.displayName}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {getAvatar(user.role, 'md')}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800 truncate">
              {user.displayName}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
          <span className="text-xs text-slate-500 truncate">
            @{user.username}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
        <span className="text-xs text-slate-400 hidden sm:inline">
          {formattedDate}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleteDisabled}
          title={deleteTooltip}
          className={`p-2 rounded-md transition-colors ${
            deleteDisabled
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
          }`}
          aria-label={`Delete ${user.displayName}`}
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
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export { UserRow };
export default UserRow;