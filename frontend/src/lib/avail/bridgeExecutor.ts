import { getNexusClient, getChainConfig, ChainConfig } from "./nexusClient";

/**
 * Ensure a network is added to MetaMask before bridging
 */
async function ensureNetworkAdded(chainConfig: ChainConfig): Promise<void> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return;
  }

  const provider = (window as any).ethereum;
  const chainIdHex = `0x${chainConfig.chainId.toString(16)}`;

  try {
    // Try to switch to the network first (if it exists)
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    console.log(`✅ Switched to ${chainConfig.name}`);
  } catch (switchError: any) {
    // If network doesn't exist (error code 4902), add it
    if (switchError.code === 4902) {
      try {
        console.log(`➕ Adding ${chainConfig.name} to MetaMask...`);

        // Get proper network configuration based on chain
        const networkConfig = getNetworkConfig(chainConfig);

        await provider.request({
          method: "wallet_addEthereumChain",
          params: [networkConfig],
        });
        console.log(`✅ Added ${chainConfig.name} to MetaMask`);
      } catch (addError) {
        console.error(`❌ Failed to add ${chainConfig.name}:`, addError);
        throw new Error(
          `Please add ${chainConfig.name} to MetaMask manually to continue`
        );
      }
    } else {
      // User rejected or other error
      console.warn(`⚠️ Could not switch to ${chainConfig.name}:`, switchError);
      // Don't throw - SDK might handle this
    }
  }
}

/**
 * Get proper network configuration for MetaMask
 */
