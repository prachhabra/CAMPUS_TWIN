import React from 'react';

const Card = ({ title, action, children, className = '', headerClassName = '', style = {} }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className={`card-header ${headerClassName}`}>
          {title && <div className="card-title">{title}</div>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
