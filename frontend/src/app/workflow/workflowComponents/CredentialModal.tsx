'use client';

import { useState, useEffect } from 'react';

interface CredentialModalProps {
  isOpen: boolean;
  appName: string;
  appIcon: string;
  onClose: () => void;
  onCredentialSaved: (credential: any) => void;
}

export default function CredentialModal({ 
  isOpen, 
  appName, 
  appIcon, 
  onClose, 
  onCredentialSaved 
}: CredentialModalProps) {
  const [apiToken, setApiToken] = useState('');
  const [credentialName, setCredentialName] = useState('');
  const [hasCredential, setHasCredential] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<any[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check for existing credentials in localStorage
      const stored = localStorage.getItem(`credentials_${appName.toLowerCase()}`);
      if (stored) {
        const creds = JSON.parse(stored);
        setSavedCredentials(creds);
        setHasCredential(creds.length > 0);
      } else {
        setHasCredential(false);
        setSavedCredentials([]);
      }
    }
  }, [isOpen, appName]);

  const handleSave = () => {
    if (!apiToken.trim() || !credentialName.trim()) return;

    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newCredential = {
        id: Date.now().toString(),
        name: credentialName,
        token: apiToken,
        createdAt: new Date().toISOString(),
        app: appName.toLowerCase()
      };

      const updatedCredentials = [...savedCredentials, newCredential];
      localStorage.setItem(
        `credentials_${appName.toLowerCase()}`, 
        JSON.stringify(updatedCredentials)
      );

      setSavedCredentials(updatedCredentials);
      setHasCredential(true);
      setShowAddNew(false);
      setApiToken('');
      setCredentialName('');
      setIsSaving(false);
      
      onCredentialSaved(newCredential);
    }, 500);
  };

  const handleSelectCredential = (credential: any) => {
    onCredentialSaved(credential);
  };

  const handleClose = () => {
    setShowAddNew(false);
    setApiToken('');
    setCredentialName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)' }}
      onClick={handleClose}
    >
      <div
        className="p-6 rounded-lg max-w-lg w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))',
          border: '1px solid rgba(150, 180, 220, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
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
              {appName} Credentials
            </h3>
            <p className="text-sm" style={{ color: '#8a9fb5' }}>
              {hasCredential && !showAddNew 
                ? 'Select a credential or add new one' 
                : 'Connect your account'}
            </p>
          </div>
        </div>

        {/* Existing Credentials List */}
        {hasCredential && !showAddNew && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-3" style={{ color: '#8a9fb5' }}>
              Existing Credentials:
            </p>
            <div className="space-y-2 mb-4">
              {savedCredentials.map((cred) => (
                <div
                  key={cred.id}
                  onClick={() => handleSelectCredential(cred)}
                  className="p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(80, 200, 120, 0.2), rgba(60, 180, 100, 0.3))',
                    border: '1px solid rgba(80, 200, 120, 0.4)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#e0e8f0' }}>
                        {cred.name}
                      </p>
                      <p className="text-xs" style={{ color: '#8a9fb5' }}>
                        Token: •••••{cred.token.slice(-4)}
                      </p>
                    </div>
                    <svg className="w-5 h-5" style={{ color: '#90ee90' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Credential Form */}
        {(!hasCredential || showAddNew) && (
          <div className="space-y-4 mb-4">
            {appName === 'Telegram' && (
              <div className="p-3 rounded" style={{ background: 'rgba(100, 150, 200, 0.1)', border: '1px solid rgba(100, 150, 200, 0.2)' }}>
                <p className="text-xs" style={{ color: '#a0b0c5' }}>
                  📱 <strong>How to get your Telegram Bot Token:</strong><br />
                  1. Open Telegram and search for @BotFather<br />
                  2. Send /newbot and follow instructions<br />
                  3. Copy the API token provided<br />
                  4. Paste it below
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#e0e8f0' }}>
                Credential Name
              </label>
              <input
                type="text"
                value={credentialName}
                onChange={(e) => setCredentialName(e.target.value)}
                placeholder="e.g., My Bot Credential"
                className="w-full p-3 rounded outline-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(150, 180, 220, 0.3)',
                  color: '#e0e8f0',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#e0e8f0' }}>
                Bot API Token
              </label>
              <textarea
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Paste your bot API token here..."
                rows={3}
                className="w-full p-3 rounded outline-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(150, 180, 220, 0.3)',
                  color: '#e0e8f0',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {hasCredential && !showAddNew && (
            <button
              onClick={() => setShowAddNew(true)}
              className="px-4 py-2 rounded transition-all hover:scale-105"
              style={{
                background: 'rgba(100, 150, 200, 0.3)',
                border: '1px solid rgba(150, 180, 220, 0.3)',
                color: '#e0e8f0',
              }}
            >
              + Add New
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded transition-all hover:scale-105"
            style={{
              background: 'rgba(100, 100, 100, 0.3)',
              border: '1px solid rgba(150, 150, 150, 0.3)',
              color: '#e0e8f0',
            }}
          >
            Cancel
          </button>

          {(!hasCredential || showAddNew) && (
            <button
              onClick={handleSave}
              disabled={!apiToken.trim() || !credentialName.trim() || isSaving}
              className="px-4 py-2 rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
                border: '1px solid rgba(150, 180, 220, 0.4)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(80, 120, 180, 0.3)',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Credential'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

