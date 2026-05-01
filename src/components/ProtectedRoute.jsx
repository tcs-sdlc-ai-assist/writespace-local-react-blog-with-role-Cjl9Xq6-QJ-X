import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';

/**
 * Route guard component that protects routes based on authentication and role.
 * @param {Object} props
 * @param {'admin' | 'user'} [props.role] - Optional required role for access.
 * @param {React.ReactNode} [props.children] - Child elements to render if access is granted.
 * @returns {JSX.Element} The children/Outlet if authorized, or a Navigate redirect.
 */
function ProtectedRoute({ role, children }) {
  const session = getCurrentUser();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/blogs" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
  children: PropTypes.node,
};

export { ProtectedRoute };
export default ProtectedRoute;