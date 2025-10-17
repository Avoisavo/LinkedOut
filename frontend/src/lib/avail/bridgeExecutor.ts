import { getNexusClient, getChainConfig } from "./nexusClient";

export interface BridgeParams {
  sourceChain: string;
  targetChain: string;
  token: string;
  amount: string;
  recipientAddress?: string;
}

export interface BridgeAndExecuteParams extends BridgeParams {
  executeContract: string;
  executeFunction: string;
  executeFunctionParams?: any[];
  executeValue?: string;
}

export interface BridgeResult {
  success: boolean;
  txHash?: string;
  error?: string;
  message?: string;
}

/**
 * Execute a simple bridge operation
 */
export async function executeBridge(
  params: BridgeParams
): Promise<BridgeResult> {
  try {
    const nexusClient = getNexusClient();
    const sourceChainConfig = getChainConfig(params.sourceChain);
    const targetChainConfig = getChainConfig(params.targetChain);

    console.log("🌉 Initiating bridge:", {
      from: sourceChainConfig.name,
      to: targetChainConfig.name,
      token: params.token,
      amount: params.amount,
    });

    // Use Nexus SDK to execute the bridge
    const bridgeResult = await nexusClient.bridge({
      sourceChainId: sourceChainConfig.chainId,
      destinationChainId: targetChainConfig.chainId,
      tokenSymbol: params.token,
      amount: params.amount,
    });

    console.log("✅ Bridge transaction submitted:", bridgeResult);

    // Validate the result
    if (!bridgeResult || !bridgeResult.hash) {
      throw new Error(
        "Bridge transaction failed: No transaction hash returned. The transaction may have been rejected."
      );
    }

    return {
      success: true,
      txHash: bridgeResult.hash,
      message: `Successfully bridged ${params.amount} ${params.token} from ${sourceChainConfig.name} to ${targetChainConfig.name}. Tx: ${bridgeResult.hash}`,
    };
  } catch (error) {
    console.error("❌ Bridge execution failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Bridge operation failed",
    };
  }
}

/**
 * Execute "Bridge & Execute" operation
 * This bridges tokens and executes a contract call on the destination chain
 */
export async function executeBridgeAndExecute(
  params: BridgeAndExecuteParams
): Promise<BridgeResult> {
  try {
    const nexusClient = getNexusClient();
    const sourceChainConfig = getChainConfig(params.sourceChain);
    const targetChainConfig = getChainConfig(params.targetChain);

    console.log("🚀 Initiating Bridge & Execute:", {
      from: sourceChainConfig.name,
      to: targetChainConfig.name,
      token: params.token,
      amount: params.amount,
      contract: params.executeContract,
      function: params.executeFunction,
    });

    // Create calldata for the execute step
    const calldata = encodeFunctionCall(
      params.executeFunction,
      params.executeFunctionParams || []
    );

    // Use Nexus SDK bridgeAndExecute
    const result = await nexusClient.bridgeAndExecute({
      sourceChainId: sourceChainConfig.chainId,
      destinationChainId: targetChainConfig.chainId,
      tokenSymbol: params.token,
      amount: params.amount,
      executeParams: {
        contractAddress: params.executeContract as `0x${string}`,
        calldata: calldata as `0x${string}`,
        gasLimit: 500000, // Default gas limit
      },
    });

    console.log("✅ Bridge & Execute transaction submitted:", result);

    // Validate the result
    if (!result || !result.hash) {
      throw new Error(
        "Bridge & Execute transaction failed: No transaction hash returned. The transaction may have been rejected."
      );
    }

    return {
      success: true,
      txHash: result.hash,
      message: `Successfully bridged ${params.amount} ${params.token} and executed ${params.executeFunction} on ${targetChainConfig.name}. Tx: ${result.hash}`,
    };
  } catch (error) {
    console.error("❌ Bridge & Execute failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Bridge & Execute operation failed",
    };
  }
}

/**
 * Encode function call for contract execution
 * This is a simplified version - you may need ethers.js or viem for proper encoding
 */
function encodeFunctionCall(functionName: string, params: any[]): string {
  // In a real implementation, use ethers.Interface or viem's encodeFunctionData
  // For now, this is a placeholder
  console.log(`Encoding function call: ${functionName}`, params);

  // This should be properly implemented based on the contract ABI
  // Example with ethers.js:
  // const iface = new ethers.Interface(['function deposit(uint256 amount)']);
  // return iface.encodeFunctionData('deposit', [amount]);

  return "0x"; // Placeholder
}

/**
 * Wait for bridge confirmation on destination chain
 */
export async function waitForBridgeCompletion(
  txHash: string,
  targetChain: string,
  timeoutMs: number = 300000 // 5 minutes default
): Promise<{ completed: boolean; error?: string }> {
  try {
    const nexusClient = getNexusClient();
    const targetChainConfig = getChainConfig(targetChain);

    console.log(
      `⏳ Waiting for bridge completion on ${targetChainConfig.name}...`
    );

    // Monitor the bridge transaction status
    // This would use Nexus SDK's monitoring capabilities
    const result = await nexusClient.waitForBridgeCompletion(txHash, {
      targetChainId: targetChainConfig.chainId,
      timeout: timeoutMs,
    });

    console.log("✅ Bridge completed:", result);

    return { completed: true };
  } catch (error) {
    console.error("❌ Bridge monitoring failed:", error);
    return {
      completed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get estimated bridge time
 */
export async function estimateBridgeTime(
  sourceChain: string,
  targetChain: string
): Promise<number> {
  try {
    const nexusClient = getNexusClient();
    const sourceConfig = getChainConfig(sourceChain);
    const targetConfig = getChainConfig(targetChain);

    const estimate = await nexusClient.estimateBridgeTime({
      sourceChainId: sourceConfig.chainId,
      targetChainId: targetConfig.chainId,
    });

    return estimate.seconds || 300; // Default 5 minutes
  } catch (error) {
    console.error("Failed to estimate bridge time:", error);
    return 300; // Default 5 minutes
  }
}
