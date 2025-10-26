const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("\n🌉 Bridging from Base Sepolia to Hedera Testnet");
    console.log("From account:", signer.address);
    
    const baseSepoliaOFT = await ethers.getContractAt(
        "MyOFT", 
        "0x1498FECa6fb7525616C369592440B6E8325C3D6D"
    );
    
    // Check balance before
    const balanceBefore = await baseSepoliaOFT.balanceOf(signer.address);
    console.log("\n📊 Balance on Base Sepolia before:", ethers.utils.formatEther(balanceBefore), "tokens");
    
    console.log("\n💡 To bridge tokens, run the following command:");
    console.log("\nnpx hardhat lz:oft:send \\");
    console.log("  --src-eid 40245 \\");
    console.log("  --dst-eid 40285 \\");
    console.log(`  --to ${signer.address} \\`);
    console.log("  --amount 0.0005 \\");
    console.log("  --network base-sepolia");
    
    console.log("\n📝 Parameters:");
    console.log("  • Source: Base Sepolia (EID: 40245)");
    console.log("  • Destination: Hedera Testnet (EID: 40285)");
    console.log("  • Amount: 0.0005 tokens");
    console.log("  • Recipient:", signer.address);
    
    console.log("\n⏳ This will take a few minutes for cross-chain delivery...");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

