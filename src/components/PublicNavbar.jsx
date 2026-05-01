import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Navigation bar for unauthenticated/guest users.
 * Displays 'WriteSpace' logo/brand and Login/Register buttons.
 * Links to '/', '/login', '/register'.
 * @returns {JSX.Element} The public navigation bar.
 */
function PublicNavbar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-white text-xl font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            WriteSpace
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { PublicNavbar };
export default PublicNavbar;