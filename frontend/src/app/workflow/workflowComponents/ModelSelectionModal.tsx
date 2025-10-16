'use client';

import { useState } from 'react';

const models = [
  {
    id: 'google-gemini',
    title: 'Google Gemini Chat Model',
    description: 'Google\'s most capable AI model with advanced reasoning',
    icon: '🔷',
    provider: 'Google',
  },
  {
    id: 'openai-gpt4',
    title: 'OpenAI GPT-4',
    description: 'Most advanced OpenAI model for complex tasks',
    icon: '🤖',
    provider: 'OpenAI',
  },
  {
    id: 'anthropic-claude',
    title: 'Anthropic Claude',
    description: 'Constitutional AI model focused on safety',
    icon: '🎭',
    provider: 'Anthropic',
  },
  {
    id: 'openai-gpt35',
    title: 'OpenAI GPT-3.5',
    description: 'Fast and efficient for most tasks',
    icon: '⚡',
    provider: 'OpenAI',
  },
];

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: any) => void;
}

export default function ModelSelectionModal({
  isOpen,
  onClose,
  onSelectModel
}: ModelSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = models.filter(model =>
    model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="p-6 rounded-lg max-w-2xl w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))',
          border: '1px solid rgba(150, 180, 220, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold" style={{ color: '#e0e8f0' }}>
              Select Chat Model
            </h3>
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
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg outline-none"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(150, 180, 220, 0.3)',
                color: '#e0e8f0',
              }}
            />
            <svg
              className="w-5 h-5 absolute left-3 top-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Models List */}
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => onSelectModel(model)}
              className="group p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 40, 50, 0.5), rgba(30, 30, 40, 0.7))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: 'rgba(138, 180, 248, 0.2)',
                    border: '1px solid rgba(138, 180, 248, 0.3)',
                  }}
                >
                  {model.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className="font-semibold text-base"
                      style={{
                        color: '#e0e8f0',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {model.title}
                    </h4>
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{
                      color: '#a0b0c5',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {model.description}
                  </p>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: 'rgba(138, 180, 248, 0.2)',
                      color: '#8ab4f8',
                    }}
                  >
                    {model.provider}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

