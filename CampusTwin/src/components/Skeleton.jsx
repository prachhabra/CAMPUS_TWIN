import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${className}`}
          style={{
            width,
            height,
            borderRadius,
            marginBottom: count > 1 ? 8 : 0
          }}
        />
      ))}
    </>
  );
};

export default Skeleton;
