'use client';

import { useState } from 'react';

const triggerTypes = [
  {
    id: 'manual',
    title: 'Trigger manually',
    description: 'Runs the flow on clicking a button in n8n. Good for getting started quickly',
    icon: '👆',
  },
  {
    id: 'app-event',
    title: 'On app event',
    description: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
    icon: '📡',
  },
  {
    id: 'schedule',
    title: 'On a schedule',
    description: 'Runs the flow every day, hour, or custom interval',
    icon: '🕐',
  },
  {
    id: 'webhook',
    title: 'On webhook call',
    description: 'Runs the flow on receiving an HTTP request',
    icon: '🔗',
  },
  {
    id: 'form',
    title: 'On form submission',
    description: 'Generate webforms in n8n and pass their responses to the workflow',
    icon: '📝',
  },
  {
    id: 'workflow',
    title: 'When executed by another workflow',
    description: 'Runs the flow when called by the Execute Workflow node from a different workflow',
    icon: '➡️',
  },
  {
    id: 'chat',
    title: 'On chat message',
    description: 'Runs the flow when a user sends a chat message. For use with AI nodes',
    icon: '💬',
  },
  {
    id: 'evaluation',
    title: 'When running evaluation',
    description: 'Run a dataset through your workflow to test',
    icon: '✓',
  },
];

const appOptions = [
  {
    id: 'github',
    title: 'GitHub',
    description: 'Trigger on repository events, issues, pull requests, and more',
    icon: '🐙',
    color: 'rgba(36, 41, 47, 0.3)',
  },
  {
    id: 'gmail',
    title: 'Gmail',
    description: 'Trigger when receiving new emails or email events',
    icon: '📧',
    color: 'rgba(234, 67, 53, 0.2)',
  },
  {
    id: 'telegram',
    title: 'Telegram',
    description: 'Trigger on new messages, commands, or bot interactions',
    icon: '✈️',
    color: 'rgba(37, 169, 224, 0.2)',
    hasTriggers: true,
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    description: 'Trigger on profile updates, connections, or posts',
    icon: '💼',
    color: 'rgba(10, 102, 194, 0.2)',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Trigger on incoming messages or WhatsApp events',
    icon: '💬',
    color: 'rgba(37, 211, 102, 0.2)',
  },
  {
    id: 'twitter',
    title: 'Twitter',
    description: 'Trigger on tweets, mentions, likes, or followers',
    icon: '🐦',
    color: 'rgba(29, 161, 242, 0.2)',
  },
];

const telegramTriggers = [
  {
    id: 'callback-query',
    title: 'On callback query',
    description: 'Triggered when a user clicks an inline button',
    icon: '✈️',
  },
  {
    id: 'channel-post',
    title: 'On channel post',
    description: 'Triggered when a new post is made in a channel',
    icon: '✈️',
  },
  {
    id: 'edited-channel-post',
    title: 'On edited channel post',
    description: 'Triggered when a channel post is edited',
    icon: '✈️',
  },
  {
    id: 'edited-message',
    title: 'On edited message',
    description: 'Triggered when a message is edited',
    icon: '✈️',
  },
  {
    id: 'inline-query',
    title: 'On inline query',
    description: 'Triggered when an inline query is sent',
    icon: '✈️',
  },
  {
    id: 'message',
    title: 'On message',
    description: 'Triggered when a message is received',
    icon: '✈️',
  },
  {
    id: 'poll-change',
    title: 'On Poll Change',
    description: 'Triggered when a poll state changes',
    icon: '✈️',
  },
  {
    id: 'pre-checkout-query',
    title: 'On pre checkout query',
    description: 'Triggered before checkout is completed',
    icon: '✈️',
  },
  {
    id: 'shipping-query',
    title: 'On shipping query',
    description: 'Triggered when shipping information is requested',
    icon: '✈️',
  },
];

interface TriggerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrigger: (trigger: any) => void;
}

