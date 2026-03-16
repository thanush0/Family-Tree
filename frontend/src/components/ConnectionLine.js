import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced ConnectionLine with smooth Catmull-Rom curves
 * Creates elegant, flowing connections between nodes
 */
function ConnectionLine({ start, end, type, color, isHighlighted, opacity = 1 }) {
  const lineRef = useRef();
  const tubeRef = useRef();

  // Create smooth curve for the line using Catmull-Rom for organic flow
  const { curve, tubeCurve } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const distance = startVec.distanceTo(endVec);

    if (type === 'spouse') {
      // Gentle arc for spouse relationships
      const midHeight = Math.min(startVec.y, endVec.y) - 0.5;
      const controlPoint1 = new THREE.Vector3(
        startVec.x,
        midHeight,
        startVec.z
      );
      const controlPoint2 = new THREE.Vector3(
        endVec.x,
        midHeight,
        endVec.z
      );
      
      const points = [startVec, controlPoint1, controlPoint2, endVec];
      return {
        curve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5),
        tubeCurve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      };
    } else if (type === 'sibling') {
      // Subtle curve for sibling relationships
      const midPoint = new THREE.Vector3(
        (startVec.x + endVec.x) / 2,
        (startVec.y + endVec.y) / 2 - 0.3,
        (startVec.z + endVec.z) / 2
      );
      
      const points = [startVec, midPoint, endVec];
      return {
        curve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3),
        tubeCurve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3)
      };
    } else {
      // Smooth flowing curve for parent-child relationships
      // Creates a natural downward flow
      const verticalDrop = Math.abs(endVec.y - startVec.y);
      const controlOffset = Math.min(verticalDrop * 0.4, 2);
      
      const controlPoint1 = new THREE.Vector3(
        startVec.x,
        startVec.y - controlOffset,
        startVec.z
      );
      
      const controlPoint2 = new THREE.Vector3(
        endVec.x,
        endVec.y + controlOffset,
        endVec.z
      );
      
      const points = [startVec, controlPoint1, controlPoint2, endVec];
      return {
        curve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5),
        tubeCurve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      };
    }
  }, [start, end, type]);

  // Create tube geometry for volumetric lines
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(tubeCurve, 64, 0.08, 8, false);
  }, [tubeCurve]);

  // Animate highlighted lines with flowing effect
  useFrame((state) => {
    if (tubeRef.current && isHighlighted) {
      const time = state.clock.getElapsedTime();
      // Pulsing glow effect
      tubeRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
    } else if (tubeRef.current) {
      tubeRef.current.material.emissiveIntensity = 0.1;
    }
  });

  // Determine line color
  const lineColor = color || (
    type === 'spouse' ? '#a855f7' : 
    type === 'sibling' ? '#f59e0b' : 
    '#3b82f6'
  );

  return (
    <mesh ref={tubeRef} geometry={tubeGeometry}>
      <meshStandardMaterial
        color={lineColor}
        emissive={lineColor}
        emissiveIntensity={isHighlighted ? 0.4 : 0.1}
        metalness={0.3}
        roughness={0.6}
        transparent
        opacity={opacity * (isHighlighted ? 0.9 : 0.5)}
      />
    </mesh>
  );
}

export default ConnectionLine;
