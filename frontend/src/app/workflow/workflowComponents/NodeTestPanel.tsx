'use client';

import { useState, useEffect, useRef } from 'react';

interface TestEvent {
  id: string;
  timestamp: string;
  type: string;
  data: any;
  status: 'success' | 'error';
}

interface NodeTestPanelProps {
  isOpen: boolean;
  appName: string;
  appIcon: string;
  triggerType: string;
  credential: any;
  onComplete: () => void;
  onCancel: () => void;
}

interface FieldMapping {
  inputField: string;
  outputField: string;
  enabled: boolean;
}

export default function NodeTestPanel({
  isOpen,
  appName,
  appIcon,
  triggerType,
  credential,
  onComplete,
  onCancel
}: NodeTestPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [events, setEvents] = useState<TestEvent[]>([]);
  const [lastUpdateId, setLastUpdateId] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<TestEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [outputData, setOutputData] = useState<any>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && credential) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [isOpen, credential]);

  // Auto-select first real event and generate output
  useEffect(() => {
    const firstRealEvent = events.find(e => e.type !== 'system');
    if (firstRealEvent && !selectedEvent) {
      setSelectedEvent(firstRealEvent);
      generateOutputData(firstRealEvent);
    }
  }, [events]);

  // Update output when field mappings change
  useEffect(() => {
    if (selectedEvent) {
      generateOutputData(selectedEvent);
    }
  }, [fieldMappings, selectedEvent]);

  const startListening = async () => {
    setIsListening(true);
    setEvents([]);

    // Add initial status event
    addEvent({
      type: 'system',
      data: {
        message: `🤖 Bot is now listening for ${triggerType}...`,
        instruction: 'Send a message to your Telegram bot to test!'
      },
      status: 'success'
    });

    // Start polling for updates
    pollTelegramUpdates();
  };

  const pollTelegramUpdates = () => {
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${credential.token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
        );
        
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
          data.result.forEach((update: any) => {
            // Update the last update ID
            setLastUpdateId(update.update_id);
            
            // Process the update based on trigger type
            processUpdate(update);
          });
        }
      } catch (error) {
        console.error('Error polling Telegram:', error);
        addEvent({
          type: 'error',
          data: {
            message: 'Failed to fetch updates',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          status: 'error'
        });
      }
    }, 2000); // Poll every 2 seconds
  };

  const processUpdate = (update: any) => {
    let eventType = 'unknown';
    let eventData = update;

    // Determine event type
    if (update.message) {
      eventType = 'message';
      eventData = {
        update_id: update.update_id,
        message_id: update.message.message_id,
        from: update.message.from,
        chat: update.message.chat,
        text: update.message.text,
        date: update.message.date
      };
    } else if (update.callback_query) {
      eventType = 'callback_query';
      eventData = {
        update_id: update.update_id,
        callback_query_id: update.callback_query.id,
        from: update.callback_query.from,
        data: update.callback_query.data
      };
    } else if (update.inline_query) {
      eventType = 'inline_query';
      eventData = {
        update_id: update.update_id,
        query_id: update.inline_query.id,
        from: update.inline_query.from,
        query: update.inline_query.query
      };
    } else if (update.channel_post) {
      eventType = 'channel_post';
      eventData = {
        update_id: update.update_id,
        post: update.channel_post
      };
    } else if (update.edited_message) {
      eventType = 'edited_message';
      eventData = {
        update_id: update.update_id,
        message: update.edited_message
      };
    }

    addEvent({
      type: eventType,
      data: eventData,
      status: 'success'
    });
  };

  const addEvent = (event: Omit<TestEvent, 'id' | 'timestamp'>) => {
    const newEvent: TestEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      ...event
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
  };

  const generateOutputData = (event: TestEvent) => {
    // If no mappings, use all data from event
    if (fieldMappings.length === 0) {
      setOutputData(event.data);
      return;
    }

    // Apply field mappings
    const mapped: any = {};
    fieldMappings.forEach((mapping) => {
      if (mapping.enabled && event.data[mapping.inputField] !== undefined) {
        mapped[mapping.outputField] = event.data[mapping.inputField];
      }
    });
    setOutputData(mapped);
  };

  const addFieldMapping = () => {
    setFieldMappings([...fieldMappings, { inputField: '', outputField: '', enabled: true }]);
  };

  const updateFieldMapping = (index: number, field: keyof FieldMapping, value: any) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], [field]: value };
    setFieldMappings(updated);
  };

  const removeFieldMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const stopListening = () => {
    setIsListening(false);
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleComplete = () => {
    stopListening();
    onComplete();
  };

  const handleCancel = () => {
    stopListening();
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)' }}
    >
      <div
        className="rounded-lg w-full max-w-7xl mx-4 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))',
          border: '1px solid rgba(150, 180, 220, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          height: '85vh',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{
                  background: 'rgba(37, 169, 224, 0.2)',
                  border: '1px solid rgba(37, 169, 224, 0.4)',
                }}
              >
                {appIcon}
              </div>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#e0e8f0' }}>
                  Test {appName} Trigger
                </h3>
                <p className="text-sm" style={{ color: '#8a9fb5' }}>
                  {isListening ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Listening for events...
                    </span>
                  ) : (
                    'Stopped listening'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT COLUMN - INPUT */}
          <div className="w-1/3 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8a9fb5' }}>
                INPUT
              </h4>
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: '#a0b0c5' }}>
                <span className="font-medium">{appName} Trigger</span>
                {isListening && (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    Listening
                  </span>
                )}
          </div>
        </div>

            <div className="flex-1 overflow-y-auto p-4">
          {events.length === 0 && isListening && (
                <div className="text-center py-8" style={{ color: '#8a9fb5' }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(37, 169, 224, 0.1)' }}>
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
                  <p className="text-sm font-semibold mb-1">Waiting for events...</p>
                  <p className="text-xs">Send a message to your {appName} bot</p>
            </div>
          )}

              <div className="space-y-2">
                {events.filter(e => e.type !== 'system').map((event) => (
              <div
                key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                      background: selectedEvent?.id === event.id 
                        ? 'linear-gradient(135deg, rgba(80, 200, 120, 0.25), rgba(60, 180, 100, 0.3))'
                        : 'linear-gradient(135deg, rgba(60, 60, 70, 0.4), rgba(50, 50, 60, 0.5))',
                      border: selectedEvent?.id === event.id
                        ? '1px solid rgba(80, 200, 120, 0.4)'
                        : '1px solid rgba(100, 100, 120, 0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" 
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                          color: '#90ee90',
                      }}>
                      {event.type.toUpperCase()}
                    </span>
                  <span className="text-xs" style={{ color: '#8a9fb5' }}>
                    {event.timestamp}
                  </span>
                </div>
                
                    <pre
                      className="text-xs p-2 rounded overflow-auto max-h-24"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#d0d8e0',
                        fontFamily: 'monospace',
                      }}
                    >
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - CONFIGURATION */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="border-b border-white/10 flex">
              <button
                onClick={() => setActiveTab('parameters')}
                className="px-6 py-3 text-sm font-medium transition-all"
                style={{
                  color: activeTab === 'parameters' ? '#e0e8f0' : '#8a9fb5',
                  borderBottom: activeTab === 'parameters' ? '2px solid #50c878' : '2px solid transparent',
                }}
              >
                Parameters
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-6 py-3 text-sm font-medium transition-all"
                style={{
                  color: activeTab === 'settings' ? '#e0e8f0' : '#8a9fb5',
                  borderBottom: activeTab === 'settings' ? '2px solid #50c878' : '2px solid transparent',
                }}
              >
                Settings
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'parameters' ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold mb-2" style={{ color: '#e0e8f0' }}>
                      Field Mappings
                    </h5>
                    <p className="text-xs mb-4" style={{ color: '#8a9fb5' }}>
                      Map input fields to custom output field names. Leave empty to use all fields as-is.
                    </p>
                  </div>

                  {selectedEvent ? (
                    <div className="space-y-3">
                      {fieldMappings.map((mapping, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <select
                            value={mapping.inputField}
                            onChange={(e) => updateFieldMapping(index, 'inputField', e.target.value)}
                            className="flex-1 px-3 py-2 rounded text-sm"
                            style={{
                              background: 'rgba(30, 30, 40, 0.8)',
                              border: '1px solid rgba(100, 100, 120, 0.3)',
                              color: '#e0e8f0',
                            }}
                          >
                            <option value="">Select field</option>
                            {selectedEvent.data && Object.keys(selectedEvent.data).map(key => (
                              <option key={key} value={key}>{key}</option>
                            ))}
                          </select>
                          <span style={{ color: '#8a9fb5' }}>→</span>
                          <input
                            type="text"
                            value={mapping.outputField}
                            onChange={(e) => updateFieldMapping(index, 'outputField', e.target.value)}
                            placeholder="Output field name"
                            className="flex-1 px-3 py-2 rounded text-sm"
                            style={{
                              background: 'rgba(30, 30, 40, 0.8)',
                              border: '1px solid rgba(100, 100, 120, 0.3)',
                              color: '#e0e8f0',
                            }}
                          />
                          <button
                            onClick={() => removeFieldMapping(index)}
                            className="p-2 rounded hover:bg-red-500/20 transition-colors"
                            style={{ color: '#ff6b6b' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={addFieldMapping}
                        className="w-full py-2 rounded text-sm font-medium transition-all hover:scale-[1.02]"
                        style={{
                          background: 'rgba(80, 200, 120, 0.15)',
                          border: '1px solid rgba(80, 200, 120, 0.3)',
                          color: '#50c878',
                        }}
                      >
                        + Add Field Mapping
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8" style={{ color: '#8a9fb5' }}>
                      <p className="text-sm">Select an event from the input to configure mappings</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold mb-2" style={{ color: '#e0e8f0' }}>
                      Trigger Settings
                    </h5>
                    <p className="text-xs mb-4" style={{ color: '#8a9fb5' }}>
                      Configure how this trigger behaves in your workflow.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{
                    background: 'rgba(37, 169, 224, 0.1)',
                    border: '1px solid rgba(37, 169, 224, 0.3)',
                  }}>
                    <p className="text-sm" style={{ color: '#a0b0c5' }}>
                      💡 <strong>How to test:</strong> Open {appName} and send a message to your bot. 
                      The event will appear in the INPUT panel in real-time.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium" style={{ color: '#e0e8f0' }}>
                      Trigger Type
                    </label>
                    <input
                      type="text"
                      value={triggerType}
                      disabled
                      className="w-full mt-2 px-3 py-2 rounded text-sm"
                      style={{
                        background: 'rgba(30, 30, 40, 0.5)',
                        border: '1px solid rgba(100, 100, 120, 0.3)',
                        color: '#8a9fb5',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - OUTPUT */}
          <div className="w-1/3 border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8a9fb5' }}>
                OUTPUT
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {outputData ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#a0b0c5' }}>
                      Processed Data
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      Ready
                    </span>
                  </div>
                  <pre
                    className="text-xs p-4 rounded overflow-auto"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      color: '#e0e8f0',
                      fontFamily: 'monospace',
                      maxHeight: 'calc(100% - 60px)',
                    }}
                  >
                    {JSON.stringify(outputData, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: '#8a9fb5' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(100, 100, 120, 0.1)' }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">Execute trigger to view output data</p>
                </div>
              )}
              </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: '#8a9fb5' }}>
              {events.filter(e => e.type !== 'system').length > 0 && (
                <span className="text-green-400">
                  ✓ {events.filter(e => e.type !== 'system').length} event(s) received
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(100, 100, 100, 0.3)',
                  border: '1px solid rgba(150, 150, 150, 0.3)',
                  color: '#e0e8f0',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={events.filter(e => e.type !== 'system').length === 0}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(80, 200, 120, 0.5), rgba(60, 180, 100, 0.6))',
                  border: '1px solid rgba(80, 200, 120, 0.4)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(80, 200, 120, 0.3)',
                }}
              >
                {events.filter(e => e.type !== 'system').length > 0 ? 'Add to Workflow' : 'Test First'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

