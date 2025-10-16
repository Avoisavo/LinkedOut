'use client';

import { useState } from 'react';

interface Condition {
  id: string;
  value1: string;
  operator: string;
  value2: string;
}

interface IfNodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  onSave?: (config: any) => void;
}

export default function IfNodeConfig({ isOpen, onClose, nodeData, onSave }: IfNodeConfigProps) {
  const [activeTab, setActiveTab] = useState<'conditions' | 'settings'>('conditions');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', value1: '', operator: 'is equal to', value2: '' }
  ]);
  const [convertTypes, setConvertTypes] = useState(true);
  const [combineMode, setCombineMode] = useState<'AND' | 'OR'>('AND');

  const operators = [
    'is equal to',
    'is not equal to',
    'contains',
    'does not contain',
    'starts with',
    'ends with',
    'is greater than',
    'is less than',
    'is greater than or equal',
    'is less than or equal',
    'is empty',
    'is not empty',
  ];

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now().toString(), value1: '', operator: 'is equal to', value2: '' }
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ conditions, convertTypes, combineMode });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[850px] max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(165deg, #2d2d3a 0%, #25252f 100%)',
          border: '1px solid rgba(100, 150, 200, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(to right, rgba(80, 120, 180, 0.15), rgba(100, 150, 200, 0.1))',
            borderColor: 'rgba(100, 150, 200, 0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 200, 150, 0.25), rgba(80, 180, 130, 0.35))',
                border: '2px solid rgba(150, 220, 180, 0.4)',
                boxShadow: '0 4px 12px rgba(100, 200, 150, 0.2)',
              }}
            >
              ⇄
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#e0e8f0', fontFamily: "'Orbitron', sans-serif" }}>
                If Condition
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8a9fb5' }}>
                Route items based on conditions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:rotate-90"
            style={{
              background: 'rgba(255, 80, 80, 0.2)',
              border: '1px solid rgba(255, 120, 120, 0.3)',
              color: '#ff8080',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 pt-5 pb-0">
          <button
            onClick={() => setActiveTab('conditions')}
            className="pb-3 px-1 text-sm font-semibold transition-all relative group"
            style={{
              color: activeTab === 'conditions' ? '#80d0ff' : '#8a9fb5',
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Conditions
            </span>
            {activeTab === 'conditions' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right, #60b0ff, #80d0ff)' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="pb-3 px-1 text-sm font-semibold transition-all relative"
            style={{
              color: activeTab === 'settings' ? '#80d0ff' : '#8a9fb5',
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
            {activeTab === 'settings' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(to right, #60b0ff, #80d0ff)' }}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(85vh - 220px)' }}>
          {activeTab === 'conditions' && (
            <div className="space-y-5">
              {/* Combine Mode Selector */}
              {conditions.length > 1 && (
                <div 
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: 'rgba(80, 120, 180, 0.1)',
                    border: '1px solid rgba(100, 150, 200, 0.2)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: '#e0e8f0' }}>
                    Combine conditions with:
                  </span>
                  <div className="flex gap-2">
                    {(['AND', 'OR'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCombineMode(mode)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: combineMode === mode 
                            ? 'linear-gradient(135deg, rgba(80, 160, 220, 0.4), rgba(100, 180, 240, 0.5))'
                            : 'rgba(60, 60, 70, 0.4)',
                          border: `1px solid ${combineMode === mode ? 'rgba(120, 180, 240, 0.6)' : 'rgba(100, 100, 110, 0.3)'}`,
                          color: combineMode === mode ? '#ffffff' : '#a0b0c0',
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions List */}
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={condition.id}>
                    {index > 0 && (
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px" style={{ background: 'rgba(100, 150, 200, 0.2)' }} />
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: 'rgba(80, 160, 220, 0.2)',
                            color: '#80c0ff',
                            border: '1px solid rgba(100, 180, 240, 0.3)',
                          }}
                        >
                          {combineMode}
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(100, 150, 200, 0.2)' }} />
                      </div>
                    )}
                    <div 
                      className="flex gap-2 items-center p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(40, 40, 50, 0.6), rgba(35, 35, 45, 0.7))',
                        border: '1px solid rgba(100, 150, 200, 0.2)',
                      }}
                    >
                      <input
                        type="text"
                        value={condition.value1}
                        onChange={(e) => updateCondition(condition.id, 'value1', e.target.value)}
                        placeholder="Field or value"
                        className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all"
                        style={{
                          background: 'rgba(20, 20, 28, 0.6)',
                          border: '1px solid rgba(100, 150, 200, 0.25)',
                          color: '#e0e8f0',
                        }}
                      />
                      
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                        className="px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all"
                        style={{
                          background: 'rgba(20, 20, 28, 0.6)',
                          border: '1px solid rgba(100, 150, 200, 0.25)',
                          color: '#e0e8f0',
                          minWidth: '160px',
                        }}
                      >
                        {operators.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={condition.value2}
                        onChange={(e) => updateCondition(condition.id, 'value2', e.target.value)}
                        placeholder="Compare value"
                        className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all"
                        style={{
                          background: 'rgba(20, 20, 28, 0.6)',
                          border: '1px solid rgba(100, 150, 200, 0.25)',
                          color: '#e0e8f0',
                        }}
                      />

                      {conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(condition.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{
                            background: 'rgba(255, 80, 80, 0.15)',
                            border: '1px solid rgba(255, 120, 120, 0.3)',
                            color: '#ff8080',
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Condition Button */}
              <button
                onClick={addCondition}
                className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(80, 120, 180, 0.2), rgba(100, 150, 200, 0.25))',
                  border: '2px dashed rgba(100, 150, 200, 0.4)',
                  color: '#80c0ff',
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Condition
              </button>

              {/* Convert Types Toggle */}
              <div 
                className="flex items-center justify-between p-4 rounded-xl mt-5"
                style={{
                  background: 'rgba(80, 120, 180, 0.08)',
                  border: '1px solid rgba(100, 150, 200, 0.2)',
                }}
              >
                <div>
                  <span className="text-sm font-medium block" style={{ color: '#e0e8f0' }}>
                    Auto-convert data types
                  </span>
                  <span className="text-xs" style={{ color: '#8a9fb5' }}>
                    Automatically convert strings to numbers when needed
                  </span>
                </div>
                <button
                  onClick={() => setConvertTypes(!convertTypes)}
                  className="relative w-14 h-7 rounded-full transition-all"
                  style={{
                    background: convertTypes 
                      ? 'linear-gradient(135deg, rgba(100, 200, 150, 0.6), rgba(80, 180, 130, 0.7))' 
                      : 'rgba(60, 60, 70, 0.6)',
                    border: `1px solid ${convertTypes ? 'rgba(150, 220, 180, 0.5)' : 'rgba(100, 100, 110, 0.3)'}`,
                  }}
                >
                  <div
                    className="absolute top-0.5 w-6 h-6 rounded-full transition-all shadow-lg"
                    style={{
                      background: '#ffffff',
                      transform: convertTypes ? 'translateX(28px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div 
              className="p-8 rounded-xl text-center"
              style={{
                background: 'rgba(40, 40, 50, 0.4)',
                border: '1px solid rgba(100, 150, 200, 0.2)',
              }}
            >
              <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#6a7b8c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium mb-2" style={{ color: '#a0b0c0' }}>
                Advanced Settings
              </p>
              <p className="text-xs" style={{ color: '#6a7b8c' }}>
                Additional configuration options coming soon
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{
            background: 'rgba(30, 30, 38, 0.8)',
            borderColor: 'rgba(100, 150, 200, 0.2)',
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(60, 60, 70, 0.6)',
              border: '1px solid rgba(100, 100, 110, 0.4)',
              color: '#a0b0c0',
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(100, 180, 240, 0.5), rgba(80, 160, 220, 0.6))',
              border: '1px solid rgba(120, 180, 240, 0.6)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(80, 160, 220, 0.3)',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Configuration
          </button>
        </div>
      </div>
    </>
  );
}

