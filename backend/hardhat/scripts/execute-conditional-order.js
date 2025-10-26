/**
 * Execute a conditional bridge order (Keeper/Bot script)
 * 
 * This script monitors orders and executes them when price conditions are met
 * 
 * Usage:
 * node scripts/execute-conditional-order.js <orderId>
 * 
 * For continuous monitoring:
 * node scripts/monitor-orders.js
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");
const axios = require("axios");

async function main() {
  // Hard-coded to order ID 1 for this test
  const orderId = 1;
  console.log(`\n🤖 Executing Conditional Order #${orderId}...\n`);

  // Get signers (executor can be anyone - they get a reward!)
  const [executor] = await ethers.getSigners();
  console.log(`🔧 Executor: ${executor.address}`);

  // Load deployed contract
  const conditionalBridgeAddress = (await hre.deployments.get('ConditionalBridge')).address;
  const conditionalBridge = await ethers.getContractAt('ConditionalBridge', conditionalBridgeAddress);

  console.log(`📄 ConditionalBridge: ${conditionalBridgeAddress}`);

  // Get order details
  const order = await conditionalBridge.orders(orderId);
  
  if (order.status !== 0) {
    console.log(`❌ Order is not pending. Status: ${['PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED'][order.status]}`);
    return;
  }

  console.log(`\n📊 Order Details:`);
  console.log(`   User: ${order.user}`);
  console.log(`   Amount: ${ethers.utils.formatEther(order.amount)} tokens`);
  console.log(`   Target Price: $${Number(order.targetPrice) / 1e8}`);
  console.log(`   Condition: ${order.conditionType === 0 ? 'PRICE_ABOVE' : 'PRICE_BELOW'}`);
  console.log(`   Destination EID: ${order.dstEid}`);

  // Step 1: Fetch price update from Pyth Hermes
  console.log(`\n📡 Fetching price update from Pyth Hermes...`);
  
  const priceFeedId = order.priceFeedId;
  const hermesUrl = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${priceFeedId}`;
  
  let priceUpdate;
  try {
    const response = await axios.get(hermesUrl);
    priceUpdate = ['0x' + response.data.binary.data[0]];
    console.log(`✅ Price update fetched`);
  } catch (error) {
    console.error(`❌ Failed to fetch price update:`, error.message);
    return;
  }

  // Step 2: Check if condition is met
  console.log(`\n🔍 Checking condition...`);
  const [conditionMet, currentPrice] = await conditionalBridge.checkOrderCondition(orderId);
  
  console.log(`   Current Price: $${Number(currentPrice) / 1e8}`);
  console.log(`   Target Price: $${Number(order.targetPrice) / 1e8}`);
  console.log(`   Condition Met: ${conditionMet ? '✅ YES' : '❌ NO'}`);

  if (!conditionMet) {
    console.log(`\n⏸️  Condition not met yet. Skipping execution.`);
    return;
  }

  // Step 3: Get update fee
  const pythAddress = await conditionalBridge.pyth();
  const pythABI = [
    "function getUpdateFee(bytes[] calldata updateData) external view returns (uint256 feeAmount)"
  ];
  const pyth = await ethers.getContractAt(pythABI, pythAddress);
  const updateFee = await pyth.getUpdateFee(priceUpdate);
  console.log(`\n💰 Pyth update fee: ${ethers.utils.formatEther(updateFee)} ETH`);

  // Get LayerZero fee quote
  const myOFTAddress = await conditionalBridge.oftToken();
  const myOFT = await ethers.getContractAt('MyOFT', myOFTAddress);
  
  // Calculate executor reward first
  const EXECUTOR_REWARD_BPS = ethers.BigNumber.from(10);
  const executorReward = order.amount.mul(EXECUTOR_REWARD_BPS).div(10000);
  const bridgeAmount = order.amount.sub(executorReward);
  
  // Prepare send parameters for quote
  const recipientBytes32 = ethers.utils.hexZeroPad(order.user, 32);
  const sendParam = {
    dstEid: order.dstEid,
    to: recipientBytes32,
    amountLD: bridgeAmount,
    minAmountLD: bridgeAmount,
    extraOptions: order.lzOptions,
    composeMsg: "0x",
    oftCmd: "0x"
  };
  
  const fee = await myOFT.quoteSend(sendParam, false);
  const nativeFee = fee.nativeFee;
  console.log(`💰 LayerZero fee (quoted): ${ethers.utils.formatEther(nativeFee)} ETH`);
  
  const totalFee = updateFee.add(nativeFee);
  console.log(`💰 Total fee required: ${ethers.utils.formatEther(totalFee)} ETH`);

  // Check executor balance
  const executorBalance = await ethers.provider.getBalance(executor.address);
  if (executorBalance.lt(totalFee)) {
    console.log(`❌ Insufficient ETH balance. Need ${ethers.utils.formatEther(totalFee)} ETH`);
    return;
  }

  // Step 4: Execute the order
  console.log(`\n🚀 Executing order...`);
  
  try {
    const tx = await conditionalBridge.executeOrder(orderId, priceUpdate, {
      value: totalFee,
      gasLimit: 500000, // Adjust as needed
    });

    console.log(`   Transaction sent: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();
    
    console.log(`\n✅ Order executed successfully!`);
    console.log(`   Transaction: ${receipt.hash}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    
    // Calculate executor reward (fixed at 0.1%)
    const EXECUTOR_REWARD_BPS = ethers.BigNumber.from(10);
    const reward = order.amount.mul(EXECUTOR_REWARD_BPS).div(10000);
    console.log(`   Executor reward: ${ethers.utils.formatEther(reward)} tokens (0.1%)`);

    // Get updated order
    const updatedOrder = await conditionalBridge.orders(orderId);
    console.log(`\n📊 Updated Order Status: ${['PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED'][updatedOrder.status]}`);

  } catch (error) {
    console.error(`\n❌ Execution failed:`, error.message);
    
    // Try to parse the error
    if (error.message.includes("Price condition not met")) {
      console.log(`   Reason: Price condition not met (price may have changed)`);
    } else if (error.message.includes("Order expired")) {
      console.log(`   Reason: Order has expired`);
    } else if (error.message.includes("Insufficient fee")) {
      console.log(`   Reason: Insufficient fee for price update`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

