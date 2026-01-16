import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

const PersonNode2D = memo(({ data }) => {
  const { person, isSelected, onSelect } = data;
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundColor = () => {
    if (isSelected) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)';
    
    switch (person.gender) {
      case 'Male':
        return 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)';
      case 'Female':
        return 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb923c 100%)';
      default:
        return 'linear-gradient(135deg, #a855f7 0%, #c026d3 50%, #e879f9 100%)';
    }
  };

  const getBorderColor = () => {
    if (isSelected) return '#fbbf24';
    return 'transparent';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const age = new Date().getFullYear() - year;
    return `${year} (${age} years)`;
  };

  const getGenerationLabel = (generation) => {
    if (generation === 0) return 'Patriarch/Matriarch';
    if (generation === 1) return 'Parents Generation';
    if (generation === 2) return 'Children Generation';
    if (generation === 3) return 'Grandchildren';
    return `Generation ${generation}`;
  };

  const calculateYearRange = () => {
    if (!person.dob) return null;
    const birthYear = new Date(person.dob).getFullYear();
    return `${birthYear} - Present`;
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: getBackgroundColor(),
        padding: '20px',
        borderRadius: '20px',
        border: `3px solid ${getBorderColor()}`,
        minWidth: '240px',
        maxWidth: '280px',
        color: 'white',
        boxShadow: isSelected 
          ? '0 20px 60px rgba(251, 191, 36, 0.6), 0 0 0 4px rgba(251, 191, 36, 0.2)' 
          : isHovered
          ? '0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.1)'
          : '0 8px 25px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isSelected ? 'scale(1.1) translateY(-5px)' : isHovered ? 'scale(1.05) translateY(-3px)' : 'scale(1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="person-node-2d"
    >
      {/* Animated background overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 60%)',
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />
      
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        animation: isHovered ? 'shimmer 2s infinite' : 'none',
        pointerEvents: 'none',
      }} />
      {/* Top Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#64748b',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />

      {/* Profile Photo or Initial with animation */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 auto 16px',
          border: '4px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {person.photo ? (
          <img 
            src={person.photo} 
            alt={person.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        ) : (
          <div style={{
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            animation: isHovered ? 'pulse 1s infinite' : 'none',
          }}>
            {person.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name with enhanced styling */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '8px',
          textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
          letterSpacing: '0.5px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {person.name}
      </div>

      {/* Gender Icon with animation */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '22px',
          marginBottom: '8px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {person.gender === 'Male' ? '♂️' : person.gender === 'Female' ? '♀️' : '⚧️'}
      </div>

      {/* Year Range Label */}
      {calculateYearRange() && (
        <div
          style={{
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '6px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px 12px',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            display: 'inline-block',
            width: '100%',
            fontWeight: '600',
            position: 'relative',
            zIndex: 1,
          }}
        >
          📅 {calculateYearRange()}
        </div>
      )}

      {/* Birth Date with enhanced style */}
      {person.dob && (
        <div
          style={{
            fontSize: '13px',
            textAlign: 'center',
            opacity: 0.95,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            marginTop: '8px',
            fontWeight: '500',
            position: 'relative',
            zIndex: 1,
          }}
        >
          🎂 {formatDate(person.dob)}
        </div>
      )}

      {/* Generation Badge with label */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))',
          borderRadius: '16px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          zIndex: 2,
          maxWidth: '140px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '9px', opacity: 0.8, marginBottom: '2px' }}>
          {getGenerationLabel(person.generation)}
        </div>
        <div>Gen {person.generation}</div>
      </div>

      {/* Relation Count Badge with enhanced style */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.15) rotate(360deg)' : 'scale(1)',
          zIndex: 2,
        }}
      >
        {(person.parents?.length || 0) + (person.children?.length || 0) + (person.spouses?.length || 0)}
      </div>

      {/* Bottom Handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#64748b',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
    </div>
  );
});

PersonNode2D.displayName = 'PersonNode2D';

export default PersonNode2D;
