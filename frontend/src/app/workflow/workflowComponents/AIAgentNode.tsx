'use client';

import { useState } from 'react';

interface SubNode {
  id: string;
  type: 'model' | 'memory' | 'tool';
  title: string;
  icon: string;
  required?: boolean;
}

interface AIAgentNodeProps {
  node: {
    id: string;
    type: string;
    title: string;
    icon: string;
    position: { x: number; y: number };
    subNodes?: SubNode[];
  };
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddSubNode: (nodeId: string, type: 'model' | 'memory' | 'tool') => void;
  onRemoveSubNode?: (nodeId: string, subNodeId: string) => void;
  onConnectNext: (nodeId: string) => void;
}

interface MemoryOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'beginner' | 'advanced';
}

const MEMORY_OPTIONS: MemoryOption[] = [
  {
    id: 'simple',
    name: 'Simple Memory',
    description: 'Stores in n8n memory, so no credentials required',
    icon: '🗄️',
    category: 'beginner'
  },
  {
    id: 'mongodb',
    name: 'MongoDB Chat Memory',
    description: 'Stores the chat history in MongoDB collection.',
    icon: '🍃',
    category: 'advanced'
  },
  {
    id: 'motorhead',
    name: 'Motorhead',
    description: 'Use Motorhead Memory',
    icon: '📄',
    category: 'advanced'
  },
  {
    id: 'postgres',
    name: 'Postgres Chat Memory',
    description: 'Stores the chat history in Postgres table.',
    icon: '🐘',
    category: 'advanced'
  },
  {
    id: 'redis',
    name: 'Redis Chat Memory',
    description: 'Stores the chat history in Redis.',
    icon: '🔴',
    category: 'advanced'
  },
  {
    id: 'xata',
    name: 'Xata',
    description: 'Use Xata Memory',
    icon: '🦋',
    category: 'advanced'
  }
];

