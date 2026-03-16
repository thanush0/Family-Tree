import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/**
 * EventNode - Represents significant life events (marriages, births, deaths)
 * Rendered as floating spheres that act as structural hubs in the family tree
 */
function EventNode({ event, position, isHighlighted, onSelect, onHover }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Event type colors
  const getEventColor = () => {
    if (hovered || isHighlighted) {
      switch (event.type) {
        case 'marriage':
          return '#ec4899'; // Pink
        case 'birth':
          return '#10b981'; // Green
        case 'death':
          return '#6b7280'; // Gray
        default:
          return '#f59e0b'; // Amber
      }
    }
    // Muted colors when not interacted with
    switch (event.type) {
      case 'marriage':
        return '#9333ea'; // Purple
      case 'birth':
        return '#059669'; // Emerald
      case 'death':
        return '#4b5563'; // Dark gray
      default:
        return '#d97706'; // Orange
    }
  };

  // Get event icon
  const getEventIcon = () => {
    switch (event.type) {
      case 'marriage':
        return '💍';
      case 'birth':
        return '🌟';
      case 'death':
        return '🕊️';
      default:
        return '📅';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Animate event nodes
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect
      const time = state.clock.getElapsedTime();
      const scale = (hovered || isHighlighted) ? 1.3 : 1.0;
      const pulse = Math.sin(time * 2 + position[0]) * 0.05;
      meshRef.current.scale.setScalar(scale + pulse);

      // Gentle rotation
      meshRef.current.rotation.y = time * 0.3;

      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5 + position[0]) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(event);
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
      {/* Main Event Sphere */}
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
      >
        <meshStandardMaterial
          color={getEventColor()}
          metalness={0.6}
          roughness={0.3}
          emissive={getEventColor()}
          emissiveIntensity={isHighlighted || hovered ? 0.5 : 0.2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Outer Glow Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial
          color={getEventColor()}
          transparent
          opacity={(hovered || isHighlighted) ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Event Icon */}
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
      >
        {getEventIcon()}
      </Text>

      {/* Date Text */}
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {formatDate(event.date)}
      </Text>

      {/* Hover Tooltip */}
      {hovered && (
        <group position={[0, 1.5, 0]}>
          <mesh>
            <planeGeometry args={[4, 1.5]} />
            <meshBasicMaterial color="#1a1f3a" opacity={0.95} transparent />
          </mesh>
          <Text
            position={[0, 0.4, 0.01]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {event.type.toUpperCase()}
          </Text>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.18}
            color="#9ca3af"
            anchorX="center"
            anchorY="middle"
          >
            {formatDate(event.date)}
          </Text>
          {event.description && (
            <Text
              position={[0, -0.35, 0.01]}
              fontSize={0.14}
              color="#60a5fa"
              anchorX="center"
              anchorY="middle"
              maxWidth={3.5}
              textAlign="center"
            >
              {event.description}
            </Text>
          )}
        </group>
      )}
    </group>
  );
}

export default EventNode;
