'use client';

import { useState } from 'react';

interface NodeType {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'ai',
    title: 'AI',
    description: 'Build autonomous agents, summarize or search documents, etc.',
    icon: '🤖',
    category: 'AI'
  },
  {
    id: 'action',
    title: 'Action in an app',
    description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
    icon: '🌐',
    category: 'Action'
  },
  {
    id: 'transformation',
    title: 'Data transformation',
    description: 'Manipulate, filter or convert data',
    icon: '✏️',
    category: 'Transform'
  },
  {
    id: 'flow',
    title: 'Flow',
    description: 'Branch, merge or loop the flow, etc.',
    icon: '🔀',
    category: 'Flow'
  },
  {
    id: 'core',
    title: 'Core',
    description: 'Run code, make HTTP requests, set webhooks, etc.',
    icon: '⚙️',
    category: 'Core'
  },
  {
    id: 'human',
    title: 'Human in the loop',
    description: 'Wait for approval or human input before continuing',
    icon: '👤',
    category: 'Human'
  },
  {
    id: 'trigger',
    title: 'Add another trigger',
    description: 'Triggers start your workflow. Workflows can have multiple triggers.',
    icon: '⚡',
    category: 'Trigger'
  },
];

interface NodePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (nodeType: NodeType) => void;
}

export default function NodePanel({ isOpen, onClose, onAddNode }: NodePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodeTypes.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
          style={{ opacity: isOpen ? 1 : 0 }}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className="fixed right-0 top-0 h-full w-96 z-50 transition-transform duration-300 overflow-hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98))',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: 'linear-gradient(to bottom, #ffffff 0%, #e0e8f0 50%, #9fb5cc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                What happens next?
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg outline-none"
                style={{
                  background: 'rgba(50, 50, 60, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e0e8f0',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => onAddNode(node)}
                className="group p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(40, 40, 50, 0.5), rgba(30, 30, 40, 0.7))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.3), rgba(80, 120, 180, 0.4))',
                      border: '1px solid rgba(150, 180, 220, 0.3)',
                    }}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="font-semibold text-sm"
                        style={{
                          color: '#e0e8f0',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {node.title}
                      </h3>
                      <svg
                        className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p
                      className="text-xs"
                      style={{
                        color: '#8a9fb5',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