export default function AIAgentNode({
  node,
  onMouseDown,
  onDelete,
  onAddSubNode,
  onRemoveSubNode,
  onConnectNext
}: AIAgentNodeProps) {
  const [expandedSubNode, setExpandedSubNode] = useState<string | null>(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  const modelNode = node.subNodes?.find(n => n.type === 'model');
  const memoryNodes = node.subNodes?.filter(n => n.type === 'memory') || [];
  const toolNodes = node.subNodes?.filter(n => n.type === 'tool') || [];

  return (
    <div
      className="absolute"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
      }}
    >
      <div className="flex items-start gap-8">
        {/* Main AI Agent Node */}
        <div
          onMouseDown={(e) => onMouseDown(e, node.id)}
          className="relative group"
        >
          <div
            className="px-8 py-5 rounded-2xl min-w-[400px] cursor-move transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(138, 180, 248, 0.4), rgba(100, 140, 220, 0.5))',
              border: '2px solid rgba(138, 180, 248, 0.5)',
              backdropFilter: 'blur(15px)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 4px 16px rgba(138, 180, 248, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.2)
              `,
            }}
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 80, 80, 0.9), rgba(220, 60, 60, 1))',
                border: '1px solid rgba(255, 120, 120, 0.6)',
                boxShadow: '0 2px 8px rgba(255, 80, 80, 0.4)',
                color: '#ffffff',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Item Count Badge */}
            <div 
              className="absolute -top-3 -left-3 px-2 py-1 rounded text-xs font-semibold"
              style={{
                background: 'rgba(138, 180, 248, 0.3)',
                border: '1px solid rgba(138, 180, 248, 0.5)',
                color: '#e0e8f0',
              }}
            >
              {(node.subNodes?.length || 0)} item{(node.subNodes?.length || 0) !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {node.icon}
              </div>
              <div>
                <p 
                  className="text-lg font-bold"
                  style={{
                    color: '#e0e8f0',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {node.title}
                </p>
                <p className="text-xs" style={{ color: '#b0c5d8' }}>
                  AI Agent Configuration
                </p>
              </div>
            </div>
          </div>

          {/* Connect to Next Node Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConnectNext(node.id);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
                border: '1px solid rgba(150, 180, 220, 0.4)',
                boxShadow: '0 4px 12px rgba(80, 120, 180, 0.3)',
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sub-nodes Section - Right Side */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Chat Model */}
          <div className="flex items-center gap-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: modelNode ? 'rgba(138, 180, 248, 0.8)' : 'rgba(138, 180, 248, 0.3)',
                boxShadow: '0 0 8px rgba(138, 180, 248, 0.5)',
              }}
            />
            <div 
              className="text-xs font-semibold min-w-[80px]"
              style={{ color: '#b0c5d8' }}
            >
              Chat Model<span style={{ color: '#ff6b6b' }}>*</span>
            </div>
            {modelNode ? (
              <div
                className="relative cursor-pointer transition-all hover:scale-105 group"
              >
                <div
                  className="px-4 py-2 rounded-lg flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(60, 80, 120, 0.6), rgba(50, 70, 110, 0.7))',
                    border: '1px solid rgba(138, 180, 248, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {modelNode.icon}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: '#e0e8f0' }}>
                    {modelNode.title}
                  </p>
                </div>
                {onRemoveSubNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSubNode(node.id, modelNode.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 80, 80, 0.9), rgba(220, 60, 60, 1))',
                      border: '1px solid rgba(255, 120, 120, 0.6)',
                      boxShadow: '0 2px 8px rgba(255, 80, 80, 0.4)',
                      color: '#ffffff',
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubNode(node.id, 'model');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(138, 180, 248, 0.3)',
                  border: '1px solid rgba(138, 180, 248, 0.5)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {/* Memory */}
          <div className="flex items-center gap-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: memoryNodes.length > 0 ? 'rgba(138, 180, 248, 0.8)' : 'rgba(138, 180, 248, 0.3)',
                boxShadow: '0 0 8px rgba(138, 180, 248, 0.5)',
              }}
            />
            <div 
              className="text-xs font-semibold min-w-[80px]"
              style={{ color: '#b0c5d8' }}
            >
              Memory
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMemoryPanel(true);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(138, 180, 248, 0.3)',
                  border: '1px solid rgba(138, 180, 248, 0.5)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {memoryNodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {memoryNodes.map((mem) => (
                    <div
                      key={mem.id}
                      className="relative px-3 py-1.5 rounded-lg flex items-center gap-2 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(60, 80, 120, 0.6), rgba(50, 70, 110, 0.7))',
                        border: '1px solid rgba(138, 180, 248, 0.4)',
                      }}
                    >
                      <span className="text-sm">{mem.icon}</span>
                      <span className="text-xs" style={{ color: '#e0e8f0' }}>{mem.title}</span>
                      {onRemoveSubNode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSubNode(node.id, mem.id);
                          }}
                          className="w-4 h-4 rounded-full flex items-center justify-center ml-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          style={{
                            background: 'rgba(255, 80, 80, 0.8)',
                            border: '1px solid rgba(255, 120, 120, 0.6)',
                            color: '#ffffff',
                          }}
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tool */}
          <div className="flex items-center gap-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: toolNodes.length > 0 ? 'rgba(138, 180, 248, 0.8)' : 'rgba(138, 180, 248, 0.3)',
                boxShadow: '0 0 8px rgba(138, 180, 248, 0.5)',
              }}
            />
            <div 
              className="text-xs font-semibold min-w-[80px]"
              style={{ color: '#b0c5d8' }}
            >
              Tool
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubNode(node.id, 'tool');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(138, 180, 248, 0.3)',
                  border: '1px solid rgba(138, 180, 248, 0.5)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {toolNodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {toolNodes.map((tool) => (
                    <div
                      key={tool.id}
                      className="relative px-3 py-1.5 rounded-lg flex items-center gap-2 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(60, 80, 120, 0.6), rgba(50, 70, 110, 0.7))',
                        border: '1px solid rgba(138, 180, 248, 0.4)',
                      }}
                    >
                      <span className="text-sm">{tool.icon}</span>
                      <span className="text-xs" style={{ color: '#e0e8f0' }}>{tool.title}</span>
                      {onRemoveSubNode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSubNode(node.id, tool.id);
                          }}
                          className="w-4 h-4 rounded-full flex items-center justify-center ml-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          style={{
                            background: 'rgba(255, 80, 80, 0.8)',
                            border: '1px solid rgba(255, 120, 120, 0.6)',
                            color: '#ffffff',
                          }}
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Selection Panel */}
      {showMemoryPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowMemoryPanel(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 40, 60, 0.95), rgba(20, 30, 50, 0.98))',
              border: '2px solid rgba(138, 180, 248, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: 'rgba(138, 180, 248, 0.2)',
                    border: '1px solid rgba(138, 180, 248, 0.3)',
                  }}
                >
                  🧠
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#e0e8f0' }}>
                    Memory
                  </h2>
                  <p className="text-sm" style={{ color: '#8a9fb5' }}>
                    Memory allows an AI model to remember and reference past interactions with it
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryPanel(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(255, 80, 80, 0.2)',
                  border: '1px solid rgba(255, 80, 80, 0.3)',
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* For Beginners Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#b0c5d8' }}>
                For beginners
              </h3>
              {MEMORY_OPTIONS.filter(m => m.category === 'beginner').map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => {
                    onAddSubNode(node.id, 'memory');
                    setShowMemoryPanel(false);
                  }}
                  className="p-4 rounded-xl mb-2 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(60, 80, 120, 0.4), rgba(50, 70, 110, 0.5))',
                    border: '1px solid rgba(138, 180, 248, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {memory.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: '#e0e8f0' }}>
                        {memory.name}
                      </h4>
                      <p className="text-xs" style={{ color: '#8a9fb5' }}>
                        {memory.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Memories Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#b0c5d8' }}>
                Other memories
              </h3>
              {MEMORY_OPTIONS.filter(m => m.category === 'advanced').map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => {
                    onAddSubNode(node.id, 'memory');
                    setShowMemoryPanel(false);
                  }}
                  className="p-4 rounded-xl mb-2 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(60, 80, 120, 0.4), rgba(50, 70, 110, 0.5))',
                    border: '1px solid rgba(138, 180, 248, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {memory.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: '#e0e8f0' }}>
                        {memory.name}
                      </h4>
                      <p className="text-xs" style={{ color: '#8a9fb5' }}>
                        {memory.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

