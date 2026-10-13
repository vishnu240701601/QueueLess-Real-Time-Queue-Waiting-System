import React from 'react';

export default function MetricCard({ title, value, subtitle }) {
  return (
    <div className="metric-item">
      <div className="metric-item__label">{title}</div>
      <div className="metric-item__value">{value}</div>
      {subtitle && <div className="metric-item__sub">{subtitle}</div>}
    </div>
  );
}
