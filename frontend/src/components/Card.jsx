import React from 'react';

const Card = ({ image, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: '250px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
      }}
    >
      <img
        src={image}
        alt={title}
        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
      />
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#555' }}>{description}</p>
      </div>
    </div>
  );
};

export default Card;
