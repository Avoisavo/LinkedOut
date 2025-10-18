"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../../../component/Header";
import NodePanel from "../../../component/NodePanel";
import TriggerPanel from "./workflowComponents/TriggerPanel";
import ExpressionEditor from "./workflowComponents/ExpressionEditor";
import ExecutionLogPanel from "./workflowComponents/ExecutionLogPanel";
import WorkflowNode from "./workflowComponents/WorkflowNode";
import CredentialModal from "./workflowComponents/CredentialModal";
import NodeTestPanel from "./workflowComponents/NodeTestPanel";
import AIAgentNode from "./workflowComponents/AIAgentNode";
import ModelSelectionModal from "./workflowComponents/ModelSelectionModal";
import IfNodeConfig from "./workflowComponents/IfNodeConfig";
import AvailBridgeNode from "./workflowComponents/AvailBridgeNode";
import AvailBridgeExecuteNode from "./workflowComponents/AvailBridgeExecuteNode";
import { useAvailExecutor } from "./workflowComponents/AvailExecutor";

interface SubNode {
  id: string;
  type: "model" | "memory" | "tool";
  title: string;
  icon: string;
  required?: boolean;
}

interface WorkflowNode {
  id: string;
  type: string;
  title: string;
  icon: string;
  position: { x: number; y: number };
  inputs?: { [key: string]: string };
  subNodes?: SubNode[];
}

interface ExecutionLog {
  nodeId: string;
  nodeTitle: string;
  timestamp: string;
  status: "success" | "error";
  input?: any;
  output?: any;
  error?: string;
}

