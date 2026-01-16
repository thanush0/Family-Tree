import React from 'react';
import { Panel } from 'reactflow';

/**
 * TimelineScale Component
 * Displays a vertical timeline scale showing birth year ranges for the family tree
 */
function TimelineScale({ timeScale, generationBands }) {
  if (!timeScale || !generationBands) return null;

  const { minYear, maxYear, yearRange } = timeScale;
  
  // Calculate decade markers
  const startDecade = Math.floor(minYear / 10) * 10;
  const endDecade = Math.ceil(maxYear / 10) * 10;
  const decades = [];
  
  for (let year = startDecade; year <= endDecade; year += 10) {
    decades.push(year);
  }

  return (
    <Panel 
      position="top-left" 
      style={{ 
        background: 'rgba(30, 41, 59, 0.95)', 
        padding: '16px 20px', 
        borderRadius: '12px',
        color: '#e2e8f0',
        fontSize: '14px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(71, 85, 105, 0.5)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
        📅 Timeline
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        fontSize: '13px',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <span style={{ opacity: 0.8 }}>Earliest Birth:</span>
          <span style={{ fontWeight: 'bold' }}>{minYear}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <span style={{ opacity: 0.8 }}>Latest Birth:</span>
          <span style={{ fontWeight: 'bold' }}>{maxYear}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
        }}>
          <span style={{ opacity: 0.8 }}>Span:</span>
          <span style={{ fontWeight: 'bold' }}>{yearRange} years</span>
        </div>
      </div>

      {generationBands && generationBands.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(71, 85, 105, 0.5)' 
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            fontSize: '13px',
            opacity: 0.9,
          }}>
            Generations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {generationBands.map((band, index) => (
              <div 
                key={band.generation}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px',
                    background: `hsla(${index * 30}, 60%, 60%, 0.3)`,
                    border: `2px solid hsla(${index * 30}, 60%, 60%, 0.8)`,
                  }}
                />
                <span>Gen {band.generation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

export default TimelineScale;
