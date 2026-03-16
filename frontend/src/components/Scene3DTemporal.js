import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Stars } from '@react-three/drei';
import PersonNode from './PersonNode';
import EventNode from './EventNode';
import ConnectionLine from './ConnectionLine';
import { calculateTemporalLayout } from '../utils/temporalLayoutEngine';
import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Atmospheric Background with gradient sky and depth fog
 */
function AtmosphericBackground() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Create gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Memorial-like gradient: deep blue to purple to dark
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#0a0e27');    // Deep space blue
    gradient.addColorStop(0.4, '#1a1f3a');  // Dark blue
    gradient.addColorStop(0.7, '#2d1b4e');  // Deep purple
    gradient.addColorStop(1, '#0f0718');    // Almost black
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    
    // Add fog for depth
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.015);
    
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);
  
  return (
    <>
      {/* Subtle stars for atmosphere */}
      <Stars 
        radius={100} 
        depth={50} 
        count={1000} 
        factor={3} 
        saturation={0.3} 
        fade 
        speed={0.5}
      />
    </>
  );
}

/**
 * Camera Controller with smooth transitions and focus animations
 */
function CameraController({ targetPosition, targetLookAt, onComplete }) {
  const { camera, controls } = useThree();
  const controlsRef = useRef(controls);
  
  useEffect(() => {
    if (targetPosition && targetLookAt && controlsRef.current) {
      // Smooth camera animation using GSAP
      gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        }
      });
      
      gsap.to(controlsRef.current.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }
  }, [targetPosition, targetLookAt, camera, onComplete]);
  
  return null;
}

/**
 * Main Scene3DTemporal Component
 * A navigable 3D relationship universe where time flows vertically
 */
function Scene3DTemporal({ persons, selectedPerson, onPersonSelect, viewMode }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const [positions, setPositions] = useState({});
  const [eventNodes, setEventNodes] = useState([]);
  const [highlightedConnections, setHighlightedConnections] = useState({
    nodes: new Set(),
    edges: new Set(),
    relationshipTypes: {}
  });
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraTarget, setCameraTarget] = useState(null);

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

  // Calculate temporal layout when persons data changes
  useEffect(() => {
    if (persons.length > 0) {
      const layout = calculateTemporalLayout(persons, []);
      const posMap = {};
      
      layout.personPositions.forEach((pos, id) => {
        posMap[id] = { x: pos.x, y: pos.y, z: pos.z };
      });
      
      setPositions(posMap);
      setEventNodes(layout.eventNodes || []);
    }
  }, [persons]);

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
    
    // Animate camera to focus on selected person
    const personPos = positions[person.id];
    if (personPos) {
      setCameraTarget({
        position: new THREE.Vector3(
          personPos.x + 5,
          personPos.y + 3,
          personPos.z + 10
        ),
        lookAt: new THREE.Vector3(personPos.x, personPos.y, personPos.z)
      });
    }
  }, [selectedPerson, persons, positions]);

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
          background: 'rgba(10, 14, 39, 0.95)',
          padding: '20px',
          borderRadius: '16px',
          color: 'white',
          fontSize: '14px',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', color: '#a855f7', fontSize: '18px' }}>🌌 Navigate Memory Space</div>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0',
                lineHeight: '1',
              }}
              title="Hide instructions"
            >
              ✕
            </button>
          </div>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🖱️</span>
            <span><strong>Left Drag</strong> - Orbit around time</span>
          </div>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🖱️</span>
            <span><strong>Right Drag</strong> - Pan through space</span>
          </div>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🖱️</span>
            <span><strong>Scroll</strong> - Zoom through generations</span>
          </div>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>👤</span>
            <span><strong>Click Person</strong> - Focus & reveal lineage</span>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(168, 85, 247, 0.2)', color: '#9ca3af', fontSize: '12px' }}>
            ⏳ Time flows vertically • Higher = Older
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
            padding: '14px 20px',
            background: 'rgba(168, 85, 247, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
          }}
        >
          🌌 Guide
        </button>
      )}

      {/* Camera Reset Button */}
      <button
        onClick={() => {
          if (cameraRef.current && controlsRef.current) {
            setCameraTarget({
              position: new THREE.Vector3(0, 10, 30),
              lookAt: new THREE.Vector3(0, 0, 0)
            });
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '420px',
          padding: '14px 24px',
          background: 'rgba(168, 85, 247, 0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(168, 85, 247, 1)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(168, 85, 247, 0.9)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset View
      </button>

      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0, 10, 30]}
          fov={65}
        />

        {/* Enhanced Controls with better damping */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
          rotateSpeed={0.6}
          panSpeed={0.7}
          zoomSpeed={1.0}
          enablePan={true}
        />

        {/* Camera Controller for smooth transitions */}
        {cameraTarget && (
          <CameraController 
            targetPosition={cameraTarget.position}
            targetLookAt={cameraTarget.lookAt}
            onComplete={() => setCameraTarget(null)}
          />
        )}

        {/* Atmospheric Background */}
        <AtmosphericBackground />

        {/* Enhanced Lighting for memorial aesthetic */}
        <ambientLight intensity={0.4} color="#b8a6d9" />
        <directionalLight position={[20, 20, 15]} intensity={1.0} color="#ffffff" castShadow />
        <directionalLight position={[-20, 15, -10]} intensity={0.5} color="#9b87c9" />
        <pointLight position={[0, 20, 0]} intensity={0.8} color="#a855f7" distance={50} />
        <hemisphereLight args={['#6d5a9e', '#1a1f3a', 0.6]} />

        {/* Subtle ground plane for depth reference */}
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial 
            color="#0a0e27" 
            metalness={0.2}
            roughness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Subtle grid for orientation */}
        <gridHelper 
          args={[100, 50, '#3b2d5e', '#1a1433']} 
          position={[0, -4.9, 0]}
          material-transparent
          material-opacity={0.2}
        />

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

        {/* Render Event Nodes */}
        {eventNodes.map((event, index) => {
          const pos = event.position || { x: 0, y: 0, z: 0 };
          
          return (
            <EventNode
              key={event.id || `event-${index}`}
              event={event}
              position={[pos.x, pos.y, pos.z]}
              isHighlighted={false}
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

export default Scene3DTemporal;
