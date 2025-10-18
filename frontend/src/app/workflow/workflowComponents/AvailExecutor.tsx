"use client";

import { useState, useEffect } from "react";
import {
  initializeNexusClient,
  isNexusClientInitialized,
  getNexusClient,
} from "../../../lib/avail/nexusClient";
import {
  executeBridge,
  executeBridgeAndExecute,
} from "../../../lib/avail/bridgeExecutor";
import {
  logExecutionStart,
  logExecutionSuccess,
  logExecutionError,
  addExecutionLogEntry,
} from "../../../lib/api/executionLogger";

interface ExecuteResult {
  success: boolean;
  logs: any[];
  error?: string;
  txHashes?: string[];
}

/**
 * AvailExecutor - Handles client-side execution of workflows with Avail nodes
 */
export default function AvailExecutor() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check wallet connection on mount (but don't initialize SDK yet)
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          console.log("ℹ️ Wallet already connected:", accounts[0]);
          console.log("ℹ️ SDK will initialize when you execute a workflow");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return false;
    }

    try {
      const provider = (window as any).ethereum;

      // Request wallet connection
      console.log("📱 Requesting wallet connection...");
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        console.log("✅ Wallet connected:", accounts[0]);
        console.log("ℹ️ SDK will initialize when you execute a workflow");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect wallet";
      alert(`Wallet connection failed: ${errorMessage}`);
      return false;
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);

    // Deinitialize Nexus SDK if it exists
    if (isNexusClientInitialized()) {
      try {
        const nexusClient = getNexusClient();
        if (nexusClient && typeof nexusClient.deinit === "function") {
          nexusClient.deinit();
        }
      } catch (error) {
        console.log("SDK cleanup:", error);
      }
    }

    console.log("👋 Wallet disconnected");
  };

  return {
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    executeWorkflow: async (
      workflowId: string,
      nodes: any[]
    ): Promise<ExecuteResult> => {
      return executeAvailWorkflow(
        workflowId,
        nodes,
        walletConnected,
        connectWallet
      );
    },
  };
}

/**
 * Execute a workflow containing Avail nodes
 */
export async function executeAvailWorkflow(
  workflowId: string,
  nodes: any[],
  walletConnected: boolean,
  connectWallet: () => Promise<boolean>
): Promise<ExecuteResult> {
  const logs: any[] = [];
  const txHashes: string[] = [];

  try {
    // Ensure wallet is connected and Nexus SDK is initialized
    if (!walletConnected || !isNexusClientInitialized()) {
      console.log("🔌 Connecting wallet and initializing Nexus SDK...");
      const connected = await connectWallet();
      if (!connected) {
        throw new Error(
          "Wallet connection required to execute Avail workflow. Please connect your wallet and try again."
        );
      }
    }

    // Double-check Nexus SDK is initialized
    if (!isNexusClientInitialized()) {
      console.log("🔧 Initializing Nexus SDK...");
      if (typeof window !== "undefined" && (window as any).ethereum) {
        await initializeNexusClient((window as any).ethereum);
      } else {
        throw new Error("No wallet provider found. Please install MetaMask.");
      }
    }

    console.log("✅ Nexus SDK ready for execution");

    // Start execution logging
    let executionId: string | undefined;
    try {
      const execution = await logExecutionStart({ workflowId });
      executionId = execution.id;
    } catch (error) {
      console.warn("Failed to log execution start:", error);
    }

    // Execute each node
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const timestamp = new Date().toLocaleTimeString();

      console.log(`Executing node ${i + 1}/${nodes.length}: ${node.title}`);

      try {
        let result;

        // Handle different node types
        switch (node.type) {
          case "avail-bridge":
            result = await executeAvailBridgeNode(node);
            break;

          case "avail-bridge-execute":
            result = await executeAvailBridgeExecuteNode(node);
            break;

          case "trigger":
            // Trigger nodes don't execute anything
            result = { success: true, message: "Workflow triggered" };
            break;

          default:
            // For non-Avail nodes, simulate execution
            await new Promise((resolve) => setTimeout(resolve, 500));
            result = {
              success: true,
              message: `Executed ${node.title}`,
            };
        }

        // Add to logs
        const logEntry = {
          nodeId: node.id,
          nodeTitle: node.title,
          timestamp,
          status: "success" as const,
          input: node.inputs || {},
          output: result,
          txHash: result.txHash,
        };

        logs.push(logEntry);

        if (result.txHash) {
          txHashes.push(result.txHash);
        }

        // Update execution log in backend
        if (executionId) {
          try {
            await addExecutionLogEntry(
              executionId,
              logs.slice(0, -1),
              logEntry
            );
          } catch (error) {
            console.warn("Failed to update execution log:", error);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        const logEntry = {
          nodeId: node.id,
          nodeTitle: node.title,
          timestamp,
          status: "error" as const,
          input: node.inputs || {},
          error: errorMessage,
        };

        logs.push(logEntry);

        // Log execution error
        if (executionId) {
          try {
            await logExecutionError({
              executionId,
              logs,
              errorMessage,
            });
          } catch (err) {
            console.warn("Failed to log execution error:", err);
          }
        }

        throw error;
      }
    }

    // Log successful completion
    if (executionId) {
      try {
        await logExecutionSuccess({
          executionId,
          logs,
          txHashes,
        });
      } catch (error) {
        console.warn("Failed to log execution success:", error);
      }
    }

    return {
      success: true,
      logs,
      txHashes,
    };
  } catch (error) {
    console.error("Workflow execution failed:", error);
    return {
      success: false,
      logs,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute an Avail Bridge node
 */
async function executeAvailBridgeNode(node: any) {
  const { sourceChain, targetChain, token, amount, recipientAddress } =
    node.inputs || {};

  if (!sourceChain || !targetChain || !token || !amount) {
    throw new Error("Missing required bridge parameters");
  }

  console.log("🌉 Executing Avail Bridge:", {
    sourceChain,
    targetChain,
    token,
    amount,
  });

  const result = await executeBridge({
    sourceChain,
    targetChain,
    token,
    amount,
    recipientAddress,
  });

  if (!result.success) {
    throw new Error(result.error || "Bridge execution failed");
  }

  return result;
}

/**
 * Execute an Avail Bridge & Execute node
 */
async function executeAvailBridgeExecuteNode(node: any) {
  const {
    sourceChain,
    targetChain,
    token,
    amount,
    executeContract,
    executeFunction,
    executeFunctionParams,
    executeValue,
  } = node.inputs || {};

  if (
    !sourceChain ||
    !targetChain ||
    !token ||
    !amount ||
    !executeContract ||
    !executeFunction
  ) {
    throw new Error("Missing required bridge & execute parameters");
  }

  console.log("🚀 Executing Avail Bridge & Execute:", {
    sourceChain,
    targetChain,
    token,
    amount,
    executeContract,
    executeFunction,
  });

  // Parse function parameters if provided
  let parsedParams;
  try {
    parsedParams = executeFunctionParams
      ? JSON.parse(executeFunctionParams)
      : [];
  } catch (error) {
    throw new Error("Invalid function parameters JSON");
  }

  const result = await executeBridgeAndExecute({
    sourceChain,
    targetChain,
    token,
    amount,
    executeContract,
    executeFunction,
    executeFunctionParams: parsedParams,
    executeValue,
  });

  if (!result.success) {
    throw new Error(result.error || "Bridge & Execute failed");
  }

  return result;
}

/**
 * Hook to use Avail Executor in components
 */
export function useAvailExecutor() {
  return AvailExecutor();
}