function getNetworkConfig(chainConfig: ChainConfig) {
  const chainIdHex = `0x${chainConfig.chainId.toString(16)}`;

  // Return proper configuration based on chain
  switch (chainConfig.chainId) {
    case 11155111: // Sepolia
      return {
        chainId: chainIdHex,
        chainName: "Sepolia Testnet",
        nativeCurrency: {
          name: "Sepolia ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: [
          "https://rpc.sepolia.org",
          "https://ethereum-sepolia-rpc.publicnode.com",
        ],
        blockExplorerUrls: ["https://sepolia.etherscan.io"],
      };

    case 84532: // Base Sepolia
      return {
        chainId: chainIdHex,
        chainName: "Base Sepolia",
        nativeCurrency: {
          name: "Sepolia Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://sepolia.base.org"],
        blockExplorerUrls: ["https://sepolia.basescan.org"],
      };

    case 80002: // Polygon Amoy
      return {
        chainId: chainIdHex,
        chainName: "Polygon Amoy Testnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: ["https://rpc-amoy.polygon.technology"],
        blockExplorerUrls: ["https://amoy.polygonscan.com"],
      };

    case 421614: // Arbitrum Sepolia
      return {
        chainId: chainIdHex,
        chainName: "Arbitrum Sepolia",
        nativeCurrency: {
          name: "Sepolia Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://sepolia.arbiscan.io"],
      };

    case 11155420: // Optimism Sepolia
      return {
        chainId: chainIdHex,
        chainName: "Optimism Sepolia",
        nativeCurrency: {
          name: "Sepolia Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://sepolia.optimism.io"],
        blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
      };

    default:
      // Fallback configuration
      return {
        chainId: chainIdHex,
        chainName: chainConfig.name,
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: [chainConfig.rpcUrl],
        blockExplorerUrls: [],
      };
  }
}

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

    console.log("🌉 Initiating bridge transaction:");
    console.log(
      "  • From:",
      sourceChainConfig.name,
      `(Chain ID: ${sourceChainConfig.chainId})`
    );
    console.log(
      "  • To:",
      targetChainConfig.name,
      `(Chain ID: ${targetChainConfig.chainId})`
    );
    console.log("  • Token:", params.token);
    console.log("  • Amount:", params.amount);

    // Check if Nexus SDK has the bridge method
    if (typeof nexusClient.bridge !== "function") {
      throw new Error(
        "Nexus SDK bridge method not available. Please check the SDK integration."
      );
    }

    // Ensure target network is added to MetaMask
    await ensureNetworkAdded(targetChainConfig);

    console.log(
      "📝 Preparing bridge transaction (MetaMask will prompt for signature)..."
    );

    // Use Nexus SDK to execute the bridge
    // Note: SDK auto-detects source chain from connected wallet
    // Only need to specify destination chain
    const bridgeResult = await nexusClient.bridge({
      token: params.token as any, // ETH, USDC, or USDT
      amount: params.amount,
      chainId: targetChainConfig.chainId as any, // Destination chain
    });

    console.log("✅ Bridge transaction result:", bridgeResult);

    // Check if bridge operation failed
    if (!bridgeResult.success) {
      throw new Error(
        `Bridge operation failed: ${bridgeResult.error || "Unknown error"}`
      );
    }

    // CRITICAL: Check if the explorer URL indicates a 404 or failed intent
    if (bridgeResult.explorerUrl && bridgeResult.explorerUrl.includes("/404")) {
      console.error(
        "❌ Intent creation failed - explorer URL shows 404:",
        bridgeResult.explorerUrl
      );
      throw new Error(
        "Bridge transaction was not created. The intent failed to be registered. This may indicate: " +
          "1) Insufficient funds for gas, " +
          "2) Network connectivity issues, " +
          "3) Nexus SDK testnet is down, or " +
          "4) The bridge path is not supported"
      );
    }

    // Extract transaction hash
    const txHash =
      bridgeResult.transactionHash ||
      bridgeResult.explorerUrl?.split("/intent/")[1];

    // Validate we have some proof of transaction
    if (!txHash && !bridgeResult.explorerUrl) {
      throw new Error(
        "No transaction proof returned. The bridge may not have actually executed."
      );
    }

    return {
      success: true,
      txHash: txHash,
      message: `Bridge initiated: ${params.amount} ${params.token} from ${
        sourceChainConfig.name
      } to ${targetChainConfig.name}. ${
        bridgeResult.explorerUrl ? `Track: ${bridgeResult.explorerUrl}` : ""
      }`,
    };
  } catch (error) {
    console.error("❌ Bridge execution failed:");
    console.error("  Error type:", error?.constructor?.name);
    console.error(
      "  Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("  Full error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Bridge operation failed. Check console for details.",
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

    console.log("🚀 Initiating Bridge & Execute transaction:");
    console.log(
      "  • From:",
      sourceChainConfig.name,
      `(Chain ID: ${sourceChainConfig.chainId})`
    );
    console.log(
      "  • To:",
      targetChainConfig.name,
      `(Chain ID: ${targetChainConfig.chainId})`
    );
    console.log("  • Token:", params.token);
    console.log("  • Amount:", params.amount);
    console.log("  • Contract:", params.executeContract);
    console.log("  • Function:", params.executeFunction);

    // Check if Nexus SDK has the bridgeAndExecute method
    if (typeof nexusClient.bridgeAndExecute !== "function") {
      throw new Error(
        "Nexus SDK bridgeAndExecute method not available. Please check the SDK integration."
      );
    }

    // Parse function parameters if provided
    let parsedParams: any[];
    try {
      parsedParams = params.executeFunctionParams || [];
    } catch (error) {
      throw new Error("Invalid function parameters");
    }

    console.log(
      "📝 Preparing bridge & execute transaction (MetaMask will prompt for signature)..."
    );

    // Use Nexus SDK bridgeAndExecute
    // Note: This requires contract ABI and dynamic parameter builder
    // For now, this is a simplified version - full implementation would need proper ABI
    const result = await nexusClient.bridgeAndExecute({
      toChainId: targetChainConfig.chainId as any, // Destination chain
      token: params.token as any, // ETH, USDC, or USDT
      amount: params.amount,
      recipient: params.recipientAddress as `0x${string}`,
      execute: {
        contractAddress: params.executeContract,
        contractAbi: [] as any, // TODO: Need actual contract ABI
        functionName: params.executeFunction,
        buildFunctionParams: (token, amount, chainId, userAddress) => ({
          functionParams: parsedParams,
          value: params.executeValue || "0",
        }),
      },
    });

    console.log("✅ Bridge & Execute result:", result);

    // Check if operation failed
    if (!result.success) {
      throw new Error(
        `Bridge & Execute failed: ${result.error || "Unknown error"}`
      );
    }

    // Extract transaction hashes
    const txHash =
      result.executeTransactionHash ||
      result.bridgeTransactionHash ||
      result.bridgeExplorerUrl?.split("/tx/")[1];

    return {
      success: true,
      txHash: txHash,
      message: `Successfully bridged ${params.amount} ${
        params.token
      } and executed ${params.executeFunction} on ${targetChainConfig.name}. ${
        result.executeExplorerUrl
          ? `Explorer: ${result.executeExplorerUrl}`
          : ""
      }`,
    };
  } catch (error) {
    console.error("❌ Bridge & Execute failed:");
    console.error("  Error type:", error?.constructor?.name);
    console.error(
      "  Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("  Full error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Bridge & Execute operation failed. Check console for details.",
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
 * Note: This functionality may not be available in current SDK version
 */
export async function waitForBridgeCompletion(
  txHash: string,
  targetChain: string,
  timeoutMs: number = 300000 // 5 minutes default
): Promise<{ completed: boolean; error?: string }> {
  try {
    console.log(`⏳ Waiting for bridge completion... (txHash: ${txHash})`);

    // Note: waitForBridgeCompletion may not be available in SDK v0.0.1
    // You would need to poll the transaction status manually or use a block explorer API

    console.warn(
      "⚠️ Bridge monitoring not implemented - check transaction on block explorer"
    );

    return {
      completed: false,
      error: "Bridge monitoring not available in current SDK version",
    };
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
 * Note: This functionality may not be available in current SDK version
 */
export async function estimateBridgeTime(
  sourceChain: string,
  targetChain: string
): Promise<number> {
  console.log(
    `Estimating bridge time from ${sourceChain} to ${targetChain}...`
  );

  // Note: estimateBridgeTime may not be available in SDK v0.0.1
  // Return a default estimate
  return 300; // Default 5 minutes
}
