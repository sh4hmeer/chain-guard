import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingStars() {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  useFrame((_: any, delta: number) => {
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
        radius={180}      // Massive starfield for immersion
        depth={100}       // Deep space feel
        count={6000}      // Dense star population
        factor={4.5}      // Larger, more visible stars
        saturation={0}    // Pure white stars
        fade              // Smooth fade at edges
        speed={0.5}       // Gentle, calm movement
      />
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Deep blue gradient base - creates depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      
      {/* Primary radial glow - vibrant blue accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1400px_800px_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]" />
      
      {/* Secondary glow - cyan accent for dimension */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1000px_600px_at_30%_60%,rgba(6,182,212,0.15),transparent_65%)]" />
      
      {/* Tertiary glow - purple accent for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_70%_50%,rgba(147,51,234,0.12),transparent_60%)]" />
      
      {/* Subtle top vignette for polish */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-transparent to-transparent" />
      
      {/* Bottom fade for clean landing */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

      <Canvas 
        dpr={[1, 2]} 
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }} 
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        {/* Atmospheric fog for depth - deep blue */}
        <fog attach="fog" args={['#1e3a8a', 2, 15]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#60a5fa" />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
