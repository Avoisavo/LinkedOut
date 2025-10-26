const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Minting with account:", signer.address);
    
    // Base Sepolia OFT contract address (from deployment)
    const baseSepoliaOFT = await ethers.getContractAt(
        "MyOFT", 
        "0x1498FECa6fb7525616C369592440B6E8325C3D6D"
    );
    
    // Target address to mint to
    const targetAddress = "0x82A16c0a82452aD07aae296b3E408d6Bcd9C3adf";
    
    const mintAmount = ethers.utils.parseEther("10");
    console.log(`\n🪙 Minting 10 tokens to ${targetAddress} on Base Sepolia...`);
    const tx = await baseSepoliaOFT.mint(targetAddress, mintAmount);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    
    const balance = await baseSepoliaOFT.balanceOf(targetAddress);
    console.log("\n✅ Minting completed!");
    console.log("Balance of", targetAddress, ":", ethers.utils.formatEther(balance), "tokens");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

