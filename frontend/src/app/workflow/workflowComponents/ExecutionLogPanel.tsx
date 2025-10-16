'use client';

interface ExecutionLog {
  nodeId: string;
  nodeTitle: string;
  timestamp: string;
  status: 'success' | 'error';
  input?: any;
  output?: any;
  error?: string;
}

interface ExecutionLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExecutionLog[];
}

export default function ExecutionLogPanel({ isOpen, onClose, logs }: ExecutionLogPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed right-0 top-16 bottom-0 w-96 z-40 overflow-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))',
        borderLeft: '1px solid rgba(150, 180, 220, 0.4)',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(15px)',
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: '#e0e8f0' }}>
            Execution Log
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

        {logs.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#8a9fb5' }}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No execution logs yet.</p>
            <p className="text-sm mt-2">Execute the workflow to see logs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{
                  background: log.status === 'success'
                    ? 'linear-gradient(135deg, rgba(80, 200, 120, 0.2), rgba(60, 180, 100, 0.3))'
                    : 'linear-gradient(135deg, rgba(255, 100, 100, 0.2), rgba(255, 80, 80, 0.3))',
                  border: log.status === 'success'
                    ? '1px solid rgba(80, 200, 120, 0.4)'
                    : '1px solid rgba(255, 120, 120, 0.4)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm" style={{ color: '#e0e8f0' }}>
                    {log.nodeTitle}
                  </h3>
                  <span className="text-xs" style={{ color: '#8a9fb5' }}>
                    {log.timestamp}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      background: log.status === 'success'
                        ? 'rgba(80, 200, 120, 0.3)'
                        : 'rgba(255, 100, 100, 0.3)',
                      color: log.status === 'success' ? '#90ee90' : '#ff6b6b',
                    }}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>

                {log.input && Object.keys(log.input).length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#8a9fb5' }}>
                      Input:
                    </p>
                    <pre
                      className="text-xs p-2 rounded overflow-auto"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#e0e8f0',
                        maxHeight: '100px',
                      }}
                    >
                      {JSON.stringify(log.input, null, 2)}
                    </pre>
                  </div>
                )}

                {log.output && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#8a9fb5' }}>
                      Output:
                    </p>
                    <pre
                      className="text-xs p-2 rounded overflow-auto"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#e0e8f0',
                        maxHeight: '100px',
                      }}
                    >
                      {JSON.stringify(log.output, null, 2)}
                    </pre>
                  </div>
                )}

                {log.error && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#ff6b6b' }}>
                      Error:
                    </p>
                    <p className="text-xs" style={{ color: '#ff8888' }}>
                      {log.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

