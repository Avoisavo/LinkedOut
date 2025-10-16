'use client';

import { useState, useRef, useEffect } from 'react';

export default function InteractiveCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const newTrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: trailIdRef.current++
      };
      
      setTrail(prev => [...prev, newTrailPoint].slice(-15));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="fixed pointer-events-none z-50 mix-blend-screen"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(180, 200, 220, 0.1) 40%, transparent 70%)',
          transition: 'width 0.2s, height 0.2s',
        }}
      />

      {trail.map((point, index) => {
        const opacity = (index + 1) / trail.length;
        const scale = (index + 1) / trail.length;
        return (
          <div
            key={point.id}
            className="fixed pointer-events-none z-40"
            style={{
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
              width: `${8 * scale}px`,
              height: `${8 * scale}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 255, 255, ${0.6 * opacity}) 0%, rgba(180, 200, 220, ${0.3 * opacity}) 50%, transparent 100%)`,
              opacity: opacity * 0.7,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'width 0.15s, height 0.15s, opacity 0.15s',
        }}
      />
    </>
  );
}

