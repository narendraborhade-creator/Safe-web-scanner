import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  connections: number[];
}

const COLORS = [
  'rgba(0, 240, 255,',   // cyan
  'rgba(123, 47, 255,',  // purple
  'rgba(255, 45, 149,',  // pink
  'rgba(0, 255, 136,',   // green
];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = Math.min(80, Math.floor((width * height) / 15000));
    const CONNECTION_DISTANCE = 180;
    const DEPTH = 600;

    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * DEPTH,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.6 + 0.3,
        connections: [],
      });
    }

    const project = (p: Particle) => {
      const perspective = DEPTH / (DEPTH + p.z);
      return {
        x: p.x * perspective + width / 2,
        y: p.y * perspective + height / 2,
        scale: perspective,
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections first (behind particles)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const proj1 = project(p1);
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECTION_DISTANCE) {
            const proj2 = project(p2);
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      for (const p of particles) {
        // Mouse interaction
        const proj = project(p);
        const mdx = mouseRef.current.x - proj.x;
        const mdy = mouseRef.current.y - proj.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 150) {
          const force = (150 - mDist) / 150 * 0.02;
          p.vx -= mdx * force * 0.01;
          p.vy -= mdy * force * 0.01;
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around
        if (p.x > width / 2 + 50) p.x = -width / 2 - 50;
        if (p.x < -width / 2 - 50) p.x = width / 2 + 50;
        if (p.y > height / 2 + 50) p.y = -height / 2 - 50;
        if (p.y < -height / 2 - 50) p.y = height / 2 + 50;
        if (p.z > DEPTH) p.z = 0;
        if (p.z < 0) p.z = DEPTH;

        // Damping
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Draw
        const drawSize = p.size * proj.scale;
        const alpha = p.alpha * proj.scale;

        // Glow
        const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, drawSize * 4);
        gradient.addColorStop(0, `${p.color} ${alpha * 0.4})`);
        gradient.addColorStop(1, `${p.color} 0)`);
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(proj.x, proj.y, drawSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `${p.color} ${alpha})`;
        ctx.arc(proj.x, proj.y, drawSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