export default function WorkflowPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showTriggerPanel, setShowTriggerPanel] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showExpressionEditor, setShowExpressionEditor] = useState(false);
  const [selectedInputField, setSelectedInputField] = useState<{
    nodeId: string;
    fieldName: string;
  } | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [pendingTrigger, setPendingTrigger] = useState<any>(null);
  const [savedCredential, setSavedCredential] = useState<any>(null);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedAINodeId, setSelectedAINodeId] = useState<string | null>(null);
  const [showIfConfig, setShowIfConfig] = useState(false);
  const [selectedIfNodeId, setSelectedIfNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMetaMaskReminder, setShowMetaMaskReminder] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Avail Executor
  const availExecutor = useAvailExecutor();

  // Make test function available in console for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Define test function in window scope
      (window as any).testNexusSDK = async () => {
        console.log("🧪 Testing Nexus SDK...");

        if (!(window as any).ethereum) {
          console.error("❌ No wallet provider found");
          return;
        }

        try {
          const { NexusSDK } = await import("@avail-project/nexus-core");
          const provider = (window as any).ethereum;

          // Connect wallet
          console.log("1️⃣ Connecting wallet...");
          const accounts = await provider.request({
            method: "eth_requestAccounts",
          });
          console.log("✅ Connected:", accounts[0]);

          // Initialize SDK
          console.log("2️⃣ Initializing Nexus SDK...");
          const sdk = new NexusSDK({
            network: "testnet",
            debug: true,
          });

          await sdk.initialize(provider);
          console.log("✅ SDK initialized");

          // Check available methods
          console.log("3️⃣ Available SDK methods:");
          console.log("  - bridge:", typeof sdk.bridge);
          console.log("  - bridgeAndExecute:", typeof sdk.bridgeAndExecute);
          console.log("  - isInitialized:", typeof sdk.isInitialized);

          // Log the SDK object structure
          console.log("4️⃣ SDK object keys:", Object.keys(sdk));
          console.log(
            "5️⃣ SDK prototype methods:",
            Object.getOwnPropertyNames(Object.getPrototypeOf(sdk))
          );

          return sdk;
        } catch (error) {
          console.error("❌ Test failed:", error);
        }
      };

      console.log("✅ testNexusSDK() function available in console");
      console.log("📝 Run: testNexusSDK()");
    }
  }, []);

  const handleAddNode = (nodeType: any) => {
    // Special handling for AI Agent node
    if (nodeType.id === "ai") {
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: "ai-agent",
        title: "AI Agent",
        icon: "🤖",
        position: { x: 300, y: nodes.length * 150 + 100 },
        inputs: {},
        subNodes: [],
      };
      setNodes([...nodes, newNode]);
      setIsPanelOpen(false);
      return;
    }

    // Handle Avail nodes
    if (nodeType.id === "avail-bridge") {
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: "avail-bridge",
        title: "Avail Bridge",
        icon: "🔗",
        position: { x: 400, y: nodes.length * 150 + 100 },
        inputs: {},
      };
      setNodes([...nodes, newNode]);
      setIsPanelOpen(false);
      return;
    }

    if (nodeType.id === "avail-bridge-execute") {
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: "avail-bridge-execute",
        title: "Avail Bridge & Execute",
        icon: "🚀",
        position: { x: 400, y: nodes.length * 150 + 100 },
        inputs: {},
      };
      setNodes([...nodes, newNode]);
      setIsPanelOpen(false);
      return;
    }

    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: nodeType.id,
      title: nodeType.title,
      icon: nodeType.icon,
      position: { x: 400, y: nodes.length * 150 + 100 },
      inputs: {},
    };
    setNodes([...nodes, newNode]);
    setIsPanelOpen(false);
  };

  const handleAddTrigger = (trigger: any) => {
    // Check if it's a Telegram trigger that needs credentials
    if (trigger.app === "telegram") {
      setPendingTrigger(trigger);
      setShowCredentialModal(true);
      setShowTriggerPanel(false);
    } else {
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: "trigger",
        title: trigger.title,
        icon: trigger.icon,
        position: { x: 400, y: 100 },
        inputs: {},
      };
      setNodes([newNode]);
      setShowTriggerPanel(false);
    }
  };

  const handleCredentialSaved = (credential: any) => {
    setSavedCredential(credential);
    setShowCredentialModal(false);

    // Show test panel for Telegram triggers
    if (pendingTrigger?.app === "telegram") {
      setShowTestPanel(true);
    } else {
      // For other apps, add directly to workflow
      addTriggerToWorkflow(credential);
    }
  };

  const addTriggerToWorkflow = (credential: any) => {
    if (pendingTrigger) {
      const newNode: WorkflowNode = {
        id: Date.now().toString(),
        type: "trigger",
        title: pendingTrigger.title,
        icon: pendingTrigger.icon,
        position: { x: 400, y: 100 },
        inputs: {
          credential: credential.name,
          credentialId: credential.id,
          triggerType: pendingTrigger.triggerType,
        },
      };
      setNodes([newNode]);
      setPendingTrigger(null);
      setSavedCredential(null);
    }
  };

  const handleTestComplete = () => {
    if (savedCredential) {
      addTriggerToWorkflow(savedCredential);
    }
    setShowTestPanel(false);
  };

  const handleTestCancel = () => {
    setShowTestPanel(false);
    setPendingTrigger(null);
    setSavedCredential(null);
  };

  const handleAddSubNode = (
    nodeId: string,
    type: "model" | "memory" | "tool"
  ) => {
    if (type === "model") {
      setSelectedAINodeId(nodeId);
      setShowModelSelection(true);
    } else {
      // For memory and tool, add placeholder for now
      const newSubNode: SubNode = {
        id: Date.now().toString(),
        type: type,
        title: type === "memory" ? "Memory" : "Tool",
        icon: type === "memory" ? "💾" : "🔧",
      };

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? { ...node, subNodes: [...(node.subNodes || []), newSubNode] }
            : node
        )
      );
    }
  };

  const handleRemoveSubNode = (nodeId: string, subNodeId: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              subNodes: (node.subNodes || []).filter(
                (subNode) => subNode.id !== subNodeId
              ),
            }
          : node
      )
    );
  };

  const handleSelectModel = (model: any) => {
    if (selectedAINodeId) {
      const newSubNode: SubNode = {
        id: Date.now().toString(),
        type: "model",
        title: model.title,
        icon: model.icon,
        required: true,
      };

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedAINodeId
            ? {
                ...node,
                subNodes: [
                  newSubNode,
                  ...(node.subNodes?.filter((n) => n.type !== "model") || []),
                ],
              }
            : node
        )
      );
    }
    setShowModelSelection(false);
    setSelectedAINodeId(null);
  };

  const handleConnectNext = (nodeId: string) => {
    setIsPanelOpen(true);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Max 200%
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Min 50%
  };

  const handleResetZoom = () => {
    setZoomLevel(1); // Reset to 100%
  };

  const handleFitToScreen = () => {
    // Calculate zoom to fit all nodes
    if (nodes.length === 0) {
      setZoomLevel(1);
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Find bounding box of all nodes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 300); // Approximate node width
      maxY = Math.max(maxY, node.position.y + 200); // Approximate node height
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = (canvasRect.width * 0.8) / contentWidth;
    const scaleY = (canvasRect.height * 0.8) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 2);

    setZoomLevel(Math.max(newZoom, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (
      (e.target as HTMLElement).tagName === "INPUT" ||
      (e.target as HTMLElement).tagName === "BUTTON"
    ) {
      return;
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingNode) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === draggingNode
          ? {
              ...node,
              position: {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y - canvasRect.top,
              },
            }
          : node
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  useEffect(() => {
    if (draggingNode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingNode, dragOffset]);

  const handleAddExpression = (nodeId: string, fieldName: string) => {
    setSelectedInputField({ nodeId, fieldName });
    setShowExpressionEditor(true);
  };

  const handleSaveExpression = (expression: string) => {
    if (!selectedInputField) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedInputField.nodeId
          ? {
              ...node,
              inputs: {
                ...node.inputs,
                [selectedInputField.fieldName]: expression,
              },
            }
          : node
      )
    );
    setShowExpressionEditor(false);
    setSelectedInputField(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
  };

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    if (nodeType === "if") {
      setSelectedIfNodeId(nodeId);
      setShowIfConfig(true);
    }
  };

  const handleUpdateNodeInputs = (nodeId: string, inputs: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === nodeId ? { ...node, inputs } : node))
    );
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setExecutionLogs([]);
    setShowLogPanel(true);

    // Check if workflow contains Avail nodes
    const hasAvailNodes = nodes.some(
      (node) =>
        node.type === "avail-bridge" || node.type === "avail-bridge-execute"
    );

    if (hasAvailNodes) {
      // Show MetaMask reminder for Avail workflows
      setShowMetaMaskReminder(true);

      // Use Avail Executor for workflows with Avail nodes
      const result = await availExecutor.executeWorkflow(
        "temp-workflow-id",
        nodes
      );

      setShowMetaMaskReminder(false);

      if (result.success) {
        setExecutionLogs(result.logs);
      } else {
        setExecutionLogs(result.logs);
        alert(`Workflow execution failed: ${result.error}`);
      }

      setIsExecuting(false);
      return;
    }

    // Standard execution for non-Avail workflows
    const logs: ExecutionLog[] = [];

    for (const node of nodes) {
      const timestamp = new Date().toLocaleTimeString();

      try {
        // Simulate execution with delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const input = node.inputs || {};
        const output = {
          success: true,
          data: `Processed by ${node.title}`,
          timestamp: new Date().toISOString(),
        };

        logs.push({
          nodeId: node.id,
          nodeTitle: node.title,
          timestamp,
          status: "success",
          input,
          output,
        });
      } catch (error) {
        logs.push({
          nodeId: node.id,
          nodeTitle: node.title,
          timestamp,
          status: "error",
          input: node.inputs || {},
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      setExecutionLogs([...logs]);
    }

    setIsExecuting(false);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#1e1e24",
      }}
    >
      {/* Header */}
      <Header
        title="My Workflow"
        showBackButton={true}
        walletConnected={availExecutor.walletConnected}
        walletAddress={availExecutor.walletAddress}
        onConnectWallet={availExecutor.connectWallet}
        onDisconnectWallet={availExecutor.disconnectWallet}
      />

      {/* MetaMask Approval Reminder Banner */}
      {showMetaMaskReminder && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-2xl animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 140, 0, 0.95), rgba(255, 100, 0, 0.95))",
            border: "2px solid rgba(255, 200, 100, 0.6)",
            boxShadow: "0 8px 32px rgba(255, 140, 0, 0.5)",
            maxWidth: "500px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <p
                className="font-bold text-white mb-1"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "16px",
                }}
              >
                ⚠️ Check Your MetaMask
              </p>
              <p className="text-sm text-white/90">
                Please approve the pending transaction(s) in your MetaMask
                extension
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Canvas */}
      <div className="relative z-10" style={{ height: "calc(100vh - 64px)" }}>
        {/* Zoom Controls */}
        <div
          className="absolute bottom-24 right-8 z-30 flex flex-col gap-2"
          style={{
            background:
              "linear-gradient(135deg, rgba(30, 30, 36, 0.95), rgba(40, 40, 48, 0.95))",
            border: "1px solid rgba(150, 180, 220, 0.4)",
            borderRadius: "12px",
            padding: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(15px)",
          }}
        >
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(100, 150, 200, 0.3)",
              border: "1px solid rgba(150, 180, 220, 0.3)",
              color: "#e0e8f0",
            }}
            title="Zoom In"
          >
            <svg
              className="w-5 h-5"
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

          <div
            className="text-center text-xs font-semibold px-2 py-1"
            style={{ color: "#8a9fb5" }}
          >
            {Math.round(zoomLevel * 100)}%
          </div>

          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(100, 150, 200, 0.3)",
              border: "1px solid rgba(150, 180, 220, 0.3)",
              color: "#e0e8f0",
            }}
            title="Zoom Out"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <div
            className="w-full h-px my-1"
            style={{ background: "rgba(150, 180, 220, 0.3)" }}
          />

          <button
            onClick={handleResetZoom}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(100, 150, 200, 0.3)",
              border: "1px solid rgba(150, 180, 220, 0.3)",
              color: "#e0e8f0",
            }}
            title="Reset Zoom (100%)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>

          <button
            onClick={handleFitToScreen}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(100, 150, 200, 0.3)",
              border: "1px solid rgba(150, 180, 220, 0.3)",
              color: "#e0e8f0",
            }}
            title="Fit to Screen"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        <div
          ref={canvasRef}
          className="w-full h-full relative overflow-auto"
          style={{
            background: "#1e1e24",
            backgroundImage: `
              linear-gradient(rgba(100, 150, 200, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 150, 200, 0.04) 1px, transparent 1px),
              linear-gradient(rgba(100, 150, 200, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 150, 200, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px, ${
              20 * zoomLevel
            }px ${20 * zoomLevel}px, ${100 * zoomLevel}px ${
              100 * zoomLevel
            }px, ${100 * zoomLevel}px ${100 * zoomLevel}px`,
            backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
          }}
        >
          {/* Zoomable Content Container */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              transition: "transform 0.2s ease-out",
            }}
          >
            {/* Initial Add Trigger Node Button */}
            {nodes.length === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={() => setShowTriggerPanel(true)}
                  className="px-8 py-6 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 100, 100, 0.5), rgba(255, 80, 80, 0.6))",
                    border: "1px solid rgba(255, 120, 120, 0.4)",
                    color: "#ffffff",
                    boxShadow: "0 8px 24px rgba(255, 80, 80, 0.3)",
                    backdropFilter: "blur(15px)",
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8"
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
                    <span className="text-lg">Add a Trigger Node</span>
                  </div>
                </button>
              </div>
            )}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {nodes.map((node, index) => {
                if (index < nodes.length - 1) {
                  const nextNode = nodes[index + 1];
                  return (
                    <line
                      key={`line-${node.id}`}
                      x1={node.position.x + 100}
                      y1={node.position.y + 60}
                      x2={nextNode.position.x + 100}
                      y2={nextNode.position.y}
                      stroke="rgba(138, 180, 248, 0.4)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                }
                return null;
              })}
            </svg>

            {/* Workflow Nodes */}
            {nodes.map((node, index) => {
              if (node.type === "ai-agent") {
                return (
                  <AIAgentNode
                    key={node.id}
                    node={node}
                    onMouseDown={handleMouseDown}
                    onDelete={handleDeleteNode}
                    onAddSubNode={handleAddSubNode}
                    onRemoveSubNode={handleRemoveSubNode}
                    onConnectNext={handleConnectNext}
                  />
                );
              } else if (node.type === "avail-bridge") {
                return (
                  <AvailBridgeNode
                    key={node.id}
                    node={node}
                    isLast={index === nodes.length - 1}
                    onMouseDown={handleMouseDown}
                    onDelete={handleDeleteNode}
                    onUpdateInputs={handleUpdateNodeInputs}
                    onAddNode={() => setIsPanelOpen(true)}
                  />
                );
              } else if (node.type === "avail-bridge-execute") {
                return (
                  <AvailBridgeExecuteNode
                    key={node.id}
                    node={node}
                    isLast={index === nodes.length - 1}
                    onMouseDown={handleMouseDown}
                    onDelete={handleDeleteNode}
                    onUpdateInputs={handleUpdateNodeInputs}
                    onAddNode={() => setIsPanelOpen(true)}
                  />
                );
              } else {
                return (
                  <WorkflowNode
                    key={node.id}
                    node={node}
                    isLast={index === nodes.length - 1}
                    onMouseDown={handleMouseDown}
                    onDelete={handleDeleteNode}
                    onAddExpression={handleAddExpression}
                    onAddNode={() => setIsPanelOpen(true)}
                    onNodeClick={() => handleNodeClick(node.id, node.type)}
                  />
                );
              }
            })}

            {/* Bottom Action Buttons */}
            {nodes.length > 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <button
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    background: isExecuting
                      ? "linear-gradient(135deg, rgba(100, 100, 100, 0.5), rgba(80, 80, 80, 0.6))"
                      : "linear-gradient(135deg, rgba(255, 100, 100, 0.5), rgba(255, 80, 80, 0.6))",
                    border: "1px solid rgba(255, 120, 120, 0.4)",
                    color: "#ffffff",
                    boxShadow: "0 8px 24px rgba(255, 80, 80, 0.3)",
                    letterSpacing: "0.1em",
                    opacity: isExecuting ? 0.6 : 1,
                  }}
                >
                  {isExecuting ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Executing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Execute Workflow
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowLogPanel(!showLogPanel)}
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    background:
                      "linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))",
                    border: "1px solid rgba(150, 180, 220, 0.4)",
                    color: "#ffffff",
                    boxShadow: "0 8px 24px rgba(80, 120, 180, 0.3)",
                    letterSpacing: "0.1em",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {showLogPanel ? "Hide" : "Show"} Execution Log
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trigger Selection Panel */}
      <TriggerPanel
        isOpen={showTriggerPanel}
        onClose={() => setShowTriggerPanel(false)}
        onAddTrigger={handleAddTrigger}
      />

      {/* Node Panel Sidebar */}
      <NodePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddNode={handleAddNode}
      />

      {/* Expression Editor Modal */}
      <ExpressionEditor
        isOpen={showExpressionEditor}
        onClose={() => setShowExpressionEditor(false)}
        onSave={handleSaveExpression}
      />

      {/* Execution Log Panel */}
      <ExecutionLogPanel
        isOpen={showLogPanel}
        onClose={() => setShowLogPanel(false)}
        logs={executionLogs}
      />

      {/* Credential Modal */}
      <CredentialModal
        isOpen={showCredentialModal}
        appName={pendingTrigger?.app === "telegram" ? "Telegram" : "App"}
        appIcon={pendingTrigger?.icon || "✈️"}
        onClose={() => {
          setShowCredentialModal(false);
          setPendingTrigger(null);
        }}
        onCredentialSaved={handleCredentialSaved}
      />

      {/* Node Test Panel */}
      <NodeTestPanel
        isOpen={showTestPanel}
        appName={pendingTrigger?.app === "telegram" ? "Telegram" : "App"}
        appIcon={pendingTrigger?.icon || "✈️"}
        triggerType={pendingTrigger?.title || "Unknown Trigger"}
        credential={savedCredential}
        onComplete={handleTestComplete}
        onCancel={handleTestCancel}
      />

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={showModelSelection}
        onClose={() => {
          setShowModelSelection(false);
          setSelectedAINodeId(null);
        }}
        onSelectModel={handleSelectModel}
      />

      {/* If Node Configuration */}
      <IfNodeConfig
        isOpen={showIfConfig}
        onClose={() => {
          setShowIfConfig(false);
          setSelectedIfNodeId(null);
        }}
        nodeData={nodes.find((n) => n.id === selectedIfNodeId)}
      />

      {/* Fonts */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap");
      `}</style>
    </div>
  );
}
