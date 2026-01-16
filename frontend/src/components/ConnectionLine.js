import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ConnectionLine({ start, end, type }) {
  const lineRef = useRef();

  // Create curve for the line
  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    if (type === 'spouse') {
      // Straight line for spouse relationships
      return new THREE.LineCurve3(startVec, endVec);
    } else {
      // Curved line for parent-child relationships
      const midPoint = new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 - 1,
        (start[2] + end[2]) / 2
      );
      return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
    }
  }, [start, end, type]);

  const points = curve.getPoints(50);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  // Animate line
  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.getElapsedTime();
      lineRef.current.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
    }
  });

  const color = type === 'spouse' ? '#a855f7' : '#3b82f6';

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        opacity={0.4}
        transparent
        linewidth={2}
      />
    </line>
  );
}

export default ConnectionLine;
