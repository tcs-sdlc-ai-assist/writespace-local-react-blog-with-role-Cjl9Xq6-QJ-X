import React from 'react';
import PropTypes from 'prop-types';

/**
 * Avatar component that renders a role-distinct visual avatar.
 * @param {Object} props
 * @param {'admin' | 'user'} props.role - The user role.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The avatar size.
 * @returns {JSX.Element} A styled avatar element.
 */
function Avatar({ role = 'user', size = 'md' }) {
  const isAdmin = role === 'admin';
  const emoji = isAdmin ? '👑' : '📖';
  const bgColor = isAdmin
    ? 'bg-violet-500'
    : 'bg-indigo-500';

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`${bgColor} ${sizeClass} inline-flex items-center justify-center rounded-full text-white select-none flex-shrink-0`}
      role="img"
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
    >
      {emoji}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Helper function that returns a styled avatar JSX element for the given role.
 * @param {'admin' | 'user'} role - The user role.
 * @param {'sm' | 'md' | 'lg'} [size='md'] - The avatar size.
 * @returns {JSX.Element} A rendered Avatar component.
 */
export function getAvatar(role, size = 'md') {
  return <Avatar role={role} size={size} />;
}

export { Avatar };
export default Avatar;