import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import os from "os";
import fs from "fs";
import path from "path";

/**
 * Creates and saves a new wallet for Basename registration
 * This wallet will be saved locally so you can use it to register a Basename
 */
async function createWallet() {
  try {
    console.log("🚀 Creating a new wallet for Basename registration...\n");

    // Configure CDP SDK
    Coinbase.configureFromJson({
      filePath: `${os.homedir()}/Downloads/cdp_api_key.json`,
    });

    // Create wallet on Base Sepolia (testnet)
    // For mainnet, use "base-mainnet" instead
    const networkId = process.env.NETWORK || "base-sepolia";
    const wallet = await Wallet.create({ networkId });
    
    const defaultAddress = await wallet.getDefaultAddress();
    const walletId = wallet.getId();

    console.log("✅ Wallet created successfully!");
    console.log("\n📋 WALLET DETAILS:");
    console.log("═══════════════════════════════════════════════════");
    console.log(`Network:        ${networkId}`);
    console.log(`Wallet ID:      ${walletId}`);
    console.log(`Address:        ${defaultAddress.getId()}`);
    console.log("═══════════════════════════════════════════════════");

    // Save seed to file
    const seedFileName = `wallet-seed-${Date.now()}.json`;
    const seedFilePath = path.join(process.cwd(), seedFileName);
    await wallet.saveSeedToFile(seedFilePath);
    
    console.log(`\n💾 Seed file saved to: ${seedFilePath}`);
    console.log("⚠️  KEEP THIS FILE SAFE - You'll need it to access your wallet!\n");

    // Create .env template
    const envTemplate = `# Basename Registration Environment Variables
# Generated on ${new Date().toISOString()}

# For Base Sepolia Testnet, use: yourname.basetest.eth
# For Base Mainnet, use: yourname.base.eth
BASE_NAME="yourname.basetest.eth"

WALLET_ID="${walletId}"
SEED_FILE_PATH="${seedFilePath}"
`;

    const envFilePath = path.join(process.cwd(), ".env.basename");
    fs.writeFileSync(envFilePath, envTemplate);
    
    console.log(`📝 Environment template created: .env.basename`);
    console.log(`   Edit this file with your desired basename and then:`);
    console.log(`   source .env.basename\n`);

    // Instructions
    console.log("📝 NEXT STEPS:");
    console.log("═══════════════════════════════════════════════════");
    console.log(`1. Fund your wallet with at least 0.002 ETH:`);
    console.log(`   Address: ${defaultAddress.getId()}\n`);
    
    if (networkId === "base-sepolia") {
      console.log(`   Get testnet ETH from:`);
      console.log(`   → https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`);
      console.log(`   → https://bridge.base.org (bridge from Sepolia)\n`);
    } else {
      console.log(`   Bridge ETH to Base Mainnet:`);
      console.log(`   → https://bridge.base.org\n`);
    }

    console.log(`2. Edit .env.basename and set your desired basename`);
    console.log(`   (must end with .basetest.eth for testnet or .base.eth for mainnet)\n`);
    
    console.log(`3. Load environment variables:`);
    console.log(`   source .env.basename\n`);
    
    console.log(`4. Run the registration script:`);
    console.log(`   node src/lib/registerbasename.js`);
    console.log("═══════════════════════════════════════════════════\n");

    // Check balance
    console.log("💰 Checking current balance...");
    const balance = await wallet.getBalance(Coinbase.assets.Eth);
    console.log(`Current balance: ${balance} ETH`);
    
    if (parseFloat(balance) < 0.002) {
      console.log(`⚠️  You need at least 0.002 ETH to register a Basename`);
      console.log(`   Please fund the address above before proceeding.\n`);
    } else {
      console.log(`✅ Wallet has sufficient funds!\n`);
    }

  } catch (error) {
    console.error("❌ Error creating wallet:", error);
    process.exit(1);
  }
}

// Run the script
(async () => {
  await createWallet();
})();

