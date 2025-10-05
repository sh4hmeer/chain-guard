import { useEffect, useRef } from 'react';

export function SplineBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse tracking
    const mouse = { x: 0, y: 0, isActive: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };
    const handleMouseLeave = () => {
      mouse.isActive = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Create a grid of nodes that form an elegant mesh
    const cols = 12;
    const rows = 8;
    const nodes: { x: number; y: number; baseX: number; baseY: number; angle: number; radius: number; speed: number }[] = [];
    
    const spacingX = canvas.width / (cols - 1);
    const spacingY = canvas.height / (rows - 1);
    
    // Initialize grid nodes
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * spacingX;
        const y = i * spacingY;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          angle: Math.random() * Math.PI * 2,
          radius: 15 + Math.random() * 20,
          speed: 0.005 + Math.random() * 0.007 // Increased speed
        });
      }
    }

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node positions with gentle circular motion + mouse interaction
      nodes.forEach((node) => {
        node.angle += node.speed;
        
        // Base circular motion
        let targetX = node.baseX + Math.cos(node.angle) * node.radius;
        let targetY = node.baseY + Math.sin(node.angle) * node.radius;
        
        // Mouse interaction: attract nodes towards cursor
        if (mouse.isActive) {
          const dx = mouse.x - node.baseX;
          const dy = mouse.y - node.baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 300; // Distance at which mouse stops affecting nodes
          
          if (distance < maxInfluence) {
            const influence = (1 - distance / maxInfluence) * 0.3; // Strength of attraction
            targetX += dx * influence;
            targetY += dy * influence;
          }
        }
        
        // Smooth interpolation for fluid movement
        node.x += (targetX - node.x) * 0.1;
        node.y += (targetY - node.y) * 0.1;
      });

      // Draw elegant connecting lines between nearby nodes
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)'; // Increased from 0.08
      ctx.lineWidth = 1.5; // Slightly thicker
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Connect to adjacent nodes for mesh effect
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only connect nearby nodes
          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.30; // Increased from 0.15
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      // Draw subtle gradient lines for extra elegance
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(159, 126, 238, 0.08)'); // Increased from 0.05
      gradient.addColorStop(0.5, 'rgba(81, 135, 222, 0.12)'); // Increased from 0.08
      gradient.addColorStop(1, 'rgba(161, 127, 240, 0.08)'); // Increased from 0.05
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.7; // Increased from 0.5
      
      // Draw horizontal waves
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        for (let j = 0; j < cols; j++) {
          const index = i * cols + j;
          const node = nodes[index];
          if (j === 0) {
            ctx.moveTo(node.x, node.y);
          } else {
            ctx.lineTo(node.x, node.y);
          }
        }
        ctx.stroke();
      }
      
      // Draw vertical waves
      for (let j = 1; j < cols; j++) {
        ctx.beginPath();
        for (let i = 0; i < rows; i++) {
          const index = i * cols + j;
          const node = nodes[index];
          if (i === 0) {
            ctx.moveTo(node.x, node.y);
          } else {
            ctx.lineTo(node.x, node.y);
          }
        }
        ctx.stroke();
      }

      // Draw subtle glowing nodes at intersections
      nodes.forEach((node, index) => {
        // Only draw some nodes for subtlety
        if (index % 3 === 0) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 5);
          gradient.addColorStop(0, 'rgba(96, 165, 250, 0.45)'); // Increased from 0.3
          gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, Math.PI * 2); // Increased from 4
          ctx.fill();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ 
        mixBlendMode: 'screen',
        zIndex: 5,
        opacity: 0.6, // Increased from 0.4
        pointerEvents: 'none' // Keep non-interactive with UI elements
      }}
    />
  );
}
