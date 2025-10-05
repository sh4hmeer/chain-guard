import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingStars() {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  useFrame((_: any, delta: number) => {
    if (!group.current) return;
    
    // Continuous gentle rotation - more free-flowing
    group.current.rotation.y += delta * 0.08;
    group.current.rotation.x += delta * 0.03;
    
    // Very subtle mouse parallax - not too distracting
    const targetX = pointer.x * 0.05;
    const targetY = pointer.y * 0.03;
    group.current.rotation.x += (targetY - group.current.rotation.x) * 0.02;
    group.current.rotation.y += (targetX - group.current.rotation.y) * 0.02;
  });

  return (
    <group ref={group}>
      <Stars
        radius={200}      // Expansive field
        depth={120}       // More depth for flowing effect
        count={5000}      // Balanced density
        factor={3.8}      // Refined star size
        saturation={0}    // Clean white stars
        fade              // Smooth fade
        speed={1.2}       // Faster, more fluid movement
      />
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Minimal deep gradient base - refined and tasteful */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
      
      {/* Single refined blue glow - sleek and secure feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_1200px_700px_at_50%_45%,rgba(59,130,246,0.15),transparent_70%)]" />
      
      {/* Subtle top fade - clean minimal edge */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-transparent" />

      <Canvas 
        dpr={[1, 2]} 
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }} 
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        {/* Minimal atmospheric fog - subtle depth */}
        <fog attach="fog" args={['#0f172a', 3, 18]} />
        <ambientLight intensity={0.3} />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
