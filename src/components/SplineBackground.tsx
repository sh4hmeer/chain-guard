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

      // Update node positions with gentle circular motion
      nodes.forEach((node) => {
        node.angle += node.speed;
        node.x = node.baseX + Math.cos(node.angle) * node.radius;
        node.y = node.baseY + Math.sin(node.angle) * node.radius;
      });

      // Draw elegant connecting lines between nearby nodes
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      
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
            const opacity = (1 - distance / 150) * 0.15;
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
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.5;
      
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
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 4);
          gradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
          gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        mixBlendMode: 'screen',
        zIndex: 5,
        opacity: 0.4
      }}
    />
  );
}
