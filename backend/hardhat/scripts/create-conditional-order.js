/**
 * Create a conditional bridge order
 * 
 * Example: Bridge 0.005 ETH from Base Sepolia to HBAR when ETH price reaches $3800
 * 
 * Usage:
 * node scripts/create-conditional-order.js
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n🤖 Creating Conditional Bridge Order...\n");

  // Get signers
  const [user] = await ethers.getSigners();
  console.log(`👤 User: ${user.address}`);

  // Load deployed contracts
  const myOFTAddress = (await hre.deployments.get('MyOFT')).address;
  const conditionalBridgeAddress = (await hre.deployments.get('ConditionalBridge')).address;

  const myOFT = await ethers.getContractAt('MyOFT', myOFTAddress);
  const conditionalBridge = await ethers.getContractAt('ConditionalBridge', conditionalBridgeAddress);

  console.log(`📄 MyOFT: ${myOFTAddress}`);
  console.log(`📄 ConditionalBridge: ${conditionalBridgeAddress}`);

  // Order parameters
  const amount = ethers.utils.parseEther("0.005"); // 0.005 tokens
  const dstEid = 40285; // Hedera Testnet endpoint ID (EndpointId.HEDERA_V2_TESTNET)
  
  // ETH/USD price feed ID
  const ETH_USD_PRICE_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
  
  // Target price: $3800 (Pyth uses 8 decimals)
  const targetPrice = 3800 * 1e8; // $3800.00
  
  // Condition type: 0 = PRICE_ABOVE, 1 = PRICE_BELOW
  const conditionType = 0; // Execute when price >= $3800
  
  // Expiry: 7 days (or 0 for no expiry)
  const expiryDuration = 7 * 24 * 60 * 60; // 7 days in seconds
  
  // LayerZero options (simplified)
  const lzOptions = "0x"; // Can customize gas limits, etc.

  // Step 1: Check balance
  const balance = await myOFT.balanceOf(user.address);
  console.log(`\n💰 Your balance: ${ethers.utils.formatEther(balance)} tokens`);
  
  if (balance.lt(amount)) {
    console.log(`❌ Insufficient balance. Minting tokens first...`);
    const mintTx = await myOFT.mint(user.address, amount);
    await mintTx.wait();
    console.log(`✅ Minted ${ethers.utils.formatEther(amount)} tokens`);
  }

  // Step 2: Approve ConditionalBridge to spend tokens
  console.log(`\n🔓 Approving ConditionalBridge to spend tokens...`);
  const approveTx = await myOFT.approve(conditionalBridgeAddress, amount);
  await approveTx.wait();
  console.log(`✅ Approval granted`);

  // Step 3: Create the conditional order
  console.log(`\n📝 Creating conditional order...`);
  console.log(`   Amount: ${ethers.utils.formatEther(amount)} tokens`);
  console.log(`   Target Price: $${targetPrice / 1e8}`);
  console.log(`   Condition: Price >= $${targetPrice / 1e8}`);
  console.log(`   Destination: EID ${dstEid}`);
  console.log(`   Expires in: ${expiryDuration / 86400} days`);

  const tx = await conditionalBridge.createOrder(
    amount,
    dstEid,
    ETH_USD_PRICE_ID,
    targetPrice,
    conditionType,
    expiryDuration,
    lzOptions
  );

  const receipt = await tx.wait();
  
  // Parse the OrderCreated event
  const orderCreatedEvent = receipt.logs.find(
    log => log.topics[0] === ethers.utils.id("OrderCreated(uint256,address,uint256,uint32,bytes32,int64,uint8)")
  );
  
  if (orderCreatedEvent) {
    const orderId = ethers.BigNumber.from(orderCreatedEvent.topics[1]).toNumber();
    console.log(`\n✅ Order created successfully!`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Transaction: ${receipt.hash}`);
    
    // Get order details
    const order = await conditionalBridge.orders(orderId);
    console.log(`\n📊 Order Details:`);
    console.log(`   User: ${order.user}`);
    console.log(`   Amount: ${ethers.utils.formatEther(order.amount)} tokens`);
    console.log(`   Target Price: $${Number(order.targetPrice) / 1e8}`);
    console.log(`   Status: ${['PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED'][order.status]}`);
    console.log(`   Created: ${new Date(Number(order.createdAt) * 1000).toLocaleString()}`);
    
    if (order.expiresAt.toNumber() > 0) {
      console.log(`   Expires: ${new Date(order.expiresAt.toNumber() * 1000).toLocaleString()}`);
    }
  }

  // Check current price and condition
  const [conditionMet, currentPrice] = await conditionalBridge.checkOrderCondition(0);
  console.log(`\n📈 Current Status:`);
  console.log(`   Current ETH Price: $${Number(currentPrice) / 1e8}`);
  console.log(`   Condition Met: ${conditionMet ? '✅ YES' : '❌ NO'}`);
  
  if (!conditionMet) {
    console.log(`\n⏳ Waiting for price to reach $${targetPrice / 1e8}...`);
    console.log(`   Your order will be executed automatically by a keeper/bot when the condition is met.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

