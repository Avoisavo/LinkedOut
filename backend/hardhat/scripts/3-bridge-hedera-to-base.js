const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("\n🌉 Bridging from Hedera Testnet to Base Sepolia");
    console.log("From account:", signer.address);
    
    console.log("\n💡 To bridge tokens back, run the following command:");
    console.log("\nnpx hardhat lz:oft:send \\");
    console.log("  --src-eid 40285 \\");
    console.log("  --dst-eid 40245 \\");
    console.log(`  --to ${signer.address} \\`);
    console.log("  --amount 0.0005 \\");
    console.log("  --network hedera-testnet");
    
    console.log("\n📝 Parameters:");
    console.log("  • Source: Hedera Testnet (EID: 40285)");
    console.log("  • Destination: Base Sepolia (EID: 40245)");
    console.log("  • Amount: 0.0005 tokens");
    console.log("  • Recipient:", signer.address);
    
    console.log("\n⏳ This will take a few minutes for cross-chain delivery...");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

