'use client';

interface WorkflowNodeProps {
  node: {
    id: string;
    type: string;
    title: string;
    icon: string;
    position: { x: number; y: number };
    inputs?: { [key: string]: string };
  };
  isLast: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddExpression: (nodeId: string, fieldName: string) => void;
  onAddNode: () => void;
  onNodeClick?: () => void;
}

export default function WorkflowNode({
  node,
  isLast,
  onMouseDown,
  onDelete,
  onAddExpression,
  onAddNode,
  onNodeClick
}: WorkflowNodeProps) {
  return (
    <div
      className="absolute"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      <div
        className="px-6 py-4 rounded-lg min-w-[280px] cursor-move transition-all hover:scale-105 relative group"
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

        <div className="flex items-center gap-3 mb-3">
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
              {node.type === 'trigger' ? 'Workflow trigger' : 'Action node'}
            </p>
          </div>
        </div>

        {/* Node Input Fields */}
        {node.type !== 'trigger' && node.type !== 'if' && node.type !== 'filter' && node.type !== 'loop' && node.type !== 'merge' && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-xs" style={{ color: '#8a9fb5' }}>Input Data</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={node.inputs?.data || ''}
                  readOnly
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddExpression(node.id, 'data');
                  }}
                  placeholder="Click to add expression..."
                  className="flex-1 px-2 py-1 rounded text-xs cursor-pointer"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(150, 180, 220, 0.3)',
                    color: '#e0e8f0',
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddExpression(node.id, 'data');
                  }}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(100, 150, 200, 0.3)',
                    border: '1px solid rgba(150, 180, 220, 0.3)',
                    color: '#e0e8f0',
                  }}
                >
                  + Expression
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configure Button for Flow Control Nodes */}
        {(node.type === 'if' || node.type === 'filter' || node.type === 'loop' || node.type === 'merge') && onNodeClick && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick();
              }}
              className="w-full px-3 py-2 rounded text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.4), rgba(80, 120, 180, 0.5))',
                border: '1px solid rgba(150, 180, 220, 0.4)',
                color: '#e0e8f0',
              }}
            >
              Configure {node.title}
            </button>
          </div>
        )}
      </div>

      {/* Add Node Button */}
      {isLast && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onAddNode}
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
  );
}

