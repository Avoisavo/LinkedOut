import { NexusSDK } from "@avail-project/nexus-core";

let nexusClientInstance: NexusSDK | null = null;
let initializationInProgress = false;

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
}

// Supported chains configuration (Testnet)
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 11155111, // Sepolia testnet
    name: "Ethereum Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
  },
  polygon: {
    chainId: 80002, // Polygon Amoy testnet
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
  arbitrum: {
    chainId: 421614, // Arbitrum Sepolia testnet
    name: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  },
  optimism: {
    chainId: 11155420, // Optimism Sepolia testnet
    name: "Optimism Sepolia",
    rpcUrl: "https://sepolia.optimism.io",
  },
  base: {
    chainId: 84532, // Base Sepolia testnet
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
  },
};

/**
 * Initialize Nexus SDK with wallet provider
 * @param provider - Injected wallet provider (MetaMask, WalletConnect, etc.)
 */
export async function initializeNexusClient(provider: any): Promise<NexusSDK> {
  if (!provider) {
    throw new Error("Wallet provider is required to initialize Nexus SDK");
  }

  // If already initialized, return existing instance
  if (nexusClientInstance && isNexusClientInitialized()) {
    console.log("✅ Nexus SDK already initialized");
    return nexusClientInstance;
  }

  // If initialization is in progress, wait and return
  if (initializationInProgress) {
    console.log("⏳ Waiting for ongoing initialization...");
    // Wait for initialization to complete (max 10 seconds)
    for (let i = 0; i < 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (nexusClientInstance && isNexusClientInitialized()) {
        return nexusClientInstance;
      }
    }
    throw new Error("Initialization timed out");
  }

  try {
    initializationInProgress = true;
    console.log("🔧 Initializing Nexus SDK...");

    // Request wallet connection if not already connected
    await provider.request({ method: "eth_requestAccounts" });

    // Switch to Sepolia testnet if not already on it
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex (11155111)
      });
      console.log("✅ Switched to Sepolia testnet");
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
        console.log("✅ Added and switched to Sepolia testnet");
      } else {
        console.warn("Could not switch to Sepolia:", switchError);
      }
    }

    // Create Nexus SDK instance
    const client = new NexusSDK({
      network: "testnet", // Use testnet for safe testing
      debug: true,
    });

    // Initialize with the wallet provider
    console.log("🔗 Connecting to wallet provider...");
    await client.initialize(provider);

    nexusClientInstance = client;

    console.log("✅ Nexus SDK initialized successfully");
    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Nexus SDK:", error);
    nexusClientInstance = null;
    throw error;
  } finally {
    initializationInProgress = false;
  }
}

/**
 * Get the initialized Nexus SDK instance
 */
export function getNexusClient(): NexusSDK {
  if (!nexusClientInstance) {
    throw new Error(
      "Nexus SDK not initialized. Call initializeNexusClient first."
    );
  }
  return nexusClientInstance;
}

/**
 * Check if Nexus SDK is initialized
 */
export function isNexusClientInitialized(): boolean {
  if (!nexusClientInstance) {
    return false;
  }

  // Check if the SDK has the isInitialized method
  if (typeof nexusClientInstance.isInitialized === "function") {
    return nexusClientInstance.isInitialized();
  }

  // Fallback: if instance exists, consider it initialized
  return true;
}

/**
 * Reset Nexus SDK instance
 */
export async function resetNexusClient(): Promise<void> {
  if (nexusClientInstance) {
    await nexusClientInstance.deinit();
  }
  nexusClientInstance = null;
}

/**
 * Get chain configuration by name
 */
export function getChainConfig(chainName: string): ChainConfig {
  const config = SUPPORTED_CHAINS[chainName.toLowerCase()];
  if (!config) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }
  return config;
}

/**
 * Get all supported chain names
 */
export function getSupportedChainNames(): string[] {
  return Object.keys(SUPPORTED_CHAINS);
}
