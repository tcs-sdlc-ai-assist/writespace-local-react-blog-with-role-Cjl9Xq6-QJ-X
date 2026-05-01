import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Navigation bar for authenticated users.
 * Displays 'WriteSpace' logo, role-aware links, user avatar chip, and Logout button.
 * Adapts links based on user role from session.
 * @returns {JSX.Element} The authenticated navigation bar.
 */
function Navbar() {
  const navigate = useNavigate();
  const session = getCurrentUser();

  const isAdminUser = session && session.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link
              to="/blogs"
              className="text-white text-xl font-bold tracking-wide hover:opacity-90 transition-opacity"
            >
              WriteSpace
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                to="/blogs"
                className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/write"
                className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors"
              >
                Write
              </Link>
              {isAdminUser && (
                <>
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors"
                  >
                    Manage Users
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {session && (
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                {getAvatar(session.role, 'sm')}
                <span className="text-sm font-medium text-white">
                  {session.displayName}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isAdminUser
                      ? 'bg-violet-300 text-violet-900'
                      : 'bg-indigo-300 text-indigo-900'
                  }`}
                >
                  {isAdminUser ? 'Admin' : 'User'}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { Navbar };
export default Navbar;