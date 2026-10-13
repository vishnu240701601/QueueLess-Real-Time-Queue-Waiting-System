import React from 'react';

export function Skeleton({ width = '100%', height = '18px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: '3px', ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <Skeleton height="20px" width="55%" />
      <Skeleton height="14px" width="85%" />
      <Skeleton height="14px" width="40%" />
      <div style={{ marginTop: '0.5rem' }}>
        <Skeleton height="32px" width="110px" />
      </div>
    </div>
  );
}

export default Skeleton;
