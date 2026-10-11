import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="90%" />
      <Skeleton height="16px" width="40%" />
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height="36px" width="100px" />
        <Skeleton height="36px" width="80px" />
      </div>
    </div>
  );
}

export default Skeleton;
