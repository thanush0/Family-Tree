import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import PersonNode from './PersonNode';
import ConnectionLine from './ConnectionLine';
import { calculateTreeLayout } from '../utils/layoutEngine';
import * as THREE from 'three';

function Scene3D({ persons, selectedPerson, onPersonSelect, viewMode }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const [positions, setPositions] = useState({});
  const [highlightedConnections, setHighlightedConnections] = useState({
    nodes: new Set(),
    edges: new Set(),
    relationshipTypes: {}
  });
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Create edges from persons data
  const edges = useMemo(() => {
    const edgeList = [];
    
    persons.forEach(person => {
      // Parent-child edges
      if (person.children && person.children.length > 0) {
        person.children.forEach(child => {
          edgeList.push({
            source: person.id,
            target: child.id,
            type: 'parent-child',
          });
        });
      }

      // Spouse edges
      if (person.spouses && person.spouses.length > 0) {
        person.spouses.forEach(spouse => {
          // Only add edge once (from lower ID to higher ID)
          if (person.id < spouse.id) {
            edgeList.push({
              source: person.id,
              target: spouse.id,
              type: 'spouse',
            });
          }
        });
      }

      // Sibling edges
      if (person.siblings && person.siblings.length > 0) {
        person.siblings.forEach(sibling => {
          // Only add edge once (from lower ID to higher ID)
          if (person.id < sibling.id) {
            edgeList.push({
              source: person.id,
              target: sibling.id,
              type: 'sibling',
            });
          }
        });
      }
    });
    
    return edgeList;
  }, [persons]);

  // Calculate node positions when persons data changes
  useEffect(() => {
    if (persons.length > 0) {
      const layout = calculateTreeLayout(persons, edges);
      const posMap = {};
      layout.forEach((pos, id) => {
        posMap[id] = pos;
      });
      setPositions(posMap);
    }
  }, [persons, edges]);

  // Calculate highlighted connections when a person is selected
  useEffect(() => {
    if (!selectedPerson || !persons || persons.length === 0) {
      setHighlightedConnections({ nodes: new Set(), edges: new Set(), relationshipTypes: {} });
      return;
    }

    const person = persons.find(p => p.id === selectedPerson.id);
    if (!person) return;

    const highlightedNodes = new Set([person.id]);
    const highlightedEdges = new Set();
    const relationshipTypes = {};

    // Add parents and their connections
    if (person.parents) {
      person.parents.forEach(parent => {
        const parentId = parent.id || parent;
        highlightedNodes.add(parentId);
        relationshipTypes[parentId] = 'parent';
        highlightedEdges.add(`${parentId}-${person.id}`);
      });
    }

    // Add children and their connections
    if (person.children) {
      person.children.forEach(child => {
        const childId = child.id || child;
        highlightedNodes.add(childId);
        relationshipTypes[childId] = 'child';
        highlightedEdges.add(`${person.id}-${childId}`);
      });
    }

    // Add spouses and their connections
    if (person.spouses) {
      person.spouses.forEach(spouse => {
        const spouseId = spouse.id || spouse;
        highlightedNodes.add(spouseId);
        relationshipTypes[spouseId] = 'spouse';
        highlightedEdges.add(`${person.id}-${spouseId}`);
        highlightedEdges.add(`${spouseId}-${person.id}`);
      });
    }

    // Add siblings and their connections
    if (person.siblings) {
      person.siblings.forEach(sibling => {
        const siblingId = sibling.id || sibling;
        highlightedNodes.add(siblingId);
        relationshipTypes[siblingId] = 'sibling';
        highlightedEdges.add(`${siblingId}-${person.id}`);
        highlightedEdges.add(`${person.id}-${siblingId}`);
      });
    }

    setHighlightedConnections({ nodes: highlightedNodes, edges: highlightedEdges, relationshipTypes });
  }, [selectedPerson, persons]);

  // Get relationship color
  const getRelationshipColor = (relationshipType) => {
    switch (relationshipType) {
      case 'parent':
        return '#10b981'; // Green
      case 'child':
        return '#06b6d4'; // Cyan
      case 'spouse':
        return '#a855f7'; // Purple
      case 'sibling':
        return '#f59e0b'; // Amber
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Get edge color based on type and highlighting
  const getEdgeColor = (edge) => {
    const edgeKey = `${edge.source}-${edge.target}`;
    const isHighlighted = highlightedConnections.edges.has(edgeKey);
    
    if (!isHighlighted && selectedPerson) {
      return '#444444'; // Faded
    }

    if (isHighlighted) {
      // Determine color based on relationship
      if (highlightedConnections.relationshipTypes[edge.target] === 'child') {
        return '#06b6d4'; // Cyan for children
      } else if (highlightedConnections.relationshipTypes[edge.source] === 'parent') {
        return '#10b981'; // Green for parents
      }
    }

    // Default colors
    if (edge.type === 'spouse') return '#a855f7';
    if (edge.type === 'sibling') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <>
      {/* 3D Instructions Overlay */}
      {showInstructions && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '16px',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', color: '#a855f7', fontSize: '16px' }}>🎮 3D Controls</div>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                lineHeight: '1',
              }}
              title="Hide instructions"
            >
              ✕
            </button>
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            <span><strong>Left Drag</strong> - Rotate view</span>
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            <span><strong>Right Drag</strong> - Pan view</span>
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            <span><strong>Scroll</strong> - Zoom in/out</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            <span><strong>Click Node</strong> - Select person</span>
          </div>
        </div>
      )}

      {/* Show Instructions Button (when hidden) */}
      {!showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '12px 16px',
            background: 'rgba(168, 85, 247, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🎮 Help
        </button>
      )}

      {/* Camera Reset Button */}
      <button
        onClick={() => {
          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(0, 10, 25);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '420px',
          padding: '12px 20px',
          background: 'rgba(168, 85, 247, 0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(168, 85, 247, 1)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(168, 85, 247, 0.9)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset View
      </button>

      <Canvas>
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 10, 25]}
        fov={75}
      />

      {/* Enhanced Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={60}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
        rotateSpeed={0.7}
        panSpeed={0.8}
        zoomSpeed={1.2}
        enablePan={true}
      />

      {/* Enhanced Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[15, 15, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-15, 10, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.8} />
      <hemisphereLight args={['#ffffff', '#1a1f3a', 0.4]} />

      {/* Enhanced Grid */}
      <gridHelper args={[80, 40, '#3b82f6', '#1a1f3a']} position={[0, -2, 0]} />
      
      {/* Background gradient effect */}
      <mesh position={[0, 0, -20]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0a0e27" />
      </mesh>

      {/* Render Person Nodes */}
      {persons.map(person => {
        const pos = positions[person.id] || { x: 0, y: 0, z: 0 };
        const isHighlighted = highlightedConnections.nodes.has(person.id);
        const relationshipType = highlightedConnections.relationshipTypes[person.id];
        const isSelected = selectedPerson && selectedPerson.id === person.id;
        
        return (
          <PersonNode
            key={person.id}
            person={person}
            position={[pos.x, pos.y, pos.z]}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            relationshipType={relationshipType}
            onSelect={() => onPersonSelect(person.id)}
            onHover={(hovered) => setHoveredPerson(hovered ? person : null)}
            selectedPersonExists={!!selectedPerson}
          />
        );
      })}

      {/* Render Connection Lines */}
      {edges.map((edge, index) => {
        const sourcePos = positions[edge.source];
        const targetPos = positions[edge.target];
        
        if (!sourcePos || !targetPos) return null;

        const edgeKey = `${edge.source}-${edge.target}`;
        const isHighlighted = highlightedConnections.edges.has(edgeKey);
        const color = getEdgeColor(edge);

        return (
          <ConnectionLine
            key={`edge-${index}`}
            start={[sourcePos.x, sourcePos.y, sourcePos.z]}
            end={[targetPos.x, targetPos.y, targetPos.z]}
            type={edge.type}
            color={color}
            isHighlighted={isHighlighted}
            opacity={isHighlighted || !selectedPerson ? 1 : 0.3}
          />
        );
      })}
      </Canvas>
    </>
  );
}

export default Scene3D;