export default function TriggerPanel({ isOpen, onClose, onAddTrigger }: TriggerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAppSelection, setShowAppSelection] = useState(false);
  const [showTelegramTriggers, setShowTelegramTriggers] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const filteredTriggers = triggerTypes.filter(trigger =>
    trigger.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApps = appOptions.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTelegramTriggers = telegramTriggers.filter(trigger =>
    trigger.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trigger.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTriggerClick = (trigger: any) => {
    if (trigger.id === 'app-event') {
      setShowAppSelection(true);
      setSearchQuery('');
    } else {
      onAddTrigger(trigger);
    }
  };

  const handleAppSelect = (app: any) => {
    if (app.hasTriggers && app.id === 'telegram') {
      setSelectedApp(app);
      setShowTelegramTriggers(true);
      setSearchQuery('');
    } else {
      onAddTrigger({
        id: 'app-event',
        title: `${app.title} Event`,
        description: app.description,
        icon: app.icon,
        app: app.id
      });
      setShowAppSelection(false);
    }
  };

  const handleTelegramTriggerSelect = (trigger: any) => {
    onAddTrigger({
      id: 'app-event',
      title: trigger.title,
      description: trigger.description,
      icon: trigger.icon,
      app: 'telegram',
      triggerType: trigger.id
    });
    setShowTelegramTriggers(false);
    setShowAppSelection(false);
    setSelectedApp(null);
  };

  const handleBack = () => {
    if (showTelegramTriggers) {
      setShowTelegramTriggers(false);
      setSelectedApp(null);
      setSearchQuery('');
    } else if (showAppSelection) {
      setShowAppSelection(false);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setShowAppSelection(false);
    setShowTelegramTriggers(false);
    setSelectedApp(null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Trigger Panel */}
      <div
        className="fixed right-0 top-0 h-full w-[500px] z-50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98))',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {(showAppSelection || showTelegramTriggers) && (
                  <button
                    onClick={handleBack}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  {showTelegramTriggers && selectedApp && (
                    <div className="w-8 h-8 flex items-center justify-center text-xl">
                      {selectedApp.icon}
                    </div>
                  )}
                  <div>
                    <h2
                      className="text-xl font-bold mb-2"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        color: '#e0e8f0',
                      }}
                    >
                      {showTelegramTriggers 
                        ? selectedApp?.title 
                        : showAppSelection 
                        ? 'Choose an app' 
                        : 'What triggers this workflow?'}
                    </h2>
                    <p className="text-sm" style={{ color: '#8a9fb5' }}>
                      {showTelegramTriggers
                        ? `Triggers (${telegramTriggers.length})`
                        : showAppSelection 
                        ? 'Select the app that will trigger your workflow'
                        : 'A trigger is a step that starts your workflow'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-4">
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

          {/* Content Area - Trigger List / App Selection / Telegram Triggers */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {showTelegramTriggers ? (
                // Telegram Triggers List
                filteredTelegramTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    onClick={() => handleTelegramTriggerSelect(trigger)}
                    className="group p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 169, 224, 0.2), rgba(30, 30, 40, 0.7))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: 'rgba(37, 169, 224, 0.3)',
                        border: '1px solid rgba(37, 169, 224, 0.4)',
                      }}
                    >
                      {trigger.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="font-semibold"
                          style={{
                            color: '#e0e8f0',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '15px',
                          }}
                        >
                          {trigger.title}
                        </h3>
                        <span className="text-red-400 text-sm">⚡</span>
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{
                          color: '#a0b0c5',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {trigger.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : !showAppSelection ? (
                // Trigger List
                filteredTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    onClick={() => handleTriggerClick(trigger)}
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
                          background: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {trigger.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className="font-semibold"
                            style={{
                              color: '#e0e8f0',
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '15px',
                            }}
                          >
                            {trigger.title}
                          </h3>
                          {trigger.id === 'app-event' && (
                            <svg
                              className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{
                            color: '#8a9fb5',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {trigger.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // App Selection List
                filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppSelect(app)}
                    className="group p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${app.color}, rgba(30, 30, 40, 0.7))`,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {app.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className="font-semibold"
                            style={{
                              color: '#e0e8f0',
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '16px',
                            }}
                          >
                            {app.title}
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
                          className="text-xs leading-relaxed"
                          style={{
                            color: '#a0b0c5',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {app.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

