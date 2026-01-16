import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import PersonNode from './PersonNode';
import ConnectionLine from './ConnectionLine';
import { calculateTreeLayout } from '../utils/layoutEngine';
import * as THREE from 'three';

function Scene3D({ treeData, selectedPerson, focusedPerson, onPersonSelect, onPersonFocus, viewMode }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const [positions, setPositions] = useState({});
  const [filteredData, setFilteredData] = useState({ nodes: [], edges: [] });

  // Calculate node positions when tree data changes
  useEffect(() => {
    if (treeData.nodes.length > 0) {
      const layout = calculateTreeLayout(treeData.nodes, treeData.edges);
      const posMap = {};
      layout.forEach((pos, id) => {
        posMap[id] = pos;
      });
      setPositions(posMap);
    }
  }, [treeData]);

  // Filter nodes based on view mode
  useEffect(() => {
    if (viewMode === 'full') {
      setFilteredData(treeData);
    } else if (viewMode === 'ancestors' && selectedPerson) {
      // Show only ancestors of selected person
      const ancestors = findAncestors(selectedPerson, treeData);
      setFilteredData({
        nodes: treeData.nodes.filter(n => ancestors.has(n.id) || n.id === selectedPerson),
        edges: treeData.edges.filter(e => 
          ancestors.has(e.source) && ancestors.has(e.target) ||
          e.target === selectedPerson
        )
      });
    } else if (viewMode === 'descendants' && selectedPerson) {
      // Show only descendants of selected person
      const descendants = findDescendants(selectedPerson, treeData);
      setFilteredData({
        nodes: treeData.nodes.filter(n => descendants.has(n.id) || n.id === selectedPerson),
        edges: treeData.edges.filter(e => 
          descendants.has(e.source) && descendants.has(e.target) ||
          e.source === selectedPerson
        )
      });
    } else {
      setFilteredData(treeData);
    }
  }, [viewMode, selectedPerson, treeData]);

  // Camera animation when person is focused
  useEffect(() => {
    if (focusedPerson && positions[focusedPerson] && cameraRef.current && controlsRef.current) {
      const pos = positions[focusedPerson];
      const targetPosition = new THREE.Vector3(pos.x, pos.y, pos.z);
      const cameraPosition = new THREE.Vector3(pos.x, pos.y, pos.z + 10);

      // Animate camera
      animateCamera(cameraRef.current, controlsRef.current, cameraPosition, targetPosition);
    }
  }, [focusedPerson, positions]);

  // Find all ancestors of a person
  const findAncestors = (personId, data) => {
    const ancestors = new Set();
    const queue = [personId];

    while (queue.length > 0) {
      const current = queue.shift();
      const parentEdges = data.edges.filter(e => e.target === current && e.type === 'parent-child');
      
      parentEdges.forEach(edge => {
        if (!ancestors.has(edge.source)) {
          ancestors.add(edge.source);
          queue.push(edge.source);
        }
      });
    }

    return ancestors;
  };

  // Find all descendants of a person
  const findDescendants = (personId, data) => {
    const descendants = new Set();
    const queue = [personId];

    while (queue.length > 0) {
      const current = queue.shift();
      const childEdges = data.edges.filter(e => e.source === current && e.type === 'parent-child');
      
      childEdges.forEach(edge => {
        if (!descendants.has(edge.target)) {
          descendants.add(edge.target);
          queue.push(edge.target);
        }
      });
    }

    return descendants;
  };

  // Animate camera to target position
  const animateCamera = (camera, controls, newPosition, newTarget) => {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1000; // ms
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeInOutCubic(progress);

      camera.position.lerpVectors(startPosition, newPosition, eased);
      controls.target.lerpVectors(startTarget, newTarget, eased);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Easing function
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  return (
    <Canvas>
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 5, 20]}
        fov={60}
      />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Grid Helper */}
      <gridHelper args={[100, 100, '#1a1f3a', '#0a0e27']} position={[0, -1, 0]} />

      {/* Render Person Nodes */}
      {filteredData.nodes.map(node => {
        const pos = positions[node.id] || { x: 0, y: 0, z: 0 };
        return (
          <PersonNode
            key={node.id}
            person={node}
            position={[pos.x, pos.y, pos.z]}
            isSelected={selectedPerson === node.id}
            onSelect={() => onPersonSelect(node.id)}
            onFocus={() => onPersonFocus(node.id)}
          />
        );
      })}

      {/* Render Connection Lines */}
      {filteredData.edges.map((edge, index) => {
        const sourcePos = positions[edge.source];
        const targetPos = positions[edge.target];
        
        if (!sourcePos || !targetPos) return null;

        return (
          <ConnectionLine
            key={`edge-${index}`}
            start={[sourcePos.x, sourcePos.y, sourcePos.z]}
            end={[targetPos.x, targetPos.y, targetPos.z]}
            type={edge.type}
          />
        );
      })}
    </Canvas>
  );
}

export default Scene3D;
