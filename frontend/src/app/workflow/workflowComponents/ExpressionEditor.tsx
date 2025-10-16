'use client';

interface ExpressionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expression: string) => void;
}

export default function ExpressionEditor({ isOpen, onClose, onSave }: ExpressionEditorProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    const input = document.getElementById('expression-input') as HTMLTextAreaElement;
    onSave(input.value);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="p-6 rounded-lg max-w-md w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))',
          border: '1px solid rgba(150, 180, 220, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#e0e8f0' }}>
          Add Expression
        </h3>
        <p className="text-sm mb-4" style={{ color: '#8a9fb5' }}>
          Map data from previous nodes. Example: <code style={{ background: 'rgba(100, 150, 200, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>{'{{node1.output.data}}'}</code>
        </p>
        <textarea
          className="w-full p-3 rounded mb-4"
          rows={4}
          placeholder="Enter expression or value..."
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(150, 180, 220, 0.3)',
            color: '#e0e8f0',
            fontFamily: 'monospace',
          }}
          id="expression-input"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded transition-all hover:scale-105"
            style={{
              background: 'rgba(100, 100, 100, 0.3)',
              border: '1px solid rgba(150, 150, 150, 0.3)',
              color: '#e0e8f0',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
              border: '1px solid rgba(150, 180, 220, 0.4)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(80, 120, 180, 0.3)',
            }}
          >
            Save Expression
          </button>
        </div>
      </div>
    </div>
  );
}

