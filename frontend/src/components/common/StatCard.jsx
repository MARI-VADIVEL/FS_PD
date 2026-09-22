import React from 'react';

const StatCard = ({ title, value, subValue, icon: Icon, iconBg = 'var(--brand-amber-glow)', iconColor = 'var(--brand-amber)', onClick }) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg, color: iconColor }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {subValue && <span className="stat-sub">{subValue}</span>}
      </div>
    </div>
  );
};

export default StatCard;
