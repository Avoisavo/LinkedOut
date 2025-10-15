'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '../../../component/Header';
import NodePanel from '../../../component/NodePanel';

// Interactive cursor component
function InteractiveCursor() {
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


interface WorkflowNode {
  id: string;
  type: string;
  title: string;
  icon: string;
  position: { x: number; y: number };
}

export default function WorkflowPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { 
      id: '1', 
      type: 'trigger', 
      title: 'Execute workflow', 
      icon: '⚡',
      position: { x: 400, y: 200 } 
    },
  ]);

  const handleAddNode = (nodeType: any) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: nodeType.id,
      title: nodeType.title,
      icon: nodeType.icon,
      position: { x: 400, y: nodes.length * 120 + 200 }
    };
    setNodes([...nodes, newNode]);
    setIsPanelOpen(false);
  };

  return (
    <div 
      className="relative min-h-screen overflow-hidden" 
      style={{ 
        cursor: 'none',
        background: '#1e1e24',
      }}
    >
      {/* Interactive Cursor */}
      <InteractiveCursor />

      {/* Header */}
      <Header title="My Workflow" showBackButton={true} />

      {/* Workflow Canvas */}
      <div className="relative z-10" style={{ height: 'calc(100vh - 64px)' }}>
        <div 
          className="w-full h-full relative overflow-auto"
          style={{
            background: '#1e1e24',
            backgroundImage: `
              linear-gradient(rgba(100, 150, 200, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 150, 200, 0.04) 1px, transparent 1px),
              linear-gradient(rgba(100, 150, 200, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 150, 200, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
            backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px',
          }}
        >
          {/* Workflow Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {nodes.map((node, index) => {
              if (index < nodes.length - 1) {
                const nextNode = nodes[index + 1];
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={node.position.x + 100}
                    y1={node.position.y + 40}
                    x2={nextNode.position.x + 100}
                    y2={nextNode.position.y}
                    stroke="rgba(138, 180, 248, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              }
              return null;
            })}
          </svg>

          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
            >
              <div
                className="px-6 py-4 rounded-lg min-w-[200px] cursor-move transition-all hover:scale-105"
                style={{
                  background: node.type === 'trigger' 
                    ? 'linear-gradient(135deg, rgba(255, 100, 100, 0.3), rgba(255, 80, 80, 0.4))'
                    : 'linear-gradient(135deg, rgba(100, 150, 200, 0.4), rgba(80, 120, 180, 0.5))',
                  border: node.type === 'trigger'
                    ? '1px solid rgba(255, 120, 120, 0.4)'
                    : '1px solid rgba(150, 180, 220, 0.4)',
                  backdropFilter: 'blur(15px)',
                  boxShadow: `
                    0 8px 24px rgba(0, 0, 0, 0.4),
                    0 4px 12px rgba(80, 120, 180, 0.2),
                    inset 0 1px 2px rgba(255, 255, 255, 0.2),
                    0 0 20px rgba(100, 150, 200, 0.15)
                  `,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {node.icon}
                  </div>
                  <div>
                    <p 
                      className="text-sm font-semibold"
                      style={{
                        color: '#e0e8f0',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {node.title}
                    </p>
                    <p className="text-xs" style={{ color: '#8a9fb5' }}>
                      {node.type === 'trigger' ? 'When clicking "Execute workflow"' : 'Click to configure'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Node Button */}
              {index === nodes.length - 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsPanelOpen(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
                      border: '1px solid rgba(150, 180, 220, 0.4)',
                      boxShadow: '0 4px 12px rgba(80, 120, 180, 0.3)',
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Bottom Execute Button */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(135deg, rgba(255, 100, 100, 0.5), rgba(255, 80, 80, 0.6))',
                border: '1px solid rgba(255, 120, 120, 0.4)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(255, 80, 80, 0.3)',
                letterSpacing: '0.1em',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execute workflow
            </button>
          </div>
        </div>
      </div>

      {/* Node Panel Sidebar */}
      <NodePanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddNode={handleAddNode}
      />

      {/* Fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}

