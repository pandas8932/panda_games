import React from 'react';

// font-family: 'Press Start 2P', cursive;

const Card = ({ image, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        
        width: '220px',
        height: '260px',
        backgroundColor: '#1e1e2f',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
      }}
    >
      {/* Game Thumbnail */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Info Section */}
      <div
        style={{
          backgroundColor: '#2a2a40',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: '1rem',
            fontWeight: '700',
            color: '#fff',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#bbb',
            lineHeight: '1.3',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default Card;
