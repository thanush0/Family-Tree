import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function PersonNode({ person, position, isSelected, onSelect, onFocus }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Color based on gender
  const getColor = () => {
    if (isSelected) return '#fbbf24'; // yellow when selected
    if (hovered) return '#60a5fa'; // light blue when hovered
    
    switch (person.gender) {
      case 'Male':
        return '#3b82f6'; // blue
      case 'Female':
        return '#ec4899'; // pink
      default:
        return '#a855f7'; // purple
    }
  };

  // Animate on hover and selection
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );

      // Gentle floating animation
      if (!isSelected) {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (e.detail === 2) {
      // Double click - focus
      onFocus();
    } else {
      // Single click - select
      onSelect();
    }
  };

  return (
    <group position={position}>
      {/* Main Node */}
      <RoundedBox
        ref={meshRef}
        args={[1.5, 2, 0.3]}
        radius={0.1}
        smoothness={4}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          color={getColor()}
          metalness={0.3}
          roughness={0.4}
          emissive={getColor()}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </RoundedBox>

      {/* Name Text */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {person.name}
      </Text>

      {/* Generation Badge */}
      <mesh position={[0, 0.9, 0.2]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#1a1f3a" />
      </mesh>
      <Text
        position={[0, 0.9, 0.25]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        G{person.generation}
      </Text>

      {/* Hover Tooltip */}
      {hovered && (
        <group position={[0, 1.5, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.5]} />
            <meshBasicMaterial color="#1a1f3a" opacity={0.9} transparent />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {person.name}
          </Text>
        </group>
      )}
    </group>
  );
}

export default PersonNode;
