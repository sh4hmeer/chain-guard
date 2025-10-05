import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Global mouse position that works even with pointer-events-none
const globalMouse = { x: 0, y: 0 };

function RotatingStars() {
  const group = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const mouseVelocity = useRef({ x: 0, y: 0 });
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((_: any, delta: number) => {
    if (!group.current) return;
    
    // Use global mouse position instead of pointer from useThrees
    const pointer = { x: globalMouse.x, y: globalMouse.y };
    
    // Calculate mouse velocity for more dynamic response
    mouseVelocity.current.x = (pointer.x - prevPointer.current.x) * 2;
    mouseVelocity.current.y = (pointer.y - prevPointer.current.y) * 2;
    prevPointer.current.x = pointer.x;
    prevPointer.current.y = pointer.y;
    
    // Base continuous rotation with momentum
    rotationVelocity.current.y = rotationVelocity.current.y * 0.95 + delta * 0.15;
    rotationVelocity.current.x = rotationVelocity.current.x * 0.95 + delta * 0.08;
    
    group.current.rotation.y += rotationVelocity.current.y;
    group.current.rotation.x += rotationVelocity.current.x;
    
    // Enhanced mouse parallax with velocity-based response
    const targetX = pointer.x * 0.2 + mouseVelocity.current.x * 0.5;
    const targetY = pointer.y * 0.15 + mouseVelocity.current.y * 0.5;
    group.current.rotation.x += (targetY - group.current.rotation.x) * 0.12;
    group.current.rotation.y += (targetX - group.current.rotation.y) * 0.12;
    
    // Dynamic camera movement for depth
    camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <Stars
        radius={20}      // Expansive field
        depth={120}       // More depth for flowing effect
        count={6000}      // Increased density
        factor={5.5}      // Larger, more visible stars
        saturation={0}    // Clean white stars
        fade              // Smooth fade
        speed={1.5}       // Faster, more dynamic movement
      />
    </group>
  );
}

export default function Background3D() {
  // Track mouse position at window level (works even with pointer-events-none)
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to -1 to 1 range
      globalMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      globalMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        camera={{ position: [0, 0, 1], fov: 80 }}
      >
        {/* Enhanced atmospheric fog for more depth */}
        <fog attach="fog" args={['#0f172a', 5, 25]} />
        <ambientLight intensity={0.4} />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
