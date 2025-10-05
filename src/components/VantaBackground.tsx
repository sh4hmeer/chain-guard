import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingStars() {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;
    // base drift
    group.current.rotation.y += delta * 0.02;
    // subtle parallax
    const targetX = pointer.x * 0.12;
    const targetY = pointer.y * 0.08;
    group.current.rotation.x += (targetY - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (targetX - group.current.rotation.y) * 0.05;
  });

  return (
    <group ref={group}>
      <Stars
        radius={140}   // ⬅️ bigger starfield (was 90)
        depth={80}
        count={4000}
        factor={3.4}
        saturation={0}
        fade
        speed={0.7}
      />
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Bigger BLUE glow centered behind the hero */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_650px_at_50%_42%,rgba(59,130,246,0.35),transparent_75%)]" />
      {/* Soft blue vignette to blend edges */}
      <div className="absolute inset-0 bg-[radial-gradient(1600px_900px_at_50%_50%,rgba(96,165,250,0.18),transparent_80%)]" />
      {/* Gentle top-to-bottom blue tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-blue-100/20" />

      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 1] }}>
        {/* keep background transparent so gradients show */}
        {/* optional: faint blue fog to subtly tint distant stars */}
        <fog attach="fog" args={['#3b82f6', 1.5, 12]} />
        <ambientLight intensity={0.6} />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
