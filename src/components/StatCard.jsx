import React from 'react';
import PropTypes from 'prop-types';

/**
 * Admin dashboard statistic card component.
 * Displays a label, value, and icon with gradient background.
 * Used for Total Posts, Total Users, Total Admins, Total Users stats.
 * @param {Object} props
 * @param {string} props.label - The stat label text.
 * @param {number|string} props.value - The stat value to display.
 * @param {React.ReactNode} props.icon - The icon element to render.
 * @param {string} [props.gradient='from-indigo-500 to-violet-500'] - Tailwind gradient classes.
 * @returns {JSX.Element} A styled stat card element.
 */
function StatCard({ label, value, icon, gradient = 'from-indigo-500 to-violet-500' }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl shadow-md p-5 text-white flex items-center justify-between`}
      role="region"
      aria-label={label}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white/80">
          {label}
        </span>
        <span className="text-3xl font-bold mt-1">
          {value}
        </span>
      </div>
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-2xl">
        {icon}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node.isRequired,
  gradient: PropTypes.string,
};

export { StatCard };
export default StatCard;