"use client";

import { useState } from "react";
import { getSupportedChainNames } from "../../../lib/avail/nexusClient";

interface AvailBridgeExecuteNodeProps {
  node: {
    id: string;
    type: string;
    title: string;
    icon: string;
    position: { x: number; y: number };
    inputs?: {
      sourceChain?: string;
      targetChain?: string;
      token?: string;
      amount?: string;
      executeContract?: string;
      executeFunction?: string;
      executeFunctionParams?: string;
      executeValue?: string;
    };
  };
  isLast: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdateInputs: (nodeId: string, inputs: any) => void;
  onAddNode: () => void;
}

export default function AvailBridgeExecuteNode({
  node,
  isLast,
  onMouseDown,
  onDelete,
  onUpdateInputs,
  onAddNode,
}: AvailBridgeExecuteNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const supportedChains = getSupportedChainNames();

  const handleInputChange = (field: string, value: string) => {
    onUpdateInputs(node.id, {
      ...node.inputs,
      [field]: value,
    });
  };

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
        className="px-6 py-4 rounded-lg min-w-[320px] cursor-move transition-all hover:scale-105 relative group"
        style={{
          background:
            "linear-gradient(135deg, rgba(150, 100, 200, 0.4), rgba(130, 80, 180, 0.5))",
          border: "1px solid rgba(180, 150, 220, 0.4)",
          backdropFilter: "blur(15px)",
          boxShadow: `
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 4px 12px rgba(130, 80, 180, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.2),
            0 0 20px rgba(150, 100, 200, 0.15)
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
            background:
              "linear-gradient(135deg, rgba(255, 80, 80, 0.9), rgba(220, 60, 60, 1))",
            border: "1px solid rgba(255, 120, 120, 0.6)",
            boxShadow: "0 2px 8px rgba(255, 80, 80, 0.4)",
            color: "#ffffff",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {node.icon}
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{
                color: "#e0e8f0",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {node.title}
            </p>
            <p className="text-xs" style={{ color: "#8a9fb5" }}>
              Bridge & Execute on destination
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#e0e8f0" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Configuration Fields */}
        {isExpanded && (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* Bridge Section */}
            <div className="pb-3 border-b border-white/10">
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "#e0e8f0" }}
              >
                🌉 Bridge Configuration
              </p>

              <div className="space-y-2">
                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Source Chain
                  </label>
                  <select
                    value={node.inputs?.sourceChain || ""}
                    onChange={(e) =>
                      handleInputChange("sourceChain", e.target.value)
                    }
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  >
                    <option value="">Select chain...</option>
                    {supportedChains.map((chain) => (
                      <option key={chain} value={chain}>
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Target Chain
                  </label>
                  <select
                    value={node.inputs?.targetChain || ""}
                    onChange={(e) =>
                      handleInputChange("targetChain", e.target.value)
                    }
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  >
                    <option value="">Select chain...</option>
                    {supportedChains.map((chain) => (
                      <option key={chain} value={chain}>
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Token
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.token || ""}
                    onChange={(e) => handleInputChange("token", e.target.value)}
                    placeholder="e.g., USDC, ETH"
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Amount
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.amount || ""}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    placeholder="e.g., 100"
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Execute Section */}
            <div>
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "#e0e8f0" }}
              >
                ⚡ Execute Configuration
              </p>

              <div className="space-y-2">
                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Contract Address
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.executeContract || ""}
                    onChange={(e) =>
                      handleInputChange("executeContract", e.target.value)
                    }
                    placeholder="0x..."
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Function Name
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.executeFunction || ""}
                    onChange={(e) =>
                      handleInputChange("executeFunction", e.target.value)
                    }
                    placeholder="e.g., deposit, stake"
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Function Parameters (JSON)
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.executeFunctionParams || ""}
                    onChange={(e) =>
                      handleInputChange("executeFunctionParams", e.target.value)
                    }
                    placeholder='e.g., ["100"]'
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#8a9fb5" }}
                  >
                    Value (ETH, Optional)
                  </label>
                  <input
                    type="text"
                    value={node.inputs?.executeValue || ""}
                    onChange={(e) =>
                      handleInputChange("executeValue", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-2 py-1.5 rounded text-xs mt-1"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(180, 150, 220, 0.3)",
                      color: "#e0e8f0",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary when collapsed */}
        {!isExpanded &&
          node.inputs?.sourceChain &&
          node.inputs?.targetChain && (
            <div className="mt-2 text-xs" style={{ color: "#8a9fb5" }}>
              Bridge {node.inputs.amount} {node.inputs.token} → Execute{" "}
              {node.inputs.executeFunction || "function"}()
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
              background:
                "linear-gradient(135deg, rgba(150, 100, 200, 0.5), rgba(130, 80, 180, 0.6))",
              border: "1px solid rgba(180, 150, 220, 0.4)",
              boxShadow: "0 4px 12px rgba(130, 80, 180, 0.3)",
            }}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
