import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function PersonNode({ person, position, isSelected, isHighlighted, relationshipType, onSelect, onHover, selectedPersonExists }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Color based on selection, highlighting, or gender
  const getColor = () => {
    if (isSelected) return '#fbbf24'; // Gold when selected
    
    // Highlight connected cards with relationship-specific colors
    if (isHighlighted && relationshipType) {
      switch (relationshipType) {
        case 'parent':
          return '#10b981'; // Green for parents
        case 'child':
          return '#06b6d4'; // Cyan for children
        case 'spouse':
          return '#a855f7'; // Purple for spouse
        case 'sibling':
          return '#f59e0b'; // Amber for siblings
        default:
          break;
      }
    }
    
    if (hovered) return '#60a5fa'; // light blue when hovered
    
    // Default gender colors
    switch (person.gender) {
      case 'Male':
        return '#3b82f6'; // blue
      case 'Female':
        return '#ec4899'; // pink
      default:
        return '#a855f7'; // purple
    }
  };

  // Animate on hover and selection with billboard effect
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected || isHighlighted ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );

      // Gentle floating animation
      if (!isSelected) {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1;
      }
      
      // Fade out non-highlighted nodes when something is selected
      if (selectedPersonExists && !isSelected && !isHighlighted) {
        meshRef.current.material.opacity = 0.3;
      } else {
        meshRef.current.material.opacity = 1.0;
      }

      // Billboard effect - make card face camera
      if (state.camera) {
        // Get camera position
        const cameraPosition = state.camera.position.clone();
        // Calculate direction from node to camera
        const nodeWorldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(nodeWorldPos);
        const direction = cameraPosition.sub(nodeWorldPos).normalize();
        
        // Calculate rotation to face camera (only Y-axis rotation for natural feel)
        const angle = Math.atan2(direction.x, direction.z);
        meshRef.current.rotation.y = angle;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onHover) onHover(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    if (onHover) onHover(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position}>
      {/* Main Node */}
      <RoundedBox
        ref={meshRef}
        args={[2, 2.5, 0.4]}
        radius={0.15}
        smoothness={4}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
      >
        <meshStandardMaterial
          color={getColor()}
          metalness={0.3}
          roughness={0.4}
          emissive={getColor()}
          emissiveIntensity={isSelected || isHighlighted ? 0.3 : 0.1}
          transparent
        />
      </RoundedBox>

      {/* Name Text */}
      <Text
        position={[0, 0.2, 0.25]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
        outlineWidth={0.03}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {person.name}
      </Text>

      {/* Gender Icon */}
      <Text
        position={[0, -0.4, 0.25]}
        fontSize={0.25}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {person.gender === 'Male' ? '♂' : person.gender === 'Female' ? '♀' : '⚥'}
      </Text>

      {/* Generation Badge */}
      <mesh position={[0, 1.1, 0.25]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color="#1a1f3a" opacity={0.9} transparent />
      </mesh>
      <Text
        position={[0, 1.1, 0.3]}
        fontSize={0.18}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        G{person.generation}
      </Text>

      {/* Hover Tooltip */}
      {hovered && (
        <group position={[0, 1.5, 0]}>
          <mesh>
            <planeGeometry args={[3, 1.2]} />
            <meshBasicMaterial color="#1a1f3a" opacity={0.95} transparent />
          </mesh>
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {person.name}
          </Text>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.12}
            color="#9ca3af"
            anchorX="center"
            anchorY="middle"
          >
            Gen {person.generation} • {person.gender}
          </Text>
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.1}
            color="#60a5fa"
            anchorX="center"
            anchorY="middle"
          >
            👨‍👩 {person.parents?.length || 0} • 👶 {person.children?.length || 0} • 💑 {person.spouses?.length || 0} • 👥 {person.siblings?.length || 0}
          </Text>
        </group>
      )}
    </group>
  );
}

export default PersonNode;
